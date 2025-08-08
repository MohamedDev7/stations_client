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
	addQuantityDeduction,
	addStocktaking,
	getAllStations,
	getAllSubstances,
	getDispensersMovmentByMovmentIdAndShiftId,
	getLastShiftIdByMovmentId,
	getStationMovmentByDate,
	getStationPendingMovment,
	getStoreByStationId,
	getStoresMovmentByMovmentIdAndShiftId,
	getSubstancePriceMovment,
	getSubstancesPricesByDate,
	getSubstancesStocksByMovmentIdAndShiftId,
} from "@/api/serverApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@heroui/react";

const QuantityDeductionForm = () => {
	//states
	const [date, setDate] = useState("");
	const [nextDate, setNextDate] = useState("");
	const [station, setStation] = useState("");
	const [members, setMembers] = useState([]);
	const [membersCount, setMembersCount] = useState(0);
	const [currMovmentIsChecked, setCurrMovmentIsChecked] = useState(false);
	const [nextMovmentIsChecked, setNextMovmentIsChecked] = useState(false);
	const [pendingMovmentIsChecked, setPendingMovmentIsChecked] = useState(false);
	const [selectedSubstance, setSelectedSubstance] = useState("");
	const [selectedStore, setSelectedStore] = useState("");
	const [withValue, setWithValue] = useState(true);
	const [storesMovments, setStoresMovments] = useState([]);
	const [prevValue, setPrevValue] = useState(0);
	const [currValue, setCurrValue] = useState(0);
	const [amount, setAmount] = useState(0);
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
	const { data: stores } = useQuery({
		queryKey: ["substances", station],
		queryFn: getStoreByStationId,
		select: (res) => {
			return res.data.stores.filter(
				(el) => el.substance.id === +selectedSubstance
			);
		},
		enabled: !!station && !!selectedSubstance,
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
				toast.error(
					`لايمكن استنزال كمية بسبب عدم اعتماد الحركة بتاريخ  ${date}`,
					{
						position: "top-center",
					}
				);
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
					`لايمكن استنزال كمية بسبب وجود حركة في اليوم التالي ${nextDate}`,
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
		enabled: currMovmentIsChecked,
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
				toast.error("لايمكن استنزال كمية لوجود حركة غير معتمدة", {
					position: "top-center",
				});
			} else setPendingMovmentIsChecked(true);
		},
		enabled: !!station,
	});
	// const { data: priceMovment } = useQuery({
	// 	queryKey: ["priceMovment", date, selectedSubstance],
	// 	queryFn: getSubstancePriceMovment,
	// 	select: (res) => {
	// 		return res.data.PriceMovment;
	// 	},
	// 	onSuccess: (data) => {
	// 		if (data.length === 0 && selectedSubstance.length !== 0) {
	// 			setPriceMovmentIsChecked(false);
	// 			setIsPriceChange(false);
	// 			toast.error("لا يمكن اضافة جرد تسعيرة في هذا التاريخ لعدم تغير السعر", {
	// 				position: "top-center",
	// 			});
	// 		} else setPriceMovmentIsChecked(true);
	// 	},
	// 	enabled: !!station && !!date && !!isPriceChange,
	// });
	useQuery({
		queryKey: ["storesMovments", currMovment?.id, lastShift],
		queryFn: getStoresMovmentByMovmentIdAndShiftId,
		select: (res) => {
			return res.data.storesMovments.map((el) => {
				return {
					...el,
					prev_value: el.curr_value,
					curr_value: el.curr_value,
					price: prices.filter(
						(ele) => ele.substance_id === el.store.substance.id
					)[0].price,
				};
			});
		},
		onSuccess: (data) => {
			setStoresMovments(data);
		},
		enabled:
			currMovmentIsChecked &&
			nextMovmentIsChecked &&
			pendingMovmentIsChecked &&
			!!prices &&
			!!lastShift,
	});
	// useQuery({
	// 	queryKey: ["stocks", currMovment?.id, lastShift, selectedSubstance],
	// 	queryFn: getSubstancesStocksByMovmentIdAndShiftId,
	// 	select: (res) => {
	// 		return res.data.stocks.map((el) => {
	// 			let deficit = 0;

	// 			stores.forEach((ele) => {
	// 				if (ele.store.substance.id === el.substance_id) {
	// 					deficit = deficit + ele.deficit;
	// 				}
	// 			});
	// 			return {
	// 				...el,
	// 				realAmount: el.amount - deficit,
	// 				diff: -deficit,
	// 			};
	// 		});
	// 	},
	// 	onSuccess: (data) => {
	// 		setStocks(data);
	// 	},
	// 	enabled:
	// 		currMovmentIsChecked &&
	// 		nextMovmentIsChecked &&
	// 		pendingMovmentIsChecked &&
	// 		!!lastShift &&
	// 		!!stores &&
	// 		priceMovmentIsChecked,
	// });
	const saveMutation = useMutation({
		mutationFn: addQuantityDeduction,
		onSuccess: (res) => {
			toast.success("تم استنزال الكمية بنجاح", {
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
		saveMutation.mutate({
			station,
			substance: selectedSubstance,
			date: date,
			store: selectedStore,
			currValue,
			prevValue,
			amount,
			price: prices.filter((el) => el.substance_id === +selectedSubstance)[0]
				.price,
			movmentId: currMovment.id,
			withValue,
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
							بيانات الاستنزال
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
										setSelectedSubstance(e.target.value);
									}}
									selectedKeys={[selectedSubstance]}
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
							<Row flex={[1, 20]}>
								<Checkbox
									isSelected={withValue}
									onChange={(e) => {
										setWithValue(e.target.checked);
									}}
								>
									بقيمة
								</Checkbox>

								<></>
							</Row>
							<Row flex={[1, 1, 1]}>
								<Select
									label="المخازن"
									onChange={(e) => {
										const store = storesMovments.filter(
											(el) => el.store.id === +e.target.value
										)[0];
										setSelectedStore(e.target.value);
										setCurrValue(store?.prev_value || 0);
										setPrevValue(store?.curr_value || 0);
										setAmount(0);
									}}
									selectedKeys={[selectedStore]}
								>
									{stores &&
										stores.map((store) => (
											<SelectItem key={store.id}>
												{`${store.name} - ${store.substance.name}`}
											</SelectItem>
										))}
								</Select>
								<Input
									label="الرصيد السابق"
									type="number"
									isDisabled
									value={prevValue}
								/>
								<Input
									label="الكمية المستنزلة"
									type="number"
									value={amount}
									onChange={(e) => {
										setAmount(+e.target.value);
										setCurrValue(prevValue - +e.target.value);
									}}
								/>
								<Input
									label="الرصيد الحالي"
									type="number"
									isDisabled
									value={currValue}
								/>
							</Row>
						</CardBody>
					</Card>

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

export default QuantityDeductionForm;
