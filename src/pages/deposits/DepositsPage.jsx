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
import { deleteDeposit, getAllDeposits } from "../../api/serverApi";

const DepositsPage = () => {
	//hooks
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	//states
	const [deposits, setDeposits] = useState([]);
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState("");
	const [total, setTotal] = useState("");
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [modal, setModal] = useState({
		header: "",
		body: "",
		footer: "",
	});
	//queries
	useQuery({
		queryKey: ["deposits", page - 1, rowsPerPage],
		queryFn: getAllDeposits,
		select: (res) => {
			return res.data;
		},
		onSuccess: (data) => {
			setPages(Math.ceil(data.total / rowsPerPage));
			setTotal(data.total);
			setDeposits(data.deposits);
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteDeposit,
		onSuccess: (res) => {
			queryClient.invalidateQueries("deposits");
			toast.success("تم الحذف بنجاح", {
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
							<Plus />
							إضافة
						</Button>
					</>
				}
			/>
			<div className="w-full p-5 pb-16">
				<Card title="الصرافات">
					<CardHeader className="bg-primary text-default-50 font-bold text-medium">
						الايداعات
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
								<TableColumn>تاريخ الاشعار</TableColumn>
								<TableColumn>تاريخ الحركة</TableColumn>
								<TableColumn>المحطة</TableColumn>
								<TableColumn>المبلغ</TableColumn>
								<TableColumn>الصرافة</TableColumn>
								<TableColumn>رقم الاشعار</TableColumn>
								<TableColumn>خيارات</TableColumn>
							</TableHeader>
							<TableBody>
								{deposits &&
									deposits.map((deposit) => {
										const disabledActions = [];

										return (
											<TableRow key={deposit.id}>
												<TableCell>{deposit.invoice_date}</TableCell>
												<TableCell>{deposit.date}</TableCell>
												<TableCell>{deposit.station.name}</TableCell>
												<TableCell>{deposit.amount}</TableCell>
												<TableCell>{deposit.bank.name}</TableCell>
												<TableCell>{deposit.number}</TableCell>
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
																				header: "حذف ايداع",
																				body: (
																					<div>
																						هل أنت متأكد من حذف الايداع
																						<span
																							style={{
																								fontWeight: "bold",
																								fontSize: "16px",
																								color: "#b33c37",
																							}}
																						>{` ${deposit.id} `}</span>
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
																									deposit.id
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
																		navigate("./print", {
																			state: {
																				data: {
																					...deposit,
																					station_name: deposit.station.name,
																					employee_name: deposit.employee.name,
																					amount_text: tafqeet(deposit.amount),
																				},
																				reportTemplate: "receipt3",
																			},
																		});
																	}
																	if (key === "edit") {
																		navigate("./edit", {
																			state: { id: deposit.id },
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
																{/* <DropdownItem
																	key="print"
																	startContent={<Printer />}
																>
																	طباعة
																</DropdownItem> */}
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

export default DepositsPage;
