import React, { useEffect, useState } from "react";
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
	DatePicker,
	Select,
	SelectItem,
} from "@heroui/react";
import { DotsVertical, Printer, Trash, Edit } from "@mynaui/icons-react";
import { useSearchParams } from "react-router-dom";
import useNavigateWithQuery from "./../../hooks/useNavigateWithQuery";
import {
	deleteIncome,
	getAllIncomes,
	getAllStations,
	getAllSubstances,
} from "@/api/serverApi";
import tafqeet from "../../utils/Tafqeet";
import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";
import { parseDate } from "@internationalized/date";
const IncomesPage = () => {
	//hooks
	const navigate = useNavigateWithQuery();
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	//states
	// const [incomes, setIncomes] = useState([]);
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get("page")) || 1;
	const rowsPerPage = parseInt(searchParams.get("rowsPerPage")) || 5;
	const [pages, setPages] = useState(1);
	const [total, setTotal] = useState("");
	const [modal, setModal] = useState({
		header: "",
		body: "",
		footer: "",
	});
	const rawEndDate = searchParams.get("endDate");
	const rawStartDate = searchParams.get("startDate");
	const selectedStations = searchParams.get("selectedStations")
		? searchParams.get("selectedStations").split(",").filter(Boolean)
		: [];
	const startDate =
		rawStartDate && rawStartDate !== "null" ? parseDate(rawStartDate) : null;
	const endDate =
		rawEndDate && rawEndDate !== "null" ? parseDate(rawEndDate) : null;
	const substance = searchParams.get("substance")
		? searchParams.get("substance").split(",").filter(Boolean)
		: [];
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => {
				return { key: el.id, text: el.name };
			});
		},
	});
	const { data: incomes } = useQuery({
		queryKey: [
			"incomes",
			page - 1,
			rowsPerPage,
			selectedStations,
			startDate,
			endDate,
		],
		queryFn: getAllIncomes,
		select: (res) => {
			return res.data;
		},
		onSuccess: (data) => {
			setPages(Math.ceil(data.total / rowsPerPage));
			setTotal(data.total);
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	const { data: substances } = useQuery({
		queryKey: ["substances"],
		queryFn: getAllSubstances,
		select: (res) => {
			return res.data.substances.map((el) => {
				return { key: el.id, text: el.name };
			});
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteIncome,
		onSuccess: () => {
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
			setModal({
				title: "",
				content: "",
				actions: "",
			});
		},
	});
	//functions

	const updateParams = (params, resetPage = false) => {
		const newParams = {
			page: resetPage ? "1" : page.toString(),
			rowsPerPage: rowsPerPage.toString(),
		};
		// Preserve existing params
		if (startDate) newParams.startDate = startDate.toString();
		if (endDate) newParams.endDate = endDate.toString();
		if (selectedStations.length > 0)
			newParams.selectedStations = selectedStations.join(",");
		if (substance.length > 0) newParams.substance = substance.join(",");

		// Apply new params
		Object.entries(params).forEach(([key, value]) => {
			if (value === null || value === "" || value === undefined) {
				delete newParams[key];
			} else if (typeof value === "object" && value.toString) {
				newParams[key] = value.toString();
			} else {
				newParams[key] = value;
			}
		});

		setSearchParams(newParams);
	};

	const onRowsPerPageChange = (e) => {
		const newRowsPerPage = Number(e.target.value);
		updateParams({ rowsPerPage: newRowsPerPage.toString(), page: "1" });
	};

	const handlePageChange = (newPage) => {
		updateParams({ page: newPage.toString() });
	};

	const handleStationsChange = (e) => {
		const value = e.target.value;
		updateParams({ selectedStations: value || null }, true);
	};

	const handleStartDateChange = (date) => {
		updateParams({ startDate: date || null }, true);
	};

	const handleEndDateChange = (date) => {
		updateParams({ endDate: date || null }, true);
	};
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
						<div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
							<Select
								label="اسم المحطة"
								multiple
								className="max-w-xs"
								onChange={handleStationsChange}
								size="sm"
								selectedKeys={selectedStations}
								selectionMode="multiple"
							>
								{stations &&
									stations.map((station) => {
										return (
											<SelectItem key={station.key}>{station.text}</SelectItem>
										);
									})}
							</Select>
							<DatePicker
								label="من تاريخ"
								required
								value={startDate}
								className="max-w-xs"
								size="sm"
								onChange={handleStartDateChange}
							/>
							<DatePicker
								label="الى تاريخ "
								required
								value={endDate}
								className="max-w-xs"
								size="sm"
								onChange={handleEndDateChange}
							/>
							{/* <Select
								label="المادة"
								multiple
								className="max-w-xs"
								onChange={(e) => {
									const selectedSet = new Set(e.target.value.split(","));
									setSubstance(Array.from(selectedSet));
									updateParams({ substance: e.target.value });
								}}
								size="sm"
								selectedKeys={substance}
								selectionMode="multiple"
							>
								{substances &&
									substances.map((substance) => {
										return (
											<SelectItem key={substance.key}>
												{substance.text}
											</SelectItem>
										);
									})}
							</Select> */}
						</div>
						{incomes && incomes.incomes.length > 0 ? (
							<Table
								aria-labelledby="table"
								bottomContent={
									<div className="py-2 px-2 flex justify-between items-center">
										<span className="text-default-400 text-small">
											الاجمالي {total} حركة
										</span>
										<Pagination
											key={pages}
											isCompact
											showControls
											showShadow
											color="primary"
											page={page}
											total={pages}
											onChange={handlePageChange}
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
									{incomes.incomes &&
										incomes.incomes.map((income) => {
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
																			console.log(`test`, {
																				...income,
																				type: "وارد",
																				amount_difference:
																					income.amount - income.doc_amount,
																				date: dataToPrint,
																				store: `${income.store.name}-${income.store.substance.name}`,
																				amount_text: tafqeet(income.amount),
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
																								هل أنت متأكد من فتح الحركة
																								بتاريخ
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
																								*ملاحظة:سيتم فتح جميع التواريخ
																								بعد
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
						) : (
							<EmptyContainer />
						)}
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default IncomesPage;
