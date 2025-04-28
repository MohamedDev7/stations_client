import React, { useContext, useMemo, useRef, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../store/auth-context";
import {
	changeMovmentState,
	deleteMovment,
	getAllMovments,
	getAllStations,
	getMovmentData,
} from "../../api/serverApi";

import {
	Check,
	X,
	DotsVertical,
	Printer,
	Trash,
	Edit,
} from "@mynaui/icons-react";

import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Select,
	SelectItem,
	DateRangePicker,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Badge,
	Pagination,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Card,
	CardBody,
	CardHeader,
} from "@heroui/react";
const DailyMovments = () => {
	//hooks
	const navigate = useNavigate();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const authCtx = useContext(AuthContext);
	const queryClient = useQueryClient();

	//states
	const [modal, setModal] = useState({
		header: "",
		body: "",
		footer: "",
	});

	const [page, setPage] = useState(1);
	const [pages, setPages] = useState("");
	const [total, setTotal] = useState("");
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [movmentToFetch, setMovmentToFetch] = useState(null);

	const [filters, setFilters] = useState({
		stations: [],
		date: { start: null, end: null },
	});

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
	const { data: movmentReport } = useQuery({
		queryKey: ["movmentReport", movmentToFetch?.movment_id],
		queryFn: getMovmentData,
		select: (res) => {
			const dispensers = res.data.dispensersMovment.map((el) => {
				return {
					number: el.number,
					prev_A: el.prev_A,
					curr_A: el.curr_A,
					prev_B: el.prev_B,
					curr_B: el.curr_B,
					total: el.curr_A - el.prev_A + el.curr_B - el.prev_B,
					substance_id: el.substance_id,
					substance: el.substance,
				};
			});

			const groupedDispensers = dispensers.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.substance_id === item.substance_id
				);

				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						title: `حركة عدادات ال${item.substance}`,
						substance_id: item.substance_id,
						data: [item],
					});
				}

				return acc;
			}, []);
			const stores = res.data.storesMovment.map((el) => {
				let totalIncome = 0;
				let totalCoupons = 0;

				const filteredIncomes = res.data.incomes.filter(
					(ele) => ele.store_id === el.store_id
				);
				const filteredSurplus = res.data.surplus.filter(
					(ele) => ele.store_id === el.store_id
				);
				const filteredCalibrations = res.data.calibrations.filter(
					(ele) => ele.store_id === el.store_id
				);
				const filteredCoupons = res.data.coupons.filter(
					(ele) => ele.store_id === el.store_id
				);
				const filteredData = [
					...filteredIncomes,
					...filteredSurplus,
					...filteredCalibrations,
				];
				let totalCalibrations = 0;
				filteredCalibrations.forEach(
					(ele) => (totalCalibrations = totalCalibrations + ele.amount)
				);

				if (filteredData.length > 0) {
					filteredData.forEach((ele) => {
						totalIncome = totalIncome + ele?.amount;
					});
				}
				if (filteredCoupons.length > 0) {
					filteredCoupons.forEach((ele) => {
						totalCoupons = totalCoupons + ele?.amount;
					});
				}

				return {
					name: el.name,
					prev_value: el.prev_value,
					curr_value: el.curr_value,
					income: totalIncome,
					total_spent: el.prev_value + totalIncome - el.curr_value,
					price: el.type === "نقدي" ? el.price : 0,
					total_value:
						el.type === "نقدي"
							? +el.price *
							  (el.prev_value +
									totalIncome -
									el.curr_value -
									totalCoupons -
									totalCalibrations)
							: 0,
					type: el.type,
					substance_id: el.substance_id,
					substance: el.substance,
					totalCoupons,
				};
			});

			const groupedStores = stores.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.substance_id === item.substance_id
				);
				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						title: `حركة مخازن ال${item.substance}`,
						substance_id: item.substance_id,
						data: [item],
					});
				}

				return acc;
			}, []);
			return {
				dispensers: groupedDispensers,
				info: {
					station_name: movmentToFetch.station_name,
					date: new Date(movmentToFetch.date).toISOString(),
					movment_number: movmentToFetch.number,
				},
				stores: groupedStores,
			};
		},
		onSuccess: (data) => {
			const dataToPrint = data.info.date.split("T")[0].replace(/-/g, "/");
			const newData = {
				...data,
				info: { ...data.info, date: `${dataToPrint}` },
			};

			navigate("./print", {
				state: {
					data: newData,
					reportTemplate: "dailyMovmentReport",
				},
			});
		},
		enabled: !!movmentToFetch?.movment_id,
	});
	const { data: movments, isLoading } = useQuery({
		queryKey: ["movments", page - 1, rowsPerPage, JSON.stringify(filters)],
		queryFn: getAllMovments,
		select: (res) => {
			return res.data;
		},
		onSuccess: (data) => {
			setPages(Math.ceil(data.total / rowsPerPage));
			setTotal(data.total);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteMovment,
		onSuccess: (res) => {
			toast.success("تم الحذف بنجاح", {
				position: "top-center",
			});
			queryClient.invalidateQueries({ queryKey: ["movments"] });
			setModal({
				title: "",
				content: "",
				actions: "",
			});
			onClose();
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: toast.POSITION.TOP_CENTER,
			});
			setModal({
				title: "",
				content: "",
				actions: "",
			});
			onClose();
		},
	});
	const updateMovmentStateMutation = useMutation({
		mutationFn: changeMovmentState,
		onSuccess: (res) => {
			toast.success("تم فتح الحركة بنجاح", {
				position: "top-center",
			});
			setModal({
				title: "",
				content: "",
				actions: "",
			});
			onClose();
			queryClient.invalidateQueries(["movments"]);
		},
		onError: (err) => {
			setModal({
				title: "",
				content: "",
				actions: "",
			});
			onClose();
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
								navigate("./addMovment");
							}}
							isDisabled={!authCtx.permissions.addDailyMovment}
						>
							إضافة حركة
						</Button>
					</>
				}
			/>
			<div className="w-full p-5 pb-16">
				<Card>
					<CardHeader className="bg-primary text-default-50 font-bold text-medium">
						الحركة اليومية
					</CardHeader>
					<CardBody>
						<div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
							<Select
								label="اسم المحطة"
								multiple
								className="max-w-xs"
								onChange={(e) => {
									if (!e.target.value) {
										setFilters((prev) => {
											return { ...prev, stations: [] };
										});
									} else {
										const selectedSet = new Set(e.target.value.split(","));
										setFilters((prev) => {
											return { ...prev, stations: Array.from(selectedSet) };
										});
									}
								}}
								selectedKeys={filters.stations}
								selectionMode="multiple"
							>
								{stations &&
									stations.map((station) => {
										return (
											<SelectItem key={station.key}>{station.text}</SelectItem>
										);
									})}
							</Select>
							<DateRangePicker
								value={filters.date}
								className="max-w-xs"
								onChange={(e) => {
									setFilters((prev) => {
										return { ...prev, date: { start: e.start, end: e.end } };
									});
								}}
								label="الفترة"
								aria-labelledby="الفترة"
							/>
						</div>
						{movments && movments.movments.length > 0 ? (
							<Table
								aria-labelledby="table"
								bottomContent={
									<div className="py-2 px-2 flex justify-between items-center">
										<span className="text-default-400 text-small">
											الاجمالي {total} حركة
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
									<TableColumn>رقم الحركة</TableColumn>
									<TableColumn>المحطة</TableColumn>
									<TableColumn>التاريخ</TableColumn>
									<TableColumn>المناوبات</TableColumn>
									<TableColumn>الحالة</TableColumn>
									<TableColumn>خيارات</TableColumn>
								</TableHeader>
								<TableBody>
									{movments.movments &&
										movments.movments.map((movment) => {
											const disabledActions = [];
											if (
												movment.number.slice(-4) === "0000" ||
												movment.state === "approved" ||
												!authCtx.permissions.addDailyMovment
											) {
												disabledActions.push("delete");
											}
											if (movment.state !== "approved") {
												disabledActions.push("print");
											}
											if (
												!authCtx.permissions.confirmMovment ||
												movment.insertedShifts.length !== movment.shifts ||
												movment.state === "approved" ||
												movment.insertedShifts.filter(
													(el) => el.state !== "saved"
												).length !== 0
											) {
												disabledActions.push("confirm");
											}
											if (
												movment.number.slice(-4) === "0000" ||
												movment.state !== "approved" ||
												!authCtx.permissions.admin
											) {
												disabledActions.push("open");
											}
											const shifts = movment.insertedShifts.map((shift) => {
												let bgColor = "lightgray";
												if (shift.state === "saved") {
													bgColor = "green";
												}
												if (shift.state === "pending") {
													bgColor = "grey";
												}

												return (
													<div
														key={shift.id}
														onClick={() => {
															if (!authCtx.permissions.addShift) {
																toast.error(
																	"عذراً،ليس لديك الصلاحية لادخال او تعديل بيانات المناوبة",
																	{
																		position: "top-center",
																	}
																);
																return;
															}
															if (
																shift.number !== 1 &&
																movment.insertedShifts.filter(
																	(el) => el.number === shift.number - 1
																)[0].state === "pending"
															) {
																toast.error("لم يتم ادخال النوبة السابقة", {
																	position: "top-center",
																});
																return;
															}

															if (
																movment.state !== "approved" &&
																shift.state !== "inserted"
															) {
																navigate("./editShift", {
																	state: {
																		movment_id: movment.id,
																		shift: shift,
																		prevShiftId: movment.insertedShifts.filter(
																			(el) => el.number === shift.number - 1
																		)[0]?.id,
																		station_id: movment.station_id,
																		date: movment.date,
																		station_name: movment["station.name"],
																		number: movment.number,
																	},
																});
															} else if (movment.state !== "approved") {
																navigate("./addShift", {
																	state: {
																		movment_id: movment.id,
																		shift: shift,
																		prevShiftId: movment.insertedShifts.filter(
																			(el) => el.number === shift.number - 1
																		)[0]?.id,
																		station_id: movment.station_id,
																		date: movment.date,
																		station_name: movment["station.name"],
																		number: movment.number,
																	},
																});
															}
														}}
														style={{
															border: "2px solid #333",
															padding: "3px 10px",
															borderRadius: "5px",
															fontWeight: "bold",
															cursor: "pointer",
															backgroundColor: bgColor,
														}}
													>
														{shift.number}
													</div>
												);
											});
											return (
												<TableRow key={movment.id}>
													<TableCell>{movment.number}</TableCell>
													<TableCell>{movment["station.name"]}</TableCell>
													<TableCell>{movment.date}</TableCell>
													<TableCell>
														<div style={{ display: "flex", gap: "5px" }}>
															{shifts}
														</div>
													</TableCell>
													<TableCell>
														{movment.state === "approved" ? (
															<Badge
																color="success"
																size="lg"
																content={<Check />}
																shape="circle"
																className="p-1"
																showOutline={false}
															></Badge>
														) : (
															<Badge
																color="warning"
																size="lg"
																content={<X />}
																shape="circle"
																className="p-1"
																showOutline={false}
															></Badge>
														)}
													</TableCell>
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
																					header: "حذف حركة",
																					body: (
																						<div>
																							هل أنت متأكد من حذف الحركة بتاريخ
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
																										movment.id
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
																			setMovmentToFetch({
																				movment_id: movment.id,
																				station_id: movment.station_id,
																				shifts: movment.shifts,
																				date: movment.date,
																				station_name: movment["station.name"],
																				number: movment.number,
																			});
																		}
																		if (key === "confirm") {
																			navigate("./confirm", {
																				state: {
																					movment_id: movment.id,
																					station_id: movment.station_id,
																					shifts: movment.shifts,
																					date: movment.date,
																					station_name: movment["station.name"],
																					number: movment.number,
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
																								بعد {movment.date}!
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
																		key="confirm"
																		startContent={<Check />}
																	>
																		تأكيد
																	</DropdownItem>
																	<DropdownItem
																		key="open"
																		startContent={<Edit />}
																	>
																		فتح الحركة
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

export default DailyMovments;
