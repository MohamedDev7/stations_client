import React, { useEffect } from "react";
import { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";

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
} from "@heroui/react";

import { X, Save } from "@mynaui/icons-react";
import { DeleteRegular } from "@fluentui/react-icons";

import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	addAnnualStocktaking,
	addStocktaking,
	getAllStations,
	getAllSubstances,
	getAnnualDispensersMovment,
	getLastShiftIdByMovmentId,
	getStationMovmentByDate,
	getStoreByStationId,
	getStoresMovmentSummaryReport,
	getTanksByStationId,
} from "@/api/serverApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@heroui/react";

const AnnualStocktakingForm = () => {
	//states
	const [station, setStation] = useState("");
	const [members, setMembers] = useState([]);
	const [membersCount, setMembersCount] = useState(0);
	const [currMovmentIsChecked, setCurrMovmentIsChecked] = useState(false);
	const [tanks, setTanks] = useState([]);
	const [substancesData, setSubstancesData] = useState([]);
	const [cash, setCash] = useState([
		{ title: "فشة الف ريال", amount: 0, total: 0, number: 1000 },
		{ title: "فئة خمسمائة ريال", amount: 0, total: 0, number: 500 },
		{ title: "فئة مئتان ريال", amount: 0, total: 0, number: 200 },
		{ title: "فئة مائة ريال", amount: 0, total: 0, number: 100 },
		{ title: "فئة خمسون ريال", amount: 0, total: 0, number: 50 },
		{ title: "فئة عشرون ريال", amount: 0, total: 0, number: 20 },
		{ title: "فئة عشرة ريال", amount: 0, total: 0, number: 10 },
		{ title: "فئة خمسة ريال", amount: 0, total: 0, number: 5 },
		{ title: "فئة واحد ريال", amount: 0, total: 0, number: 1 },
	]);
	const [totalCash, setTotalCash] = useState(0);
	//hooks
	const navigate = useNavigate();
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations;
		},
	});
	const { data: substances } = useQuery({
		queryKey: ["substances"],
		queryFn: getAllSubstances,
		select: (res) => {
			return res.data.substances.map((el) => {
				return { ...el, storesMovment: [] };
			});
		},
		onSuccess: (data) => {
			setSubstancesData(data);
		},
	});
	const { data: stores } = useQuery({
		queryKey: ["stores", station],
		queryFn: getStoreByStationId,
		select: (res) => res.data.stores.map((el) => el.id),
		enabled: !!station,
	});

	const { data: storesMovmentReport } = useQuery({
		queryKey: [
			"storesMovmentReport",
			"2025-01-01",
			"2025-11-14",
			station,
			stores,
		],
		queryFn: getStoresMovmentSummaryReport,
		select: (res) => {
			const stores = res.data.stores;
			console.log(`stores`, stores);
			// Sum income and prev_value by substance_id (as array)
			const sumBySubstance = stores.reduce((acc, group) => {
				const substanceId = group.substance_id;
				const incomeSum = group.data.reduce(
					(sum, item) => sum + item.income,
					0
				);
				const prevValueSum = group.data.reduce(
					(sum, item) => sum + item.prev_value,
					0
				);
				const currValueSum = group.data.reduce(
					(sum, item) => sum + item.curr_value,
					0
				);
				const totalSpendSum = group.data.reduce(
					(sum, item) => sum + (item.totalSpend || 0),
					0
				);

				acc.push({
					substance_id: substanceId,
					income: incomeSum,
					prev_value: prevValueSum,
					curr_value: currValueSum,
					total_spend: totalSpendSum,
				});

				return acc;
			}, []);
			// Sum totalSpend by substance_id and store.type (as array)
			const sumBySubstanceAndType = stores.reduce((acc, group) => {
				group.data.forEach((item) => {
					const existing = acc.find(
						(el) =>
							el.substance_id === item["store.substance.id"] &&
							el.store_type === item["store.type"]
					);
					if (existing) {
						existing.totalSpend += item.totalSpend;
					} else {
						acc.push({
							substance_id: item["store.substance.id"],
							store_type: item["store.type"],
							totalSpend: item.totalSpend,
						});
					}
				});
				return acc;
			}, []);
			return {
				stores,
				sumBySubstance,
				sumBySubstanceAndType,
			};
		},
		onSuccess: (data) => {
			const updatedSubstances = substances.map((el) => {
				const prev_value =
					data.sumBySubstance.filter((ele) => ele.substance_id === el.id)[0]
						?.prev_value || 0;

				const curr_value =
					data.sumBySubstance.filter((ele) => ele.substance_id === el.id)[0]
						?.curr_value || 0;
				const income =
					data.sumBySubstance.filter((ele) => ele.substance_id === el.id)[0]
						?.income || 0;
				const totalCashSpend =
					data.sumBySubstanceAndType.filter(
						(ele) => ele.substance_id === el.id && ele.store_type === "نقدي"
					)[0]?.totalSpend || 0;
				const totalOthersSpend =
					data.sumBySubstanceAndType.filter(
						(ele) => ele.substance_id === el.id && ele.store_type === "مجنب"
					)[0]?.totalSpend || 0;

				const tank = tanks.filter((ele) => ele.substance.id === el.id);
				let tanksTotalAmount = 0;
				tank.forEach((ele) => {
					tanksTotalAmount += ele.heightInLiter;
				});
				const deficit = +tanksTotalAmount - curr_value;
				const totalSpent = totalCashSpend + totalOthersSpend - deficit;
				const totalIncome = income + prev_value;

				return {
					...el,
					storesMovment: [
						...el.storesMovment,
						{
							num: 1,
							title: "رصيد أول المدة",
							income: +prev_value,
							spent: 0,
							isLocked: true,
							disabled: false,
						},
						{
							num: 2,
							title: "الوارد مشتريات",
							income: +income,
							spent: 0,
							isLocked: true,
							disabled: false,
						},
						{
							num: 3,
							title: "ج  المبيعات العام",
							income: 0,
							spent: +totalCashSpend,
							isLocked: true,
							disabled: false,
						},
						{
							num: 4,
							title: "منصرف أخرى",
							income: 0,
							spent: +totalOthersSpend,
							isLocked: true,
							disabled: false,
						},
						{
							num: 5,
							title: "العجز/الفائض",
							income: 0,
							spent: deficit,
							isLocked: true,
							disabled: false,
						},
						{
							num: 6,
							title: "الاجمالي",
							income: +totalIncome,
							spent: +totalSpent,
							isLocked: true,
							disabled: false,
						},
						{
							num: 7,
							title: "رصيد اخر المدة",
							income: +curr_value,
							spent: 0,
							isLocked: true,
							disabled: true,
						},
						{
							num: 8,
							title: "الرصيد",
							income: 0,
							spent: 0,
							isLocked: true,
							disabled: false,
						},
					],
				};
			});
			setSubstancesData(updatedSubstances);
		},
		enabled: !!station && !!stores && !!tanks,
	});

	useQuery({
		queryKey: ["tanks", station],
		queryFn: getTanksByStationId,
		select: (res) => {
			return res.data.tanks.map((el) => {
				return {
					...el,
					heightInCm: 0,
					heightInLiter: 0,
					tankHeight: 0,
				};
			});
		},
		onSuccess: (data) => {
			setTanks(data);
		},
		enabled: !!station,
	});
	useQuery({
		queryKey: ["movments", station, "2025-11-14"],
		queryFn: getStationMovmentByDate,
		select: (res) => {
			return res.data.movment;
		},
		onSuccess: (data) => {
			if (Object.keys(data).length === 0) {
				setCurrMovmentIsChecked(false);
				toast.error(
					`لايمكن إضافة جرد بسبب عدم اعتماد الحركة بتاريخ  31/12/2025`,
					{
						position: "top-center",
					}
				);
			} else setCurrMovmentIsChecked(true);
		},
		enabled: !!station,
	});
	const { data: dispensersMovments } = useQuery({
		queryKey: ["dispensersMovments", station],
		queryFn: getAnnualDispensersMovment,
		select: (res) => {
			return res.data.dispensersMovments.map((el) => {
				const substance_id = el.max_date_movment.substance_id;
				const dispenser = el.max_date_movment.dispenser;
				return {
					...el,
					substance_id,
					dispenser,
					amount:
						el.max_date_movment.curr_A -
						el.min_date_movment.prev_A +
						el.max_date_movment.curr_B -
						el.min_date_movment.prev_B,
				};
			});
		},

		enabled: currMovmentIsChecked && !!station,
	});
	const saveMutation = useMutation({
		mutationFn: addAnnualStocktaking,
		onSuccess: () => {
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
		if (substancesData.length > 0 && tanks.length > 0) {
			const updatedSubstances = substancesData.map((el) => {
				const tank = tanks.filter((ele) => ele.substance.id === el.id);
				let tanksTotalAmount = 0;
				tank.forEach((ele) => {
					tanksTotalAmount += ele.heightInLiter;
				});
				const deficit =
					+tanksTotalAmount -
					+el.storesMovment.filter((ele) => ele.title === "رصيد اخر المدة")[0]
						?.income;
				// Filter out existing "العجز/الفائض" and "الاجمالي" entries
				const filteredStoresMovment = el.storesMovment.filter(
					(item) =>
						item.title !== "العجز/الفائض" &&
						item.title !== "الاجمالي" &&
						item.title !== "الرصيد"
				);
				const storesIncome = el.storesMovment.filter(
					(el) => el.title === "الوارد مشتريات"
				)[0]?.income;
				const storesSpent = el.storesMovment.filter(
					(el) => el.title === "ج  المبيعات العام"
				)[0]?.spent;
				const storesSpentOthers = el.storesMovment.filter(
					(el) => el.title === "منصرف أخرى"
				)[0]?.spent;
				const prev_value = el.storesMovment.filter(
					(el) => el.title === "رصيد أول المدة"
				)[0]?.income;
				let income = 0;
				let spent = 0;

				if (deficit > 0) {
					income = deficit + storesIncome + prev_value;
					spent = storesSpent + storesSpentOthers;
				} else if (deficit < 0) {
					income = storesIncome + prev_value;
					spent = storesSpent + storesSpentOthers - deficit;
				}

				return {
					...el,
					storesMovment: [
						...filteredStoresMovment,
						{
							num: 5,
							title: "العجز/الفائض",
							income: deficit > 0 ? deficit : 0,
							spent: deficit < 0 ? deficit : 0,
							isLocked: true,
						},
						{
							num: 6,
							title: "الاجمالي",
							income,
							spent,
							isLocked: true,
						},
						{
							num: 8,
							title: "الرصيد",
							income: income - spent,
							spent: 0,
							isLocked: true,
						},
					],
				};
			});
			setSubstancesData(updatedSubstances);
		}
	}, [tanks]);

	const addMemberHandler = () => {
		setMembers((prev) => [
			...prev,
			{
				id: membersCount + 1,
				name: "",
				title: "",
			},
		]);
		setMembersCount((prev) => prev + 1);
	};
	const onSaveMovmentHandler = () => {
		console.log(`substancesData`, substancesData);
		saveMutation.mutate({
			station,
			substances,
			members,
			tanks,
			substancesData,
			dispensersMovments,
			cash,
			totalCash,
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
								<></>
								<></>
							</Row>
						</CardBody>
					</Card>
					{substances &&
						substances.map((substance) => (
							<Card key={substance.id}>
								<CardHeader className="bg-primary text-default-50 font-bold text-medium">
									{substance.name}
								</CardHeader>
								<CardBody>
									{dispensersMovments && (
										<>
											<h1 className="text-lg font-bold text-right underline">
												اولاً:قراءة العدادات خلال العام
											</h1>
											<Table aria-label="Example static collection table">
												<TableHeader>
													<TableColumn>بيانات الطرمبة</TableColumn>

													<TableColumn>بداية العام (أ)</TableColumn>
													<TableColumn>نهاية العام (أ)</TableColumn>
													<TableColumn>بداية العام (ب)</TableColumn>
													<TableColumn>نهاية العام (ب)</TableColumn>
													<TableColumn>المنصرف (لتر)</TableColumn>
												</TableHeader>
												<TableBody>
													{dispensersMovments
														.filter(
															(dispenser) =>
																dispenser.dispenser.tank.substance.id ===
																+substance.id
														)
														.map((dispenser, i) => (
															<TableRow key={i}>
																<TableCell>
																	{dispenser.dispenser.number}-
																	{dispenser.dispenser.tank.substance.name}
																</TableCell>
																<TableCell>
																	{dispenser.min_date_movment.prev_A}
																</TableCell>
																<TableCell>
																	{dispenser.max_date_movment.curr_A}
																</TableCell>
																<TableCell>
																	{dispenser.min_date_movment.prev_B}
																</TableCell>
																<TableCell>
																	{dispenser.max_date_movment.curr_B}
																</TableCell>
																<TableCell>{dispenser.amount}</TableCell>
															</TableRow>
														))}
													<TableRow className="bg-primary text-default-50 ">
														<TableCell className="font-bold text-lg">
															الاجمالي
														</TableCell>
														<TableCell></TableCell>
														<TableCell></TableCell>
														<TableCell></TableCell>
														<TableCell></TableCell>
														<TableCell className="font-bold text-lg">
															{
																storesMovmentReport.sumBySubstance.filter(
																	(total) =>
																		total.substance_id === +substance.id
																)[0]?.total_spend
															}
														</TableCell>
													</TableRow>
												</TableBody>
											</Table>
											<h1 className="text-lg font-bold text-right underline">
												ثانياً:جرد الخزانات
											</h1>
											<Table aria-label="Example static collection table">
												<TableHeader>
													<TableColumn>بيانات الخزان</TableColumn>
													<TableColumn>ارتفاعه</TableColumn>
													<TableColumn>ارتفاع المادة (سم)</TableColumn>
													<TableColumn>ارتفاع المادة (لتر)</TableColumn>
												</TableHeader>
												<TableBody>
													{tanks
														.filter(
															(tank) => tank.substance.id === +substance.id
														)
														.map((tank) => (
															<TableRow key={tank.id}>
																<TableCell>
																	{`${tank.number} - ${tank.substance.name}`}
																</TableCell>
																<TableCell>
																	<Input
																		type="number"
																		value={tank.tankHeight}
																		onChange={(e) => {
																			const updated = tanks.map((el) => {
																				if (el.id === tank.id) {
																					return {
																						...el,
																						tankHeight: +e.target.value,
																					};
																				}
																				return el;
																			});
																			setTanks(updated);
																		}}
																	/>
																</TableCell>
																<TableCell>
																	<Input
																		type="number"
																		value={tank.heightInCm}
																		onChange={(e) => {
																			const updated = tanks.map((el) => {
																				if (el.id === tank.id) {
																					return {
																						...el,
																						heightInCm: +e.target.value,
																					};
																				}
																				return el;
																			});
																			setTanks(updated);
																		}}
																	/>
																</TableCell>
																<TableCell>
																	<Input
																		type="number"
																		value={tank.heightInLiter}
																		onChange={(e) => {
																			const updated = tanks.map((el) => {
																				if (el.id === tank.id) {
																					return {
																						...el,
																						heightInLiter: +e.target.value,
																					};
																				}
																				return el;
																			});
																			setTanks(updated);
																		}}
																	/>
																</TableCell>
															</TableRow>
														))}
												</TableBody>
											</Table>
											<h1 className="text-lg font-bold text-right underline">
												ثالثاً:حركة المادة خلال العام
											</h1>
											<Table aria-label="Example static collection table">
												<TableHeader>
													<TableColumn>البيان</TableColumn>
													<TableColumn>الوارد</TableColumn>
													<TableColumn>المنصرف</TableColumn>
												</TableHeader>
												<TableBody>
													{substancesData.length > 0 &&
														substancesData
															.filter((el) => el.id === substance.id)[0]
															.storesMovment.filter((el) => !el.disabled)
															.sort((a, b) => a.num - b.num)
															.map((substance, i) => (
																<TableRow key={i}>
																	<TableCell>{substance.title}</TableCell>
																	<TableCell>
																		{Math.abs(substance.income)}
																	</TableCell>
																	<TableCell>
																		{Math.abs(substance.spent)}
																	</TableCell>
																</TableRow>
															))}
												</TableBody>
											</Table>
										</>
									)}
								</CardBody>
							</Card>
						))}
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							جرد الخزينة
						</CardHeader>
						<CardBody>
							<Table aria-label="Example static collection table">
								<TableHeader>
									<TableColumn>الفئة</TableColumn>
									<TableColumn>البيان</TableColumn>
									<TableColumn>العدد</TableColumn>
									<TableColumn>المبلغ</TableColumn>
								</TableHeader>
								<TableBody emptyContent="لا توجد بيانات لعرضها">
									{cash.map((el, i) => (
										<TableRow key={i}>
											<TableCell>{el.number}</TableCell>
											<TableCell>{el.title}</TableCell>
											<TableCell>
												<Input
													value={el.amount}
													type="number"
													onChange={(e) => {
														const updated = cash.map((ele) => {
															if (ele.title === el.title) {
																return {
																	...ele,
																	amount: +e.target.value,
																};
															}
															return ele;
														});
														setCash(updated);
														setTotalCash(
															updated.reduce(
																(acc, el) => acc + el.amount * el.number,
																0
															)
														);
													}}
												/>
											</TableCell>
											<TableCell>{el.amount * el.number}</TableCell>
										</TableRow>
									))}
									<TableRow className="bg-primary text-default-50 ">
										<TableCell className="font-bold text-lg">
											الإجمالي
										</TableCell>
										<TableCell></TableCell>
										<TableCell></TableCell>
										<TableCell className="font-bold text-lg">
											{totalCash}
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
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
									<TableColumn>الوظيفة</TableColumn>
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
												<Select
													defaultSelectedKeys={["عضو"]}
													value={member.title}
													onChange={(e) => {
														const updated = members.map((el) => {
															if (el.id === member.id) {
																return {
																	...el,
																	title: e.target.value,
																};
															}
															return el;
														});
														setMembers(updated);
													}}
												>
													<SelectItem key="رئيس">رئيس</SelectItem>
													<SelectItem key="عضو">عضو</SelectItem>
												</Select>
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

export default AnnualStocktakingForm;
