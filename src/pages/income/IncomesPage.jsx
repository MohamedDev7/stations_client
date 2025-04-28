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
} from "@mynaui/icons-react";
import { useNavigate } from "react-router-dom";
import { deleteIncome, getAllIncomes } from "../../api/serverApi";
import tafqeet from "../../utils/Tafqeet";

const IncomesPage = () => {
	//hooks
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	//states
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState("");
	const [total, setTotal] = useState("");
	const [incomes, setIncomes] = useState([]);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [modal, setModal] = useState({
		header: "",
		body: "",
		footer: "",
	});
	//queries
	useQuery({
		queryKey: ["incomes", page - 1, rowsPerPage],
		queryFn: getAllIncomes,
		select: (res) => {
			return res.data;
		},
		onSuccess: (data) => {
			setPages(Math.ceil(data.total / rowsPerPage));
			setTotal(data.total);
			setIncomes(data.incomes);
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteIncome,
		onSuccess: (res) => {
			toast.success("تم حذف الوارد بنجاح", {
				position: "top-center",
			});
			queryClient.invalidateQueries({
				queryKey: ["incomes", page - 1, rowsPerPage],
			});
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
			setDialog({
				isOpened: false,
				title: "",
				content: "",
				actions: "",
			});
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
							إضافة
						</Button>
					</>
				}
			/>
			<div className="w-full p-5 pb-16">
				<Card>
					<CardHeader className="bg-primary text-default-50 font-bold text-medium">
						الواردات
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
								{incomes &&
									incomes.map((income) => {
										const disabledActions = [];
										if (income.state === "approved") {
											disabledActions.push("delete");
											disabledActions.push("edit");
										}
										return (
											<TableRow key={income.id}>
												<TableCell>{income.movment.date}</TableCell>
												<TableCell>{income.station.name}</TableCell>
												<TableCell>{income.store.name}</TableCell>
												<TableCell>{income.store.substance.name}</TableCell>
												<TableCell>{income.amount}</TableCell>
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
																				header: "حذف وارد",
																				body: (
																					<div>
																						هل أنت متأكد من حذف الوارد لـ
																						<span
																							style={{
																								fontWeight: "bold",
																								fontSize: "16px",
																								color: "#b33c37",
																							}}
																						>{` ${income.station.name} `}</span>
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
																									income.id
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
																		const dataToPrint = `${income.movment.date
																			.split("T")[0]
																			.replace(/-/g, "/")}`;
																		navigate("./print", {
																			state: {
																				data: {
																					...income,
																					type: "وارد",
																					amount_difference:
																						income.amount - income.doc_amount,
																					date: dataToPrint,
																					store: `${income.store.name}-${income.store.substance.name}`,
																					amount_text: tafqeet(income.amount),
																				},
																				reportTemplate: "receipt1",
																			},
																		});
																	}

																	if (key === "open") {
																		setModal((prev) => {
																			return {
																				...prev,
																				header: "فتح حركة",
																				body: (
																					<div>
																						<div>
																							هل أنت متأكد من فتح الحركة بتاريخ
																							<span
																								style={{
																									fontWeight: "bold",
																									fontSize: "16px",
																									color: "#b33c37",
																								}}
																							>{` ${movment.date} `}</span>
																							لـ
																							<span
																								style={{
																									fontWeight: "bold",
																									fontSize: "16px",
																									color: "#b33c37",
																								}}
																							>{` ${movment["station.name"]} `}</span>
																							؟
																						</div>

																						<div className="text-danger-500 mt-5 text-xs font-bold">
																							*ملاحظة:سيتم فتح جميع التواريخ بعد
																							{movment.date}!
																						</div>
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
																								updateMovmentStateMutation.mutate(
																									{
																										state: "pending",
																										movment_id: movment.id,
																										station_id:
																											movment.station_id,
																										date: movment.date,
																									}
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

export default IncomesPage;
