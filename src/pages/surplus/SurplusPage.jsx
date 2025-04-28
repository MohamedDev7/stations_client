import React, { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import TopBar from "../../components/TopBar/TopBar";
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
	Card,
	CardBody,
	CardHeader,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import {
	Eye,
	X,
	DotsVertical,
	Printer,
	Trash,
	Edit,
	Save,
} from "@mynaui/icons-react";
import { useNavigate } from "react-router-dom";
import { deleteSurplus, getAllSurpluses } from "../../api/serverApi";
import tafqeet from "../../utils/Tafqeet";

const SurplusesPage = () => {
	//hooks
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	//states
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState("");
	const [total, setTotal] = useState("");
	const [surpluses, setSurpluses] = useState([]);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [modal, setModal] = useState({
		header: "",
		body: "",
		footer: "",
	});
	//queries
	useQuery({
		queryKey: ["surpluses", page - 1, rowsPerPage],
		queryFn: getAllSurpluses,
		select: (res) => {
			return res.data;
		},
		onSuccess: (data) => {
			setPages(Math.ceil(data.total / rowsPerPage));
			setTotal(data.total);
			setSurpluses(data.surpluses);
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteSurplus,
		onSuccess: (res) => {
			queryClient.invalidateQueries("surpluses");
			toast.success("تم حذف الفائض بنجاح", {
				position: "top-center",
			});
			setModal({
				header: "",
				body: "",
				footer: "",
			});
			onClose();
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
			setModal({
				header: "",
				body: "",
				footer: "",
			});
			onClose();
		},
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
							<Save />
							إضافة
						</Button>
					</>
				}
			/>
			<div className="w-full p-5 pb-16">
				<Card>
					<CardHeader className="bg-primary text-default-50 font-bold text-medium">
						الفائض
					</CardHeader>
					<CardBody>
						<Table
							aria-label="table"
							bottomContent={
								<div className="py-2 px-2 flex justify-between items-center">
									<span className="text-default-400 text-small">
										الاجمالي {total} وارد
									</span>
									<Pagination
										isCompact
										showControls
										showShadow
										color="primary"
										page={page}
										total={pages}
										onChange={setPage}
										// dir="ltr"
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
								<TableColumn>التاريخ</TableColumn>
								<TableColumn>المحطة</TableColumn>
								<TableColumn>المخزن</TableColumn>
								<TableColumn>المادة</TableColumn>
								<TableColumn>الكمية</TableColumn>
								<TableColumn>خيارات</TableColumn>
							</TableHeader>
							<TableBody>
								{surpluses &&
									surpluses.map((surpluse) => {
										const disabledActions = [];
										if (
											surpluse.state === "approved" ||
											surpluse.stocktaking_id
										) {
											disabledActions.push("delete", "edit");
										}
										return (
											<TableRow key={surpluse.id}>
												<TableCell>{surpluse.movment.date}</TableCell>
												<TableCell>{surpluse.station.name}</TableCell>
												<TableCell>{surpluse.store.name}</TableCell>
												<TableCell>{surpluse.store.substance.name}</TableCell>
												<TableCell>{surpluse.amount}</TableCell>
												<TableCell>
													<div className="relative flex justify-center items-center gap-2">
														<Dropdown>
															<DropdownTrigger>
																<Button isIconOnly variant="light">
																	<DotsVertical size="40" />
																</Button>
															</DropdownTrigger>
															<DropdownMenu
																disabledKeys={disabledActions}
																onAction={(key) => {
																	if (key === "delete") {
																		setModal((prev) => {
																			return {
																				...prev,
																				header: "حذف فائض",
																				body: (
																					<div>
																						هل أنت متأكد من حذف الفائض لـ
																						<span
																							style={{
																								fontWeight: "bold",
																								fontSize: "16px",
																								color: "#b33c37",
																							}}
																						>{` ${surpluse.station.name} `}</span>
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
																									surpluse.id
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
																		const dataToPrint = `${surpluse.movment.date
																			.split("T")[0]
																			.replace(/-/g, "/")}`;
																		navigate("./print", {
																			state: {
																				data: {
																					...surpluse,
																					type: "فائض",
																					doc_amount: surpluse.amount,
																					amount_difference:
																						surpluse.amount -
																						surpluse.doc_amount,
																					date: dataToPrint,
																					store: `${surpluse.store.name}-${surpluse.store.substance.name}`,
																					amount_text: tafqeet(surpluse.amount),
																					station_name: surpluse.station.name,
																				},
																				reportTemplate: "receipt2",
																			},
																		});
																	}
																}}
															>
																<DropdownItem
																	key="edit"
																	startContent={<Edit />}
																>
																	تعديل
																</DropdownItem>
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

export default SurplusesPage;
