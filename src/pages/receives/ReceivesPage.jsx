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
import { deleteReceive, getAllReceives } from "../../api/serverApi";
import tafqeet from "@/utils/Tafqeet";
const ReceivesPage = () => {
	//hooks
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	//states
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState("");
	const [total, setTotal] = useState("");
	const [receives, setReceives] = useState([]);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [modal, setModal] = useState({
		header: "",
		body: "",
		footer: "",
	});
	//queries
	useQuery({
		queryKey: ["receives", page - 1, rowsPerPage],
		queryFn: getAllReceives,
		select: (res) => {
			return res.data;
		},
		onSuccess: (data) => {
			setPages(Math.ceil(data.total / rowsPerPage));
			setTotal(data.total);
			setReceives(data.receives);
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteReceive,
		onSuccess: (res) => {
			queryClient.invalidateQueries("receives");
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
	const columns = [
		{ field: "date", headerName: "التاريخ", width: 200 },
		{ field: "amount", headerName: "المبلغ", width: 200 },
		{ field: "statement", headerName: "البيان", width: 200 },
		{ field: "employee", headerName: "العامل", width: 200 },
		{
			field: "actions",
			filterable: false,
			headerName: "خيارات",
			width: 250,
			renderCell: (params) => {
				return (
					<div style={{ display: "flex", gap: "10px" }}>
						<Tooltip content="تعديل" relationship="label">
							<Button
								appearance="primary"
								icon={<EditRegular />}
								size="medium"
								{...restoreFocusTargetAttribute}
								onClick={() => {
									navigate("./edit", {
										state: { id: params.id },
									});
								}}
							/>
						</Tooltip>
						<Tooltip content="حذف" relationship="label">
							<Button
								style={{
									backgroundColor: "#b33c37",
								}}
								appearance="primary"
								icon={<DeleteRegular />}
								size="medium"
								{...restoreFocusTargetAttribute}
								onClick={() => {
									setDialog((prev) => {
										return {
											...prev,
											isOpened: true,
											title: "حذف",
											content: (
												<DialogContent>هل أنت متأكد من الحذف ؟</DialogContent>
											),
											actions: (
												<DialogActions>
													<DialogTrigger disableButtonEnhancement>
														<Button appearance="secondary">الغاء</Button>
													</DialogTrigger>
													<Button
														appearance="primary"
														onClick={() => {
															deleteMutation.mutate(params.id);
														}}
													>
														تأكيد
													</Button>
												</DialogActions>
											),
										};
									});
								}}
							/>
						</Tooltip>
					</div>
				);
			},
		},
	];
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
				{/* <Card title="الاستلامات">
					<div style={{ margin: "20px 0" }}>
						{receives && receives.length > 0 ? (
							<Table rows={receives} columns={columns} />
						) : (
							<EmptyContainer />
						)}
					</div>
				</Card> */}
				<Card>
					<CardHeader className="bg-primary text-default-50 font-bold text-medium">
						الاستلامات
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
								<TableColumn>المبلغ</TableColumn>
								{/* <TableColumn>البيان</TableColumn> */}
								<TableColumn>العامل</TableColumn>
								<TableColumn>خيارات</TableColumn>
							</TableHeader>
							<TableBody>
								{receives &&
									receives.map((receive) => {
										const disabledActions = [];

										return (
											<TableRow key={receive.id}>
												<TableCell>{receive.date}</TableCell>
												<TableCell>{receive.station.name}</TableCell>
												<TableCell>{receive.amount}</TableCell>
												<TableCell>{receive.employee.name}</TableCell>
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
																						>{` ${receive.id} `}</span>
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
																									receive.id
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
																		const dataToPrint = `${receive.date
																			.split("T")[0]
																			.replace(/-/g, "/")}`;
																		navigate("./print", {
																			state: {
																				data: {
																					...receive,
																					date: dataToPrint,
																					station_name: receive.station.name,
																					employee_name: receive.employee.name,
																					amount_text: tafqeet(receive.amount),
																				},
																				reportTemplate: "receipt3",
																			},
																		});
																	}
																	if (key === "edit") {
																		navigate("./edit", {
																			state: { id: receive.id },
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

export default ReceivesPage;
