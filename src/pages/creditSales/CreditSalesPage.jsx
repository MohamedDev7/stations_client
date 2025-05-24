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
import { DotsVertical, Printer, Trash, Edit, Plus } from "@mynaui/icons-react";
import { useNavigate } from "react-router-dom";
import { getAllCreditSales } from "../../api/serverApi";
import tafqeet from "@/utils/Tafqeet";
const CreditSalesPage = () => {
	//hooks
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	//states
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState("");
	const [total, setTotal] = useState("");
	const [creditSales, setCreditSales] = useState([]);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [modal, setModal] = useState({
		header: "",
		body: "",
		footer: "",
	});
	//queries
	useQuery({
		queryKey: ["creditSales", page - 1, rowsPerPage],
		queryFn: getAllCreditSales,
		select: (res) => {
			return res.data;
		},
		onSuccess: (data) => {
			setPages(Math.ceil(data.total / rowsPerPage));
			setTotal(data.total);
			setCreditSales(data.creditSales);
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
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
					{() => (
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
							<Plus />
							إضافة
						</Button>
					</>
				}
			/>
			<div className="w-full p-5 pb-16">
				<Card>
					<CardHeader className="bg-primary text-default-50 font-bold text-medium">
						المبيعات الآجلة
					</CardHeader>
					<CardBody>
						<Table
							aria-label="table"
							bottomContent={
								<div className="py-2 px-2 flex justify-between items-center">
									<span className="text-default-400 text-small">
										الاجمالي {total} نتيجة
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
								<TableColumn>الكمية</TableColumn>
								<TableColumn>القيمة</TableColumn>
								<TableColumn>الحالة</TableColumn>
								<TableColumn>تاريخ السداد</TableColumn>
								{/* <TableColumn>البيان</TableColumn> */}
								{/* <TableColumn>خيارات</TableColumn> */}
							</TableHeader>
							<TableBody>
								{creditSales &&
									creditSales.map((creditSale) => {
										const disabledActions = [];

										return (
											<TableRow key={creditSale.id}>
												<TableCell>{creditSale.movment.date}</TableCell>
												<TableCell>{creditSale.station.name}</TableCell>
												<TableCell>{creditSale.amount}</TableCell>
												<TableCell>
													{creditSale.amount * creditSale.price}
												</TableCell>
												<TableCell>
													{creditSale.isSettled ? "تم التسديد" : "غير مسدد"}
												</TableCell>
												<TableCell>
													{creditSale.settlement_date
														? creditSale.settlement_date
														: "-"}
												</TableCell>

												{/* <TableCell>
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
																				header: "حذف استلام",
																				body: (
																					<div>
																						هل أنت متأكد من حذف الاستلام
																						<span
																							style={{
																								fontWeight: "bold",
																								fontSize: "16px",
																								color: "#b33c37",
																							}}
																						>{` ${creditSale.id} `}</span>
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
																									creditSale.id
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
																		const dataToPrint = `${creditSale.date
																			.split("T")[0]
																			.replace(/-/g, "/")}`;
																		navigate("./print", {
																			state: {
																				data: {
																					...creditSale,
																					date: dataToPrint,
																					station_name: creditSale.station.name,
																					employee_name:
																						creditSale.employee.name,
																					amount_text: tafqeet(
																						creditSale.amount
																					),
																				},
																				reportTemplate: "receipt3",
																			},
																		});
																	}
																	if (key === "edit") {
																		navigate("./edit", {
																			state: { id: creditSale.id },
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
												</TableCell> */}
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

export default CreditSalesPage;
