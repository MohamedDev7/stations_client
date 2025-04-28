import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import { X, Save } from "@mynaui/icons-react";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	addSurplus,
	editSurplus,
	getAllStations,
	getMovmentsShiftsByMovmentId,
	getShiftsByStationId,
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
} from "@heroui/react";
const SurplusFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [station, setStation] = useState("");
	const [shift, setShift] = useState("");
	const [amount, setAmount] = useState(0);
	const [store, setStore] = useState("");
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
				toast.error("لايمكن إضافة فائض لعدم وجود حركة مفتوحة", {
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
		enabled: !!pendingMovments && !!movment,
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

	const saveMutation = useMutation({
		mutationFn: addSurplus,
		onSuccess: (res) => {
			toast.success("تم إضافة الفائض بنجاح", {
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
		mutationFn: editSurplus,
		onSuccess: (res) => {
			toast.success("تم تعديل الفائض بنجاح", {
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
					info.state
						? editMutation.mutate({
								name,
								id: info.state.id,
						  })
						: saveMutation.mutate({
								station,
								amount,
								store: stores.filter((el) => el.id === store)[0],
								shift: shifts.filter((el) => el.id === shift)[0],
								movmentId: movment,
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
							بيانات الفائض
						</CardHeader>
						<CardBody>
							<Row flex={[2, 2, 1]}>
								<Select
									label="المحطة"
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
							<Row flex={[2, 1, 1, 2]}>
								<Input
									isRequired
									label="كمية الفائض"
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
							</Row>
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default SurplusFormPage;
