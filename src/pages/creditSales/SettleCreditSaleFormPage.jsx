import React, { useEffect, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
	addCreditSalesSettlement,
	getAllStations,
	getClientsByStationId,
	getMovmentsShiftsByMovmentId,
	getStationPendingMovment,
	getStoreByStationId,
	getStoreByStationIdAndClientId,
	getSubstancesPricesByDate,
	getUnPaidCreditSalesByStationIdAndStoreIdAndClientId,
} from "@/api/serverApi";
import { X, Contactless } from "@mynaui/icons-react";
import { Button } from "@heroui/button";
import TimeChange from "./../../utils/TimeChange";
import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Select,
	SelectItem,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
} from "@heroui/react";
import EmptyContainer from "@/components/EmptyContainer/EmptyContainer";
const SettleCreditSaleFormPage = () => {
	//hooks
	const navigate = useNavigate();

	//states
	const [station, setStation] = useState("");
	const [date, setDate] = useState("");
	const [amount, setAmount] = useState("");
	const [totalLitters, setTotalLitters] = useState("");
	const [selectedStore, setSelectedStore] = useState("");
	const [selectedClientStore, setSelectedClientStore] = useState("");
	const [selectedClient, setSelectedClient] = useState("");
	const [selectedItems, setSelectedItems] = useState(new Set());
	const [selectedItemsArr, setSelectedItemsArr] = useState([]);
	const [items, setItems] = useState([]);
	const [type, setType] = useState("نقدي");
	const [operationNumber, setOperationNumber] = useState("");
	const [shift, setShift] = useState("");
	const [movment, setMovment] = useState("");
	const [disabledShifts, setDisabledShifts] = useState([]);

	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => {
				return { ...el, key: el.id };
			});
		},
	});
	const { data: pendingMovments } = useQuery({
		queryKey: ["pendingMovments", station],
		queryFn: getStationPendingMovment,
		select: (res) => {
			return res.data.pendingMovment;
		},
		enabled: !!station,
	});
	const { data: shifts } = useQuery({
		queryKey: ["shifts", movment],
		queryFn: getMovmentsShiftsByMovmentId,
		select: (res) => {
			return res.data.shifts;
		},
		onSuccess: (data) => {
			const disabledShiftsArr = data
				.filter((el) => el.state === "saved")
				.map((el) => el.id.toString());

			setDisabledShifts(disabledShiftsArr);
		},
		enabled: !!movment,
	});
	const { data: prices } = useQuery({
		queryKey: [
			"prices",
			pendingMovments?.filter((el) => el.id === movment)[0]?.date,
		],
		queryFn: getSubstancesPricesByDate,
		select: (res) => {
			return res.data.prices;
		},
		enabled: !!movment && !!pendingMovments,
	});
	const { data: stores } = useQuery({
		queryKey: ["stores", station],
		queryFn: getStoreByStationId,
		select: (res) => res.data.stores,
		enabled: !!station,
	});
	const { data: clients } = useQuery({
		queryKey: ["clients", station],
		queryFn: getClientsByStationId,
		select: (res) => {
			return res.data.clients;
		},
		enabled: !!station,
	});
	const { data: clientsStores } = useQuery({
		queryKey: ["clientsStores", station, selectedClient],
		queryFn: getStoreByStationIdAndClientId,
		select: (res) => {
			return res.data.stores;
		},
		enabled: !!station && !!selectedClient,
	});
	useQuery({
		queryKey: ["creditSales", station, selectedStore, selectedClient],
		queryFn: getUnPaidCreditSalesByStationIdAndStoreIdAndClientId,
		select: (res) => {
			let data = null;
			if (type === "خصم كمية" && !!prices) {
				const price = prices.filter(
					(el) => el.substance_id === res.data.creditSales[0].store.substance.id
				)[0].price;
				data = res.data.creditSales.map((el) => {
					return {
						...el,
						newAmount: (el.amount * el.price) / price,
						realPrice: price,
					};
				});
			} else {
				data = res.data.creditSales;
			}
			return data;
		},
		onSuccess: (data) => {
			setItems(data);
		},
		enabled:
			!!selectedStore &&
			!!selectedClient &&
			!!station &&
			(type === "خصم كمية" ? !!prices : true),
	});

	const addMutation = useMutation({
		mutationFn: addCreditSalesSettlement,
		onSuccess: () => {
			toast.success("تم التسديد بنجاح", {
				position: "top-center",
			});
			navigate("./..");
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});

	//functions
	useEffect(() => {
		let total = 0;
		const arrayOfIds = Array.from(selectedItems);
		setSelectedItemsArr(arrayOfIds.map((el) => +el));
		if (items && items.length > 0) {
			const filterdItems = items.filter((el) =>
				arrayOfIds.includes(`${el.id}`)
			);
			filterdItems.forEach((el) => {
				total = total + el.price * el.amount;
			});
		} else {
			total = 0;
		}
		let price = 0;

		if (stores && selectedStore && prices && stores.length > 0) {
			const substanceId = stores?.filter((el) => el.id === +selectedStore)[0]
				.substance.id;
			price = prices.filter((el) => el.substance_id === substanceId)[0].price;
		}
		setAmount(total);
		setTotalLitters(+total / +price);
	}, [selectedItems, items, prices, selectedStore, stores]);
	return (
		<div className="w-full h-full overflow-auto">
			<form
				onSubmit={(e) => {
					e.stopPropagation();

					addMutation.mutate({
						date,
						station,
						client: selectedClient,
						store: selectedStore,
						amount,
						items: selectedItemsArr,
						itemsArr: items.filter((item) =>
							selectedItemsArr.includes(item.id)
						),
						type,
						operationNumber,
						movment,
						shift,
						selectedClientStore,
					});
				}}
			>
				<TopBar
					right={
						<>
							<Button
								color="warning"
								onPress={() => navigate("./..")}
								disabled={addMutation.isLoading}
							>
								<X />
								الغاء
							</Button>
							<Button
								color="primary"
								type="submit"
								disabled={addMutation.isLoading}
							>
								<Contactless />
								سداد
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							بيانات السداد
						</CardHeader>
						<CardBody>
							<Row flex={[3, 2, 3]}>
								<Select
									label="المحطة"
									selectedKeys={[station.toString()]}
									onChange={(e) => {
										setStation(+e.target.value);
										setSelectedStore("");
									}}
									isRequired
								>
									{stations &&
										stations.map((station) => {
											return (
												<SelectItem key={station.id}>{station.name}</SelectItem>
											);
										})}
								</Select>
								<Input
									label="التاريخ"
									isRequired
									value={date}
									type="date"
									onChange={(e) => setDate(e.target.value)}
								/>
								<Select
									label="المخزن"
									onChange={(e) => {
										setSelectedStore(e.target.value);
									}}
									selectedKeys={[selectedStore]}
									isRequired
								>
									{stores &&
										stores.map((store) => {
											return (
												<SelectItem key={store.id}>
													{`${store.name} - ${store.substance.name}`}
												</SelectItem>
											);
										})}
								</Select>
							</Row>
							<div className="flex gap-4">
								<Select
									label="العميل"
									onChange={(e) => {
										setSelectedClient(e.target.value);
									}}
									className="max-w-md"
									selectedKeys={[selectedClient]}
									isRequired
								>
									{clients &&
										clients.map((client) => {
											return (
												<SelectItem key={client.client.id}>
													{`${client.client.name}`}
												</SelectItem>
											);
										})}
								</Select>
								<Select
									label="نوع السداد"
									onChange={(e) => {
										setOperationNumber("");
										setType(e.target.value);
									}}
									className="max-w-md"
									selectedKeys={[type]}
									isRequired
								>
									<SelectItem key="نقدي">نقدي</SelectItem>
									<SelectItem key="قيد مالي">قيد مالي</SelectItem>
									{clientsStores && clientsStores.length > 0 && (
										<SelectItem key="خصم كمية">خصم كمية</SelectItem>
									)}
								</Select>
								{type === "خصم كمية" && (
									<Select
										label="من مخزن"
										onChange={(e) => {
											setSelectedClientStore(e.target.value);
										}}
										className="max-w-md"
										selectedKeys={[selectedClientStore]}
										isRequired
									>
										{clientsStores &&
											clientsStores.map((store) => {
												return (
													<SelectItem key={store.id}>
														{`${store.name} - ${store.substance.name}`}
													</SelectItem>
												);
											})}
									</Select>
								)}
								{type === "قيد مالي" && (
									<Input
										isRequired
										label="رقم القيد المالي"
										onChange={(e) => {
											setOperationNumber(e.target.value);
										}}
										className="max-w-md"
										value={operationNumber}
									/>
								)}
							</div>
							<div className="flex gap-4 mt-1">
								{type === "خصم كمية" && (
									<>
										<Select
											label="الحركة"
											onChange={(e) => {
												setMovment(+e.target.value);
											}}
											isRequired
											className="max-w-md"
											value={movment}
										>
											{pendingMovments &&
												pendingMovments.map((movment) => {
													return (
														<SelectItem
															key={movment.id}
														>{`الحركة رقم ${movment.number} بتاريخ ${movment.date}`}</SelectItem>
													);
												})}
										</Select>
										<Select
											label="المناوبة"
											onChange={(e) => {
												setShift(+e.target.value);
											}}
											isRequired
											className="max-w-md"
											disabledKeys={disabledShifts}
											value={shift}
										>
											{shifts &&
												shifts.map((shift) => {
													return (
														<SelectItem key={shift.id}>{`${
															shift.number
														}- من ${TimeChange(shift.start)} الى ${TimeChange(
															shift.end
														)}`}</SelectItem>
													);
												})}
										</Select>
									</>
								)}

								<Input
									isRequired
									label="المبلغ"
									isDisabled
									readOnly
									value={amount}
									className="max-w-md"
									type="number"
								/>
								<></>
							</div>
						</CardBody>
					</Card>
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							المبيعات الآجلة
						</CardHeader>
						<CardBody>
							{items.length > 0 ? (
								<Table
									aria-label="Example static collection table"
									selectionMode="multiple"
									selectedKeys={selectedItems}
									onSelectionChange={(keys) => {
										if (typeof keys === "string" && keys === "all") {
											setSelectedItems(
												new Set(items.map((item) => `${item.id}`))
											);
										} else {
											setSelectedItems(new Set(keys));
										}
									}}
								>
									<TableHeader>
										<TableColumn>التاريخ</TableColumn>
										<TableColumn>الكمية</TableColumn>
										<TableColumn>سعر اللتر</TableColumn>
										<TableColumn>المبلغ</TableColumn>
									</TableHeader>
									<TableBody>
										{items.map((item) => (
											<TableRow key={item.id}>
												<TableCell>{item.movment.date}</TableCell>
												<TableCell>{item.amount}</TableCell>
												<TableCell>{item.price}</TableCell>
												<TableCell>{item.price * item.amount}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<EmptyContainer msg="لا توجد مبيعات غير مسددة" />
							)}
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default SettleCreditSaleFormPage;
