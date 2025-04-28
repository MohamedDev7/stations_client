import React, { useEffect } from "react";
import { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import { DefaultButton, PrimaryButton } from "@fluentui/react";

import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Select,
	SelectItem,
	Input,
	Button,
	Checkbox,
} from "@heroui/react";
import { useDateFormatter } from "@react-aria/i18n";
import { X, Save } from "@mynaui/icons-react";
import { DeleteRegular } from "@fluentui/react-icons";
// import Card from "../../UI/card/Card";
import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	addStocktaking,
	getAllStations,
	getAllSubstances,
	getDispensersMovmentByMovmentIdAndShiftId,
	getLastShiftIdByMovmentId,
	getStationMovmentByDate,
	getStationPendingMovment,
	getStoresMovmentByMovmentIdAndShiftId,
	getSubstancePriceMovment,
	getSubstancesPricesByDate,
	getSubstancesStocksByMovmentIdAndShiftId,
} from "../../api/serverApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@heroui/react";

const StocktakingForm = () => {
	//states
	const [date, setDate] = useState("");
	const [nextDate, setNextDate] = useState("");
	const [station, setStation] = useState("");
	const [members, setMembers] = useState([]);
	const [membersCount, setMembersCount] = useState(0);
	const [currMovmentIsChecked, setCurrMovmentIsChecked] = useState(false);
	const [nextMovmentIsChecked, setNextMovmentIsChecked] = useState(false);
	const [pendingMovmentIsChecked, setPendingMovmentIsChecked] = useState(false);
	const [priceMovmentIsChecked, setPriceMovmentIsChecked] = useState(true);
	const [stocks, setStocks] = useState([]);
	const [stores, setStores] = useState([]);
	const [selectedSubstances, setSelectedSubstances] = useState([]);
	const [isPriceChange, setIsPriceChange] = useState(false);
	//hooks
	let formatter = useDateFormatter({ dateStyle: "short" });
	const navigate = useNavigate();
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});
	const { data: prices } = useQuery({
		queryKey: ["prices", date],
		queryFn: getSubstancesPricesByDate,
		select: (res) => {
			return res.data.prices;
		},
		enabled: !!date,
	});
	const { data: substances } = useQuery({
		queryKey: ["substances"],
		queryFn: getAllSubstances,
		select: (res) => {
			return res.data.substances.map((el) => {
				return { ...el, key: el.id, text: el.name };
			});
		},
	});
	const { data: currMovment } = useQuery({
		queryKey: ["movments", station, date],
		queryFn: getStationMovmentByDate,
		select: (res) => {
			return res.data.movment;
		},
		onSuccess: (data) => {
			if (Object.keys(data).length === 0) {
				setCurrMovmentIsChecked(false);
				toast.error(`لايمكن إضافة جرد بسبب عدم اعتماد الحركة بتاريخ  ${date}`, {
					position: "top-center",
				});
			} else setCurrMovmentIsChecked(true);
		},
		enabled: !!station && !!date,
	});
	const { data: nextMovment } = useQuery({
		queryKey: ["movments", station, nextDate],
		queryFn: getStationMovmentByDate,
		select: (res) => {
			return res.data.movment;
		},
		onSuccess: (data) => {
			if (data && Object.keys(data).length > 0) {
				setNextMovmentIsChecked(false);
				toast.error(
					`لايمكن إضافة جرد بسبب وجود حركة في اليوم التالي ${nextDate}`,
					{
						position: "top-center",
					}
				);
			} else {
				setNextMovmentIsChecked(true);
			}
		},
		enabled: !!station && !!nextDate,
	});
	const { data: lastShift } = useQuery({
		queryKey: ["movments", currMovment?.id],
		queryFn: getLastShiftIdByMovmentId,
		select: (res) => {
			return res.data.lastShift.id;
		},
		enabled: !!currMovment,
	});
	const { data: pendingMovment } = useQuery({
		queryKey: ["pendingMovment", station, date],
		queryFn: getStationPendingMovment,
		select: (res) => {
			return res.data.pendingMovment;
		},
		onSuccess: (data) => {
			if (data.length > 0) {
				setPendingMovmentIsChecked(false);
				toast.error("لايمكن إضافة جرد لوجود حركة غير معتمدة", {
					position: "top-center",
				});
			} else setPendingMovmentIsChecked(true);
		},
		enabled: !!station,
	});
	const { data: priceMovment } = useQuery({
		queryKey: ["priceMovment", date, selectedSubstances],
		queryFn: getSubstancePriceMovment,
		select: (res) => {
			return res.data.PriceMovment;
		},
		onSuccess: (data) => {
			if (data.length === 0 && selectedSubstances.length !== 0) {
				setPriceMovmentIsChecked(false);
				toast.error("لا يمكن اضافة جرد تسعيرة في هذا التاريخ لعدم تغير السعر", {
					position: "top-center",
				});
			} else setPriceMovmentIsChecked(true);
		},
		enabled: !!station && !!date && !!isPriceChange,
	});
	useQuery({
		queryKey: ["stocks", currMovment?.id, lastShift, selectedSubstances],
		queryFn: getSubstancesStocksByMovmentIdAndShiftId,
		select: (res) => {
			return res.data.stocks.map((el) => {
				return { ...el, realAmount: el.amount, diff: 0 };
			});
		},
		onSuccess: (data) => {
			setStocks(data);
		},
		enabled:
			currMovmentIsChecked &&
			nextMovmentIsChecked &&
			pendingMovmentIsChecked &&
			!!lastShift &&
			priceMovmentIsChecked,
	});
	useQuery({
		queryKey: ["storesMovments", currMovment?.id, lastShift],
		queryFn: getStoresMovmentByMovmentIdAndShiftId,
		select: (res) => {
			return res.data.storesMovments.map((el) => {
				return { ...el, prev_value: el.curr_value };
			});
		},
		onSuccess: (data) => {
			setStores(data);
		},
		enabled:
			currMovmentIsChecked &&
			nextMovmentIsChecked &&
			pendingMovmentIsChecked &&
			!!lastShift &&
			priceMovmentIsChecked,
	});
	const { data: dispensersMovments } = useQuery({
		queryKey: ["dispensersMovments", currMovment?.id, lastShift],
		queryFn: getDispensersMovmentByMovmentIdAndShiftId,
		select: (res) => {
			return res.data.dispensersMovments;
		},

		enabled:
			currMovmentIsChecked &&
			nextMovmentIsChecked &&
			pendingMovmentIsChecked &&
			!!lastShift &&
			priceMovmentIsChecked,
	});
	const saveMutation = useMutation({
		mutationFn: addStocktaking,
		onSuccess: (res) => {
			toast.success("تم إضافة الجرد بنجاح", {
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
		if (date) {
			const currDate = new Date(date);
			const nextDay = new Date(date);
			nextDay.setDate(currDate.getDate() + 1);

			setNextDate(new Date(nextDay).toISOString().split("T")[0]);
		}
	}, [date]);
	const addMemberHandler = () => {
		setMembers((prev) => [
			...prev,
			{
				id: membersCount + 1,
				name: "",
			},
		]);
		setMembersCount((prev) => prev + 1);
	};
	const onSaveMovmentHandler = () => {
		console.log({
			station,
			substance: selectedSubstances,
			date: date,
			stores,
			members,
			stocks,
			currMovmentId: currMovment.id,
			type: isPriceChange ? "تسعيرة" : "جرد",
		});
		saveMutation.mutate({
			station,
			substance: selectedSubstances,
			date: date,
			stores,
			members,
			stocks,
			currMovmentId: currMovment.id,
			type: isPriceChange ? "تسعيرة" : "جرد",
		});
	};
	return (
		<div className="w-full h-full overflow-auto ">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSaveMovmentHandler();
				}}
			>
				<TopBar
					right={
						<>
							<Button
								color="warning"
								onPress={() => {
									navigate("./..");
								}}
								disabled={saveMutation.isLoading}
							>
								<X />
								الغاء
							</Button>
							<Button
								color="primary"
								type="submit"
								disabled={saveMutation.isLoading}
							>
								<Save />
								حفظ
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							بيانات الجرد
						</CardHeader>
						<CardBody>
							<Row flex={[1, 1, 1]}>
								<Select
									label="اسم المحطة"
									onChange={(e) => {
										setStation(e.target.value);
									}}
								>
									{stations &&
										stations.map((station) => {
											return (
												<SelectItem key={station.id}>{station.name}</SelectItem>
											);
										})}
								</Select>
								<Select
									label="المادة"
									onChange={(e) => {
										setSelectedSubstances(e.target.value);
									}}
								>
									{substances &&
										substances.map((substance) => {
											return (
												<SelectItem key={substance.id}>
													{substance.name}
												</SelectItem>
											);
										})}
								</Select>
								<Input
									label="التاريخ"
									required
									value={date}
									type="date"
									onChange={(e) => {
										setDate(e.target.value);
									}}
								/>
							</Row>
							<Row flex={[1, 1, 1]}>
								<Checkbox
									isSelected={isPriceChange}
									onChange={(e) => {
										setIsPriceChange(e.target.checked);
										setPriceMovmentIsChecked(!e.target.checked);
									}}
								>
									تسعيرة
								</Checkbox>
							</Row>
						</CardBody>
					</Card>
					{dispensersMovments && (
						<Card>
							<CardHeader className="bg-primary text-default-50 font-bold text-medium">
								قراءة العدادات
							</CardHeader>
							<CardBody>
								<Table aria-label="Example static collection table">
									<TableHeader>
										<TableColumn>بيانات الطرمبة</TableColumn>
										<TableColumn>أ</TableColumn>
										<TableColumn>ب</TableColumn>
									</TableHeader>
									<TableBody>
										{dispensersMovments
											.filter(
												(dispenser) =>
													dispenser.dispenser.tank.substance.id ===
													+selectedSubstances
											)
											.map((dispenser) => (
												<TableRow key={dispenser.id}>
													<TableCell>
														{dispenser.dispenser.number}-
														{dispenser.dispenser.tank.substance.name}
													</TableCell>
													<TableCell>{dispenser.curr_A}</TableCell>
													<TableCell>{dispenser.curr_B}</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</CardBody>
						</Card>
					)}

					{currMovmentIsChecked &&
						nextMovmentIsChecked &&
						pendingMovmentIsChecked &&
						priceMovmentIsChecked && (
							<>
								<Card>
									<CardHeader className="bg-primary text-default-50 font-bold text-medium">
										بيانات الجرد
									</CardHeader>
									<CardBody>
										<Table aria-label="Example static collection table">
											<TableHeader>
												<TableColumn>المادة</TableColumn>
												<TableColumn>المخزون الدفتري</TableColumn>
												<TableColumn>مخزون الجرد</TableColumn>
												<TableColumn>الفارق</TableColumn>
											</TableHeader>
											<TableBody>
												{stocks.map((stock) => (
													<TableRow key={stock.substance_id}>
														<TableCell>
															{stock["store.substance.name"]}
														</TableCell>
														<TableCell>{stock.amount}</TableCell>
														<TableCell>
															<Input
																value={stock.realAmount}
																type="number"
																isWheelDisabled
																aria-label="مخزون الجرد"
																onChange={(e) => {
																	let diff = 0;
																	const updatedStocks = stocks.map((ele) => {
																		if (
																			ele.substance_id === stock.substance_id
																		) {
																			diff = +e.target.value - +ele.amount;

																			return {
																				...ele,
																				realAmount: +e.target.value,
																				diff,
																			};
																		} else {
																			return ele;
																		}
																	});
																	const updatedStores = stores.map((ele) => {
																		if (
																			ele.store.substance.id ===
																				stock.substance_id &&
																			ele.store.type === "نقدي"
																		) {
																			return {
																				...ele,
																				curr_value: +ele.prev_value + diff,
																			};
																		} else {
																			return ele;
																		}
																	});
																	setStores(updatedStores);
																	setStocks(updatedStocks);
																}}
															/>
														</TableCell>
														<TableCell>{stock.diff}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardBody>
								</Card>
								<Card>
									<CardHeader className="bg-primary text-default-50 font-bold text-medium">
										بيانات المخزون
									</CardHeader>
									<CardBody>
										<Table aria-label="Example static collection table">
											<TableHeader>
												<TableColumn>المادة</TableColumn>
												<TableColumn>رصيد قبل الجرد</TableColumn>
												<TableColumn>رصيد بعد الجرد</TableColumn>
												<TableColumn>الفارق</TableColumn>
											</TableHeader>
											<TableBody>
												{stores
													.filter(
														(store) =>
															store.store.substance.id === +selectedSubstances
													)
													.map((store) => (
														<TableRow key={store.id}>
															<TableCell>
																{store.store.name}-{store.store.substance.name}
															</TableCell>
															<TableCell>{store.prev_value}</TableCell>
															<TableCell>{store.curr_value}</TableCell>
															<TableCell>
																{store.curr_value - store.prev_value}
															</TableCell>
														</TableRow>
													))}
											</TableBody>
										</Table>
									</CardBody>
								</Card>
							</>
						)}
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							اعضاء اللجنة
						</CardHeader>
						{members.length > 0 ? (
							<Table aria-label="Example static collection table">
								<TableHeader>
									<TableColumn>اسم العضو</TableColumn>
									<TableColumn>خيارات</TableColumn>
								</TableHeader>
								<TableBody emptyContent="لا توجد بيانات لعرضها">
									{members.map((member, i) => (
										<TableRow key={i}>
											<TableCell>
												<Input
													value={
														members.filter((el) => el.id === member.id)[0].name
													}
													onChange={(e) => {
														const updated = members.map((el) => {
															if (el.id === member.id) {
																return {
																	...el,
																	name: e.target.value,
																};
															}
															return el;
														});
														setMembers(updated);
													}}
												/>
											</TableCell>
											<TableCell>
												<Button
													isIconOnly
													color="danger"
													onPress={() =>
														setMembers((prev) =>
															prev.filter((el) => el.id !== member.id)
														)
													}
												>
													<DeleteRegular style={{ fontSize: "22px" }} />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<EmptyContainer msg="لا توجد بيانات" />
						)}
						<div className="p-4">
							<Button onPress={() => addMemberHandler()} color="primary">
								إضافة عضو
							</Button>
						</div>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default StocktakingForm;
