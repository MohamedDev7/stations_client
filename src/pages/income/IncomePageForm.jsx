import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	addIncome,
	editIncome,
	getAllStations,
	getEmployeeByStationId,
	getMovmentsShiftsByMovmentId,
	getStationPendingMovment,
	getStoreByStationId,
	getSubstancesPricesByDate,
} from "../../api/serverApi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { X, Save } from "@mynaui/icons-react";
import {
	Button,
	Select,
	SelectItem,
	Card,
	CardHeader,
	Input,
	CardBody,
} from "@heroui/react";
import TimeChange from "./../../utils/TimeChange";
const IncomePageForm = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [station, setStation] = useState("");
	const [shift, setShift] = useState("");
	const [amount, setAmount] = useState(0);
	const [store, setStore] = useState("");
	const [employee, setEmployee] = useState("");
	const [truckNumber, setTruckNumber] = useState("");
	const [truckDriver, setTruckDriver] = useState("");
	const [docAmount, setDocAmount] = useState(0);
	const [docNumber, setDocNumber] = useState("");
	const [from, setFrom] = useState("");
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
				toast.error("لايمكن إضافة وارد لعدم وجود حركة مفتوحة", {
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
			return res.data.stores.map((el) => {
				const substanceId = el.substance.id;
				let price = 0;
				let substance = {};
				prices.forEach((ele) => {
					if (ele.substance_id === substanceId) {
						price = ele.price;
						substance = { ...el.substance, price };
					}
				});
				return { ...el, price, substance };
			});
		},
		enabled: !!prices && !!station,
	});

	const { data: employees } = useQuery({
		queryKey: ["employees", station],
		queryFn: getEmployeeByStationId,
		select: (res) => {
			return res.data.employees.map((el) => {
				return { text: el.name, key: el.id };
			});
		},
		enabled: !!station,
	});
	const saveMutation = useMutation({
		mutationFn: addIncome,
		onSuccess: (res) => {
			toast.success("تم إضافة الوارد بنجاح", {
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
		mutationFn: editIncome,
		onSuccess: (res) => {
			toast.success("تم تعديل الصندوق بنجاح", {
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

	return (
		<div className="w-full h-full overflow-auto">
			<form
				onSubmit={(e) => {
					e.preventDefault();

					info.state
						? editMutation.mutate({
								name,
								id: info.state.id,
						  })
						: saveMutation.mutate({
								station,
								amount,
								store: stores.filter((el) => el.id === store)[0],
								truckDriver,
								truckNumber,
								employee,
								docAmount,
								docNumber,
								from,
								movmentId: movment,
								shift: shifts.filter((el) => el.id === shift)[0],
						  });
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
								disabled={editMutation.isLoading || saveMutation.isLoading}
							>
								<X />
								الغاء
							</Button>
							<Button
								color="primary"
								type="submit"
								disabled={editMutation.isLoading || saveMutation.isLoading}
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
							بيانات الوارد
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
							<Row flex={[2, 2, 2, 3]}>
								<Input
									isRequired
									label="رقم المستند"
									value={docNumber}
									onChange={(e) => {
										setDocNumber(e.target.value);
									}}
									disabled={!shift && true}
								/>
								<Input
									isRequired
									label="الكمية حسب المستند"
									value={docAmount}
									onChange={(e) => {
										setDocAmount(+e.target.value);
									}}
									disabled={!shift && true}
									onFocus={(e) => e.target.select()}
									type="number"
								/>
								<Select
									label="الجهة الوارد منها"
									onChange={(e) => {
										setFrom(e.target.value);
									}}
									isRequired
									value={from}
								>
									<SelectItem key="نشطون">نشطون</SelectItem>
									<SelectItem key="عمان">عمان</SelectItem>
									<SelectItem key="اخرى">اخرى</SelectItem>
								</Select>

								<></>
							</Row>
							<Row flex={[2, 1, 3]}>
								<Input
									isRequired
									label="الكمية المستلمة"
									value={amount}
									onChange={(e) => {
										setAmount(+e.target.value);
									}}
									onFocus={(e) => e.target.select()}
									disabled={!shift && true}
									type="number"
								/>
								<Select
									label="المستودع"
									onChange={(e) => {
										const store = stores.filter(
											(el) => el.id === +e.target.value
										)[0].id;

										setStore(store);
									}}
									disabled={!shift && true}
									isRequired
									value={store}
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
								<></>
							</Row>
							<Row flex={[1, 2, 2]}>
								<Input
									isRequired
									label="رقم الناقلة"
									disabled={!shift && true}
									value={truckNumber}
									onChange={(e) => {
										setTruckNumber(e.target.value);
									}}
								/>
								<Input
									isRequired
									label="السائق"
									disabled={!shift && true}
									value={truckDriver}
									onChange={(e) => {
										setTruckDriver(e.target.value);
									}}
								/>
								<Select
									label="المستلم"
									onChange={(e) => {
										setEmployee(+e.target.value);
									}}
									disabled={!shift && true}
									isRequired
									value={employee}
								>
									{employees &&
										employees.map((employee) => {
											return (
												<SelectItem key={employee.key}>
													{employee.text}
												</SelectItem>
											);
										})}
								</Select>
							</Row>
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default IncomePageForm;
