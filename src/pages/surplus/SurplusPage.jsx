import { useState } from "react";
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
import { DotsVertical, Printer, Trash, Edit, Save } from "@mynaui/icons-react";
import { useSearchParams } from "react-router-dom";
import useNavigateWithQuery from "../../hooks/useNavigateWithQuery";
import {
	deleteSurplus,
	getAllSurpluses,
	getAllStations,
} from "@/api/serverApi";
import tafqeet from "../../utils/Tafqeet";
import { parseDate } from "@internationalized/date";

const SurplusesPage = () => {
	//hooks
	const navigate = useNavigateWithQuery();
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [searchParams, setSearchParams] = useSearchParams();

	//states
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

	const { data: surpluses } = useQuery({
		queryKey: [
			"surpluses",
			page - 1,
			rowsPerPage,
			selectedStations,
			startDate,
			endDate,
		],
		queryFn: getAllSurpluses,
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
	const updateParams = (params, resetPage = false) => {
		const newParams = {
			page: resetPage ? "1" : page.toString(),
			rowsPerPage: rowsPerPage.toString(),
		};
		if (startDate) newParams.startDate = startDate.toString();
		if (endDate) newParams.endDate = endDate.toString();
		if (selectedStations.length > 0)
			newParams.selectedStations = selectedStations.join(",");

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
						<div
							style={{
								display: "flex",
								gap: "15px",
								alignItems: "center",
								marginBottom: "15px",
							}}
						>
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
									stations.map((station) => (
										<SelectItem key={station.key}>{station.text}</SelectItem>
									))}
							</Select>
							<DatePicker
								label="من تاريخ"
								value={startDate}
								className="max-w-xs"
								size="sm"
								onChange={handleStartDateChange}
							/>
							<DatePicker
								label="الى تاريخ"
								value={endDate}
								className="max-w-xs"
								size="sm"
								onChange={handleEndDateChange}
							/>
						</div>
						<Table
							aria-label="table"
							bottomContent={
								<div className="py-2 px-2 flex justify-between items-center">
									<span className="text-default-400 text-small">
										الاجمالي {total} فائض
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
								{surpluses &&
									surpluses.surpluses &&
									surpluses.surpluses.map((surpluse) => {
										const disabledActions = [];
										if (
											surpluse.state === "approved" ||
											surpluse.stocktaking_id
										) {
											disabledActions.push("delete", "edit");
										}
										return (
											<TableRow key={surpluse.id}>
												<TableCell>
													{surpluse.date
														? surpluse.date
														: surpluse.movment.date}
												</TableCell>
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
