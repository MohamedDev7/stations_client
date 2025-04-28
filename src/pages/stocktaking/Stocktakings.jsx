import React, { useRef, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";

import { useNavigate } from "react-router-dom";

import { useMutation, useQuery, useQueryClient } from "react-query";
import {
	deleteStocktaking,
	getAllStocktaking,
	getStocktakingPriceReport,
} from "../../api/serverApi";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Pagination,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Card,
	CardBody,
	CardHeader,
} from "@heroui/react";
import {
	Check,
	X,
	DotsVertical,
	Printer,
	Trash,
	Edit,
} from "@mynaui/icons-react";
import { toast } from "react-toastify";
const Stocktakings = () => {
	//hooks
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	//states
	const [stocktakingToFetch, setStocktakingToFetch] = useState("");
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState("");
	const [total, setTotal] = useState("");
	const [rowsPerPage, setRowsPerPage] = useState(5);

	//states
	const [modal, setModal] = useState({
		header: "",
		body: "",
		footer: "",
	});

	//queries
	const { data: stocktakings } = useQuery({
		queryKey: ["stocktakings", page - 1, rowsPerPage],
		queryFn: getAllStocktaking,
		select: (res) => {
			return res.data;
		},
		onSuccess: (data) => {
			setPages(Math.ceil(data.total / rowsPerPage));
			setTotal(data.total);
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteStocktaking,
		onSuccess: (res) => {
			queryClient.invalidateQueries("stocktakings");
			toast.success("تم حذف الجرد بنجاح", {
				position: "top-center",
			});
			queryClient.invalidateQueries({ queryKey: ["stocktakings"] });
			setModal({
				title: "",
				content: "",
				actions: "",
			});
			onClose();
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
			setModal({
				title: "",
				content: "",
				actions: "",
			});
			onClose();
		},
	});
	const { data, isLoading } = useQuery({
		queryKey: ["stocktakingPrice", stocktakingToFetch],
		queryFn: getStocktakingPriceReport,
		onSuccess: (data) => {
			setStocktakingToFetch("");
			navigate("./print", {
				state: {
					data: data.data.data,
					reportTemplate:
						data.data.data.stocktaking.type === "تسعيرة"
							? "stocktakingPriceReport"
							: "stocktakingReport",
				},
			});
		},
		onError: () => {
			setStocktakingToFetch("");
		},
		enabled: !!stocktakingToFetch,
	});
	//functions
	const onRowsPerPageChange = React.useCallback((e) => {
		setRowsPerPage(Number(e.target.value));
		setPage(1);
	}, []);

	return (
		<div className="w-full h-full overflow-auto ">
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								{modal.header}
							</ModalHeader>
							<ModalBody>{modal.body}</ModalBody>
							<ModalFooter>{modal.footer}</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
			<TopBar
				right={
					<>
						<Button
							color="primary"
							onPress={() => {
								navigate("./add");
							}}
						>
							إضافة جرد
						</Button>
					</>
				}
			/>
			<div className="w-full p-5 pb-16">
				<Card>
					<CardHeader className="bg-primary text-default-50 font-bold text-medium">
						جرد المحطات
					</CardHeader>
					<CardBody>
						<Table
							aria-labelledby="table"
							bottomContent={
								<div className="py-2 px-2 flex justify-between items-center">
									<span className="text-default-400 text-small">
										الاجمالي {total} جرد
									</span>
									<Pagination
										isCompact
										showControls
										showShadow
										color="primary"
										page={page}
										total={pages}
										onChange={setPage}
									/>
									<label className="flex items-center text-default-400 text-small">
										النتائج لكل صفحة:
										<select
											className="bg-transparent outline-none text-default-400 text-small"
											onChange={onRowsPerPageChange}
											value={rowsPerPage}
										>
											<option value="5">5</option>
											<option value="10">10</option>
											<option value="15">15</option>
										</select>
									</label>
								</div>
							}
							bottomContentPlacement="outside"
						>
							<TableHeader>
								<TableColumn>رقم المحضر</TableColumn>
								<TableColumn>المحطة</TableColumn>
								<TableColumn>التاريخ</TableColumn>
								<TableColumn>النوع</TableColumn>
								<TableColumn>خيارات</TableColumn>
							</TableHeader>
							<TableBody>
								{stocktakings &&
									stocktakings.stocktaking.map((stocktaking) => {
										return (
											<TableRow key={stocktaking.id}>
												<TableCell>{stocktaking.id}</TableCell>
												<TableCell>{stocktaking.station.name}</TableCell>
												<TableCell>{stocktaking.date}</TableCell>
												<TableCell>{stocktaking.type}</TableCell>
												<TableCell>
													<div className="relative flex justify-center items-center gap-2">
														<Dropdown>
															<DropdownTrigger>
																<Button isIconOnly variant="light">
																	<DotsVertical size="40" />
																</Button>
															</DropdownTrigger>
															<DropdownMenu
																onAction={(key) => {
																	if (key === "delete") {
																		setModal((prev) => {
																			return {
																				...prev,
																				header: "حذف محضر جرد",
																				body: (
																					<div>
																						هل أنت متأكد من حذف محضر الجرد برقم
																						<span
																							style={{
																								fontWeight: "bold",
																								fontSize: "16px",
																								color: "#b33c37",
																							}}
																						>{` ${stocktaking.id} `}</span>
																						لـ
																						<span
																							style={{
																								fontWeight: "bold",
																								fontSize: "16px",
																								color: "#b33c37",
																							}}
																						>{` ${stocktaking.station.name} `}</span>
																						؟
																					</div>
																				),
																				footer: (
																					<div className=" flex gap-5">
																						<Button
																							onPress={() => {
																								onClose();
																							}}
																							color="warning"
																						>
																							الغاء
																						</Button>
																						<Button
																							color="primary"
																							onPress={() => {
																								deleteMutation.mutate(
																									stocktaking.id
																								);
																							}}
																						>
																							تأكيد
																						</Button>
																					</div>
																				),
																			};
																		});
																		onOpen();
																	}
																	if (key === "print") {
																		setStocktakingToFetch(stocktaking.id);
																	}
																}}
															>
																<DropdownItem
																	key="print"
																	startContent={<Printer />}
																>
																	طباعة
																</DropdownItem>
																<DropdownItem
																	key="delete"
																	className="text-danger"
																	color="danger"
																	startContent={<Trash />}
																>
																	حذف
																</DropdownItem>
															</DropdownMenu>
														</Dropdown>
													</div>
												</TableCell>
											</TableRow>
										);
									})}
							</TableBody>
						</Table>
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default Stocktakings;
