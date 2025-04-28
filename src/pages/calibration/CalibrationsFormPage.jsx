import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	addCalibration,
	editCalibration,
	getAllStations,
	getDispensersByStationId,
	getMovmentsShiftsByMovmentId,
	getStationPendingMovment,
	getStoreByStationId,
	getSubstancesPricesByDate,
} from "../../api/serverApi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TimeChange from "./../../utils/TimeChange";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Select,
	SelectItem,
	SelectSection,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { X, Save, Trash } from "@mynaui/icons-react";

const CalibrationFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [station, setStation] = useState("");
	const [shift, setShift] = useState("");
	const [members, setMembers] = useState([]);
	const [membersCount, setMembersCount] = useState(0);
	const [dispensersGroup, setDispensersGroup] = useState([]);
	const [dispensers, setDispensers] = useState([]);
	const [selectedDispensers, setSelectedDispensers] = useState([]);
	const [movment, setMovment] = useState("");
	const [disabledShifts, setDisabledShifts] = useState([]);

	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});

	const { data: pendingMovments } = useQuery({
		queryKey: ["pendingMovments", station],
		queryFn: getStationPendingMovment,
		select: (res) => {
			return res.data.pendingMovment;
		},
		onSuccess: (data) => {
			if (data.length === 0) {
				toast.error("لايمكن إضافة معايرة لعدم وجود حركة مفتوحة", {
					position: "top-center",
				});
			}
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
		select: (res) => {
			return res.data.stores;
		},
		enabled: !!station,
	});

	useQuery({
		queryKey: ["dispensers", station],
		queryFn: getDispensersByStationId,
		select: (res) => {
			const dispensers = res.data.dispensers.map((el) => {
				return {
					...el,
					key: el.id,
					text: `${el.number}-${el.tank.substance.name}`,
					prev_A: 0,
					curr_A: 0,
					prev_B: 0,
					curr_B: 0,
					totalLiters: 0,
				};
			});

			const substancessSet = new Set(
				dispensers.map((el) => el.tank.substance.id)
			);
			const substances = Array.from(substancessSet);
			const substancesArr = substances.map((el) => {
				const text = dispensers.filter((ele) => ele.tank.substance.id === el)[0]
					.tank.substance.name;
				return { key: el, text };
			});
			substancesArr.forEach((el) => {
				el.items = dispensers.filter((ele) => ele.tank.substance.id === el.key);
			});

			return { data: substancesArr, oldData: dispensers };
		},
		onSuccess: (data) => {
			setDispensers(data.oldData);
			setDispensersGroup(data.data);
		},
		enabled: !!station,
	});
	const saveMutation = useMutation({
		mutationFn: addCalibration,
		onSuccess: (res) => {
			toast.success("تم إضافة المعايرة بنجاح", {
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
	const editMutation = useMutation({
		mutationFn: editCalibration,
		onSuccess: (res) => {
			toast.success("تم تعديل المعايرة بنجاح", {
				position: "top-center",
			});
			navigate("./..", {});
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	//functions
	const addCalibrationMemberHandler = () => {
		setMembers((prev) => [
			...prev,
			{
				id: membersCount + 1,
				name: "",
			},
		]);
		setMembersCount((prev) => prev + 1);
	};

	return (
		<div className="w-full h-full overflow-auto ">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const groupedDispensers = dispensers
						.filter((el) => selectedDispensers.includes(`${el.id}`))
						.map((el) => {
							const price = prices.filter(
								(ele) => ele.substance_id === el.tank.substance.id
							)[0].price;
							const store_id = stores.filter(
								(ele) =>
									ele.type === "نقدي" &&
									ele.substance_id === el.tank.substance.id
							)[0].id;
							return { ...el, price, store_id };
						});
					info.state
						? editMutation.mutate({
								name,
								id: info.state.id,
						  })
						: saveMutation.mutate({
								station,
								groupedDispensers,
								movmentId: movment,
								shift: shifts.filter((el) => el.id === shift)[0],
								members,
						  });
				}}
			>
				<TopBar
					right={
						<>
							<Button
								color="secondary"
								icon={<X />}
								onPress={() => {
									navigate("./..");
								}}
							>
								الغاء
							</Button>
							<Button color="primary" icon={<Save />} type="submit">
								حفظ
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							بيانات المعايرة
						</CardHeader>
						<CardBody>
							<Row flex={[2, 2, 2]}>
								<Select
									label="اسم المحطة"
									onChange={(e) => {
										setStation(+e.target.value);
									}}
									isRequired
									value={station}
								>
									{stations &&
										stations.map((station) => {
											return (
												<SelectItem key={station.id}>{station.name}</SelectItem>
											);
										})}
								</Select>
								<Select
									label="الحركة"
									onChange={(e) => {
										setMovment(+e.target.value);
									}}
									isRequired
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
							</Row>
							<Row flex={[1000]}>
								<Select
									label="الطرمبات"
									onChange={(e) => {
										const selectedSet = new Set(e.target.value.split(","));
										setSelectedDispensers(Array.from(selectedSet));
									}}
									selectedKeys={selectedDispensers}
									selectionMode="multiple"
								>
									{dispensersGroup &&
										dispensersGroup.map((dispenser) => {
											return (
												<SelectSection
													showDivider
													title={dispenser.text}
													key={dispenser.key}
												>
													{dispenser.items.map((el) => (
														<SelectItem key={el.id}>{el.text}</SelectItem>
													))}
												</SelectSection>
											);
										})}
								</Select>
								<></>
							</Row>
							{selectedDispensers.length > 0 && (
								<Table aria-label="Default table">
									<TableHeader>
										<TableColumn>بيانات الطرمبة</TableColumn>
										<TableColumn>بداية المناوبة (أ)</TableColumn>
										<TableColumn>نهاية المناوبة (أ)</TableColumn>
										<TableColumn>بداية المناوبة (ب)</TableColumn>
										<TableColumn>نهاية المناوبة (ب)</TableColumn>
										<TableColumn>اجمالي الحركة(لتر)</TableColumn>
									</TableHeader>
									<TableBody>
										{dispensers
											.filter((el) => selectedDispensers.includes(`${el.id}`))
											.map((dispenser) => (
												<TableRow key={dispenser.id}>
													<TableCell>
														{dispenser.number}-{dispenser.tank.substance.name}
													</TableCell>
													<TableCell>
														<Input
															value={dispenser.prev_A}
															onChange={(e) => {
																const updatedDispensers = dispensers.map(
																	(el) => {
																		if (el.id === dispenser.id) {
																			return {
																				...el,
																				prev_A: +e.target.value,
																				totalLiters:
																					+dispenser.curr_A -
																					+e.target.value +
																					(+dispenser.curr_B -
																						+dispenser.prev_B),
																			};
																		}
																		return el;
																	}
																);
																setDispensers(updatedDispensers);
															}}
															type="number"
														/>
													</TableCell>
													<TableCell>
														<Input
															value={dispenser.curr_A}
															validateOnFocusOut
															onChange={(e) => {
																const updatedDispensers = dispensers.map(
																	(el) => {
																		if (el.id === dispenser.id) {
																			return {
																				...el,
																				curr_A: +e.target.value,
																				totalLiters:
																					+e.target.value -
																					+dispenser.prev_A +
																					(+dispenser.curr_B -
																						+dispenser.prev_B),
																			};
																		}
																		return el;
																	}
																);

																setDispensers(updatedDispensers);
															}}
															type="number"
															min={dispenser.prev_A}
														/>
													</TableCell>
													<TableCell>
														<Input
															value={dispenser.prev_B}
															onChange={(e) => {
																const updatedDispensers = dispensers.map(
																	(el) => {
																		if (el.id === dispenser.id) {
																			return {
																				...el,
																				prev_B: +e.target.value,
																				totalLiters:
																					+dispenser.curr_B -
																					+e.target.value +
																					+(
																						+dispenser.curr_A -
																						+dispenser.prev_A
																					),
																			};
																		}
																		return el;
																	}
																);

																setDispensers(updatedDispensers);
															}}
															type="number"
														/>
													</TableCell>
													<TableCell>
														<Input
															value={dispenser.curr_B}
															onChange={(e) => {
																const updatedDispensers = dispensers.map(
																	(el) => {
																		if (el.id === dispenser.id) {
																			return {
																				...el,
																				curr_B: +e.target.value,
																				totalLiters:
																					+e.target.value -
																					+dispenser.prev_B +
																					(+dispenser.curr_A -
																						+dispenser.prev_A),
																			};
																		}
																		return el;
																	}
																);

																setDispensers(updatedDispensers);
															}}
															type="number"
															min={dispenser.prev_B}
														/>
													</TableCell>
													<TableCell>{dispenser.totalLiters}</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							)}
						</CardBody>
					</Card>
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							اعضاء اللجنة
						</CardHeader>
						{members.length > 0 ? (
							<Table aria-label="Default table">
								<TableHeader>
									<TableColumn>اعضاء لجنة المعايرة</TableColumn>
									<TableColumn></TableColumn>
								</TableHeader>
								<TableBody>
									{members.map((member, i) => (
										<TableRow key={i}>
											<TableCell>
												<Input
													value={
														members.filter((el) => el.id === member.id)[0].name
													}
													required
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
												<div style={{ display: "flex", gap: "5px" }}>
													<Button
														color="danger"
														onPress={() =>
															setMembers((prev) =>
																prev.filter((el) => el.id !== member.id)
															)
														}
													>
														<Trash style={{ fontSize: "22px" }} />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							""
						)}
						<Row>
							<Button
								color="primary"
								onPress={() => addCalibrationMemberHandler()}
							>
								إضافة عضو
							</Button>
						</Row>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default CalibrationFormPage;
