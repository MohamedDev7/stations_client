import React, { useEffect, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	getStoreByStationId,
	addShiftMovment,
	getStationMovmentByDate,
	getSubstancesPricesByDate,
	getEmployeeByStationId,
	getStocktakingId,
	getIncomesByMovmentIdAndShiftId,
	getCalibrationsByMovmentIdAndShiftId,
	getSurplusesByMovmentIdAndShiftId,
	getStoresMovmentByMovmentIdAndShiftId,
	getDispensersMovmentByMovmentIdAndShiftId,
} from "../../api/serverApi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TimeChange from "./../../utils/TimeChange";
import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";
import { getPrevDate } from "../../utils/functions";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Checkbox,
	Input,
	Select,
	SelectItem,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { Save, Trash, X, Pause } from "@mynaui/icons-react";

const ShiftForm = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();

	//states
	const [prevData, setPrevData] = useState({
		movmentId: "",
		shiftId: "",
		has_stocktaking: null,
		getStocktaking_id: null,
	});
	const [others, setOthers] = useState([]);
	const [othersCount, setOthersCount] = useState(0);
	const [incomes, setIncomes] = useState([]);
	const [coupons, setCoupons] = useState([]);
	const [couponsCount, setCouponsCount] = useState(0);
	const [surplus, setSurplus] = useState([]);
	const [dispensers, setDispensers] = useState([]);
	const [currStoresMovments, setCurrStoresMovments] = useState([]);
	const [couponsIsChecked, setCouponsIsChecked] = useState(false);
	const [othersIsChecked, setOthersIsChecked] = useState(false);
	const [calibrations, setCalibrations] = useState([]);
	const [creditSalesIsChecked, setCreditSalesIsChecked] = useState(false);
	const [creditSales, setCreditSales] = useState([]);
	const [creditSalesCount, setCreditSalesCount] = useState(0);
	const { data: prices } = useQuery({
		queryKey: ["prices", info.state.date],
		queryFn: getSubstancesPricesByDate,
		select: (res) => {
			return res.data.prices;
		},
	});
	const { data: employees } = useQuery({
		queryKey: ["employees", info.state.station_id],
		queryFn: getEmployeeByStationId,
		select: (res) => {
			return res.data.employees.map((el) => {
				return { text: el.name, key: el.id };
			});
		},
	});
	useQuery({
		queryKey: ["incomes", info.state.movment_id, info.state.shift.id],
		queryFn: getIncomesByMovmentIdAndShiftId,
		select: (res) => {
			return res.data.incomes.map((el) => {
				return {
					id: el.id,
					amount: el.amount,
					substance: el.store.substance.id,
					store: el.store_id,
					truck: el.truck_number,
					driver: el.truck_driver,
					type: "income",
					saved: true,
				};
			});
		},
		onSuccess: (data) => {
			setIncomes(data);
		},
	});
	useQuery({
		queryKey: ["calibrations", info.state.movment_id, info.state.shift.id],
		queryFn: getCalibrationsByMovmentIdAndShiftId,
		select: (res) => {
			return res.data.calibrations.map((el) => {
				return {
					id: el.id,
					amount: el.amount,
					substance: el.store.substance.id,
					store: el.store_id,
					saved: true,
				};
			});
		},
		onSuccess: (data) => {
			setCalibrations(data);
		},
	});
	useQuery({
		queryKey: ["surpluses", info.state.movment_id, info.state.shift.id],
		queryFn: getSurplusesByMovmentIdAndShiftId,
		select: (res) => {
			return res.data.surpluses.map((el) => {
				return {
					id: el.id,
					amount: el.amount,
					substance: el.store.substance.id,
					store: el.store_id,
					saved: true,
				};
			});
		},
		onSuccess: (data) => {
			setSurplus(data);
		},
	});
	const { data: storesName } = useQuery({
		queryKey: ["stores", info.state.station_id],
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
		enabled: !!prices,
	});
	const { refetch: refetchPrevMovment } = useQuery({
		queryKey: [
			"prevMovment",
			info.state.station_id,
			getPrevDate(info.state.date),
		],
		queryFn: getStationMovmentByDate,
		select: (res) => {
			return res.data.movment;
		},
		onSuccess: (data) => {
			setPrevData({
				movmentId: data.id,
				shiftId: data.lastShift.id,
				has_stocktaking: data.has_stocktaking,
				stocktaking_id: data.stocktaking_id,
			});
		},
		enabled: false,
	});

	let { data: stocktakingMovments } = useQuery({
		queryKey: ["stocktaking", prevData.stocktaking_id],
		queryFn: getStocktakingId,
		select: (res) => {
			return res.data.stores.map((el) => {
				const substanceId = el.store.substance.id;
				let price = 0;
				let substance = {};
				let store = {};
				let curr_value;
				let prev_value;
				let deficit;
				prices.forEach((ele) => {
					if (ele.substance_id === substanceId) {
						price = ele.price;
						substance = { ...el.store.substance, price };
						store = { ...el.store, substance };
					}
				});
				if (el.store_adjustment) {
					curr_value = el.curr_value;
					prev_value = el.curr_value;
					deficit = el.prev_value - el.curr_value;
				} else {
					curr_value = el.curr_value;
					prev_value = el.prev_value;
					deficit = 0;
				}
				return {
					...el,
					prev_value:
						el.curr_value < el.prev_value ? el.prev_value : el.curr_value,
					curr_value:
						el.curr_value < el.prev_value ? el.prev_value : el.curr_value,
					price,
					store,
					deficit:
						el.curr_value < el.prev_value ? el.prev_value - el.curr_value : 0,
					totalCoupons: 0,
					totalIncomes: 0,
				};
			});
		},
		onSuccess: (data) => {
			setCurrStoresMovments(data);
		},
		enabled:
			!!prevData.movmentId &&
			!!prevData.shiftId &&
			!!prevData.shiftId &&
			!!prices &&
			!!prevData.has_stocktaking,
	});
	const { data: prevStoresMovments } = useQuery({
		queryKey: ["prevStoresMovments", prevData.movmentId, prevData.shiftId],
		queryFn: getStoresMovmentByMovmentIdAndShiftId,
		select: (res) => {
			return res.data.storesMovments.map((el) => {
				const substanceId = el.store.substance.id;
				let price = 0;
				let substance = {};
				let store = {};
				prices.forEach((ele) => {
					if (ele.substance_id === substanceId) {
						price = ele.price;
						substance = { ...el.store.substance, price };
						store = { ...el.store, substance };
					}
				});

				return {
					...el,
					prev_value: el.curr_value,
					price,
					store,
					totalCoupons: 0,
					totalIncomes: 0,
				};
			});
		},
		onSuccess: (data) => {
			setCurrStoresMovments(data);
			// setPrevStoresMovments(data);
		},
		enabled:
			!!prevData.movmentId &&
			!!prevData.shiftId &&
			!!prices &&
			!prevData.has_stocktaking,
	});
	useQuery({
		queryKey: ["dispensers", prevData.movmentId, prevData.shiftId],
		queryFn: getDispensersMovmentByMovmentIdAndShiftId,
		select: (res) => {
			return res.data.dispensersMovments.map((el) => {
				const substanceId = el.dispenser.tank.substance.id;
				let price = 0;
				let substance = {};
				let tank = {};
				let dispenser = {};
				prices.forEach((ele) => {
					if (ele.substance_id === substanceId) {
						price = ele.price;
						substance = { ...el.dispenser.tank.substance, price };
						tank = { ...el.dispenser.tank, substance };
						dispenser = { ...el.dispenser, tank };
					}
				});
				return {
					...el,
					totalLiters: 0,
					totalValue: 0,
					prev_A: el.curr_A,
					prev_B: el.curr_B,
					dispenser,
					employee_id: null,
				};
			});
		},
		onSuccess: (data) => {
			setDispensers(data);
		},
		enabled: !!prevData.movmentId && !!prevData.shiftId && !!prices,
	});
	const saveMutation = useMutation({
		mutationFn: addShiftMovment,
		onSuccess: (res) => {
			toast.success("تم إضافة الحركة بنجاح", {
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
		setPrevData({
			movmentId: "",
			shiftId: "",
			has_stocktaking: null,
		});

		if (info.state.shift.number === 1) {
			//قراءة مناوبات اليوم السابق

			refetchPrevMovment();
		} else {
			//قراءة مناوبات اليوم الحالي

			setPrevData({
				movmentId: info.state.movment_id,
				shiftId: info.state.prevShiftId,
				has_stocktaking: 0,
			});
		}
	}, [info]);

	const addOthersHandler = () => {
		setOthers((prev) => [
			...prev,
			{
				id: othersCount + 1,
				title: "",
				store: null,
				amount: 0,
				substance: null,
				value: 0,
				saved: false,
				employee_id: "",
				type: "normal",
			},
		]);
		setOthersCount((prev) => prev + 1);
	};

	const addCouponsHandler = () => {
		setCoupons((prev) => [
			...prev,
			{
				id: couponsCount + 1,
				amount: "",
				store: null,
				substance: null,
				type: null,
				employee_id: "",
				saved: false,
			},
		]);
		setCouponsCount((prev) => prev + 1);
	};
	const addCreditSalesHandler = () => {
		setCreditSales((prev) => [
			...prev,
			{
				id: creditSalesCount + 1,
				amount: 0,
				store: null,
				beneficiary: null,
				substance: "",
				title: "",
				employee_id: "",
				saved: false,
			},
		]);
		setCreditSalesCount((prev) => prev + 1);
	};
	const saveOtherHandler = (item) => {
		let othersTotal = 0;
		let dispensersTotal = 0;
		if (
			others.filter(
				(el) => !el.amount || !el.title || !el.employee_id || !el.store
			).length > 0
		) {
			toast.error("يرجى التأكد من تعبئة جمبيع الحقول بشكل صحيح", {
				position: "top-center",
			});
			return;
		}
		others
			.filter((el) => el.substance.id === item.substance.id)
			.forEach((el) => (othersTotal = othersTotal + el.amount));
		dispensers
			.filter((el) => el.dispenser.tank.substance.id === item.substance.id)
			.forEach((el) => (dispensersTotal = dispensersTotal + el.totalLiters));
		const storeToUpdate = currStoresMovments.filter(
			(el) => el.store.id === item.store
		)[0];

		if (storeToUpdate.curr_value < item.amount) {
			toast.error("لا يمكن ان يكون رصيد المخزن بالسالب", {
				position: "top-center",
			});
			return;
		}
		if (othersTotal > dispensersTotal) {
			toast.error("القيمة المدخلة أكبر من مبيعات النوبة", {
				position: "top-center",
			});
			return;
		}

		setOthers((prev) =>
			prev.filter((el) => el.id !== item.id).concat({ ...item, saved: true })
		);
	};

	const saveCouponsHandler = (item) => {
		let dispensersTotal = 0;
		if (
			coupons.filter(
				(el) => !el.amount || !el.type || !el.employee_id || !el.store
			).length > 0
		) {
			toast.error("يرجى التأكد من تعبئة جمبيع الحقول بشكل صحيح", {
				position: "top-center",
			});
			return;
		}

		dispensers
			.filter((el) => el.dispenser.tank.substance.id === item.substance.id)
			.forEach((el) => (dispensersTotal = dispensersTotal + el.totalLiters));
		const storeToUpdate = currStoresMovments.filter(
			(el) => el.store.id === item.store
		)[0];
		console.log(`storeToUpdate`, storeToUpdate);
		if (storeToUpdate.curr_value < item.amount) {
			toast.error("لا يمكن ان يكون رصيد المخزن بالسالب", {
				position: "top-center",
			});
			return;
		}
		if (
			storeToUpdate.totalCreditSales +
				storeToUpdate.totalCoupons +
				+(+item.amount) >
			dispensersTotal
		) {
			toast.error("القيمة المدخلة أكبر من مبيعات النوبة", {
				position: "top-center",
			});
			return;
		}
		setCoupons((prev) =>
			prev.filter((el) => el.id !== item.id).concat({ ...item, saved: true })
		);
	};
	const saveCreditSalesHandler = (item) => {
		let dispensersTotal = 0;
		dispensers
			.filter((el) => el.dispenser.tank.substance.id === item.substance.id)
			.forEach((el) => (dispensersTotal = dispensersTotal + el.totalLiters));

		if (
			creditSales.filter(
				(el) =>
					!el.amount ||
					!el.title ||
					!el.employee_id ||
					!el.store ||
					!el.beneficiary
			).length > 0
		) {
			toast.error("يرجى التأكد من تعبئة جمبيع الحقول بشكل صحيح", {
				position: "top-center",
			});
			return;
		}

		const storeToUpdate = currStoresMovments.filter(
			(el) => el.store.id === item.store
		)[0];

		if (storeToUpdate.curr_value < item.amount) {
			toast.error("لا يمكن ان يكون رصيد المخزن بالسالب", {
				position: "top-center",
			});
			return;
		}
		if (
			storeToUpdate.totalCoupons +
				storeToUpdate.totalCreditSales +
				+item.amount >
			dispensersTotal
		) {
			toast.error("القيمة المدخلة أكبر من مبيعات النوبة", {
				position: "top-center",
			});
			return;
		}
		setCreditSales((prev) =>
			prev.filter((el) => el.id !== item.id).concat({ ...item, saved: true })
		);
	};
	const updateCurrStoresMovments = () => {
		let updatedStoresMovments = [];
		if (prevData.has_stocktaking === 0) {
			updatedStoresMovments = [...prevStoresMovments];
		} else {
			updatedStoresMovments = [...stocktakingMovments];
		}

		updatedStoresMovments.forEach((ele) => {
			ele.totalIncomes = 0;
			ele.totalCoupons = 0;
			ele.totalCreditSales = 0;
			// ele.otherSpends = 0;
		});
		updatedStoresMovments.forEach((el) => {
			incomes.forEach((ele) => {
				if (el.store.id === ele.store) {
					el.curr_value = el.curr_value + +ele.amount;
					el.totalIncomes = el.totalIncomes + +ele.amount;
				}
			});
		});
		updatedStoresMovments.forEach((el) => {
			surplus.forEach((ele) => {
				if (el.store.id === ele.store) {
					el.curr_value = el.curr_value + +ele.amount;
					el.totalIncomes = el.totalIncomes + +ele.amount;
				}
			});
		});
		updatedStoresMovments.forEach((el) => {
			creditSales.forEach((ele) => {
				if (el.store.id === ele.store) {
					// el.curr_value = el.curr_value - +ele.amount;
					el.totalCreditSales = el.totalCreditSales + +ele.amount;
				}
			});
		});
		updatedStoresMovments.forEach((el) => {
			others.forEach((ele) => {
				if (el.store.id === ele.store) {
					el.curr_value = el.curr_value - +ele.amount;
				}
			});
		});
		updatedStoresMovments.forEach((el) => {
			coupons.forEach((ele) => {
				if (el.store.id === ele.store) {
					el.totalCoupons = el.totalCoupons + +ele.amount;
				}
			});
		});
		updatedStoresMovments.forEach((el) => {
			calibrations.forEach((ele) => {
				if (el.store.id === ele.store) {
					el.curr_value = el.curr_value + +ele.amount;
					el.totalIncomes = el.totalIncomes + +ele.amount;
					// el.otherSpends = el.otherSpends + +ele.amount;
				}
			});
		});

		const totalDispensersLitersBySubstance = {};
		dispensers.forEach((element) => {
			const substanceId = element.dispenser.tank.substance.id;
			const totalLiters = element.totalLiters;
			totalDispensersLitersBySubstance[substanceId] =
				(totalDispensersLitersBySubstance[substanceId] || 0) + totalLiters;
		});
		const totalOthersLitersBySubstance = {};
		others.forEach((element) => {
			const substanceId = element.substance.id;
			const totalLiters = element.amount;
			totalOthersLitersBySubstance[substanceId] =
				(totalOthersLitersBySubstance[substanceId] || 0) + totalLiters;
		});
		updatedStoresMovments.forEach((el) => {
			if (el.store.type === "نقدي") {
				const totalDispensersLiters =
					totalDispensersLitersBySubstance[el.store.substance.id] || 0;
				const totalOthersLiters =
					totalOthersLitersBySubstance[el.store.substance.id] || 0;

				incomes.filter((ele) => ele.store === el.store.id);

				el.curr_value =
					el.curr_value - totalDispensersLiters + totalOthersLiters;
			}
		});
		console.log(`updatedStoresMovments`, updatedStoresMovments);
		setCurrStoresMovments(updatedStoresMovments);
	};
	useEffect(() => {
		if (
			others.filter((el) => !el.saved).length === 0 &&
			coupons.filter((el) => !el.saved).length === 0 &&
			creditSales.filter((el) => !el.saved).length === 0 &&
			incomes.filter((el) => !el.saved).length === 0 &&
			surplus.filter((el) => !el.saved).length === 0 &&
			prices &&
			prices.length > 0 &&
			(prevStoresMovments || stocktakingMovments)
		) {
			updateCurrStoresMovments();
		}
	}, [
		others,
		incomes,
		dispensers,
		calibrations,
		creditSales,
		surplus,
		coupons,
		prices,
	]);
	const onSaveMovmentHandler = () => {
		if (
			others.filter((el) => el.saved === false).length > 0 ||
			coupons.filter((el) => el.saved === false).length > 0
		) {
			toast.error("يرجى التأكد من حفظ جميع المسحوبات الاخرى ومسحوبات الفرع", {
				position: "top-center",
			});
			return;
		}
		saveMutation.mutate({
			dispensers,
			station_id: info.state.station_id,
			movment_id: info.state.movment_id,
			shift: info.state.shift,
			date: info.state.date,
			others,
			currStoresMovments,
			creditSales,
			coupons,
			state: "saved",
		});
	};
	const onHoldMovmentHandler = () => {
		if (
			others.filter((el) => el.saved === false).length > 0 ||
			coupons.filter((el) => el.saved === false).length > 0
		) {
			toast.error("يرجى التأكد من حفظ جميع المسحوبات الاخرى ومسحوبات الفرع", {
				position: "top-center",
			});
			return;
		}
		saveMutation.mutate({
			dispensers,
			station_id: info.state.station_id,
			movment_id: info.state.movment_id,
			shift: info.state.shift,
			date: info.state.date,
			others,
			currStoresMovments,
			creditSales,
			coupons,
			state: "pending",
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
								color="default"
								onPress={() => {
									onHoldMovmentHandler();
								}}
								disabled={saveMutation.isLoading}
							>
								<Pause />
								تعليق
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
							بيانات النوبة
						</CardHeader>
						<CardBody className="flex flex-col gap-5">
							<div className="flex gap-5 ">
								<Input
									label="اسم المحطة"
									className="max-w-xs"
									value={info.state.station_name}
									readOnly
								/>
								<Input
									label="رقم الحركة"
									className="max-w-xs"
									value={info.state.number}
									readOnly
								/>
								<Input
									label="المناوبة"
									className="max-w-xs"
									value={`${info.state.shift.number}- من ${TimeChange(
										info.state.shift.start
									)} الى ${TimeChange(info.state.shift.end)}`}
									readOnly
								/>
							</div>
							<div className=" flex gap-5">
								<Checkbox
									isSelected={couponsIsChecked}
									onChange={() => {
										setCoupons([]);
										setCouponsCount(0);
										setCouponsIsChecked((prev) => !prev);
									}}
								>
									مسحوبات الفرع
								</Checkbox>
								<Checkbox
									isSelected={othersIsChecked}
									onChange={() => {
										setOthers([]);
										setOthersCount(0);
										setOthersIsChecked((prev) => !prev);
									}}
								>
									مسحوبات اخرى
								</Checkbox>
								<Checkbox
									isSelected={creditSalesIsChecked}
									onChange={() => {
										setCreditSales([]);
										setCreditSalesCount(0);
										setCreditSalesIsChecked((prev) => !prev);
									}}
								>
									مبيعات آجلة
								</Checkbox>
							</div>
						</CardBody>
					</Card>
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							خلاصة الحركة
						</CardHeader>
						<CardBody>
							<Table removeWrapper aria-label="Default table">
								<TableHeader>
									<TableColumn>المخزن</TableColumn>
									<TableColumn>الرصيد السابق(لتر)</TableColumn>
									<TableColumn>الوارد(لتر)</TableColumn>
									<TableColumn>مبيعات نقدية(لتر)</TableColumn>
									<TableColumn>مسحوبات الفرع(لتر)</TableColumn>
									<TableColumn>مبيعات آجلة(لتر)</TableColumn>
									<TableColumn>الرصيد الحالي(لتر)</TableColumn>
									<TableColumn>النقدية</TableColumn>
								</TableHeader>
								<TableBody>
									{currStoresMovments &&
										currStoresMovments.map((item, i) => (
											<TableRow key={i}>
												<TableCell>{`${item.store.name} - ${item.store.substance.name}`}</TableCell>
												<TableCell>{item.prev_value || 0}</TableCell>
												<TableCell>{item.totalIncomes || 0}</TableCell>
												<TableCell>
													{(item.prev_value || 0) -
														(item.curr_value || 0) +
														(item.totalIncomes || 0) -
														(item.totalCoupons || 0) -
														(item.totalCreditSales || 0)}
												</TableCell>
												<TableCell>{item.totalCoupons || 0}</TableCell>
												<TableCell>{item.totalCreditSales || 0}</TableCell>
												<TableCell>{item.curr_value || 0}</TableCell>
												<TableCell>
													{((item.prev_value || 0) -
														(item.curr_value || 0) +
														(item.totalIncomes || 0) -
														(item.totalCreditSales || 0) -
														(item.totalCoupons || 0)) *
														(item.price || 0)}
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</CardBody>
					</Card>
					{dispensers && dispensers.length > 0 && (
						<Card>
							<CardHeader className="bg-primary text-default-50 font-bold text-medium">
								حركة العدادات
							</CardHeader>
							<CardBody>
								<Table removeWrapper aria-label="Default table">
									<TableHeader>
										<TableColumn>بيانات الطرمبة</TableColumn>
										<TableColumn>بداية المناوبة (أ)</TableColumn>
										<TableColumn>نهاية المناوبة (أ)</TableColumn>
										<TableColumn>بداية المناوبة (ب)</TableColumn>
										<TableColumn>نهاية المناوبة (ب)</TableColumn>
										<TableColumn>اجمالي الحركة(لتر)</TableColumn>
										<TableColumn className="min-w-48">الموظف</TableColumn>
									</TableHeader>
									<TableBody>
										{dispensers.map((dispenser) => (
											<TableRow key={dispenser.id}>
												<TableCell>
													{`${
														dispensers.filter((el) => el.id === dispenser.id)[0]
															.dispenser.number
													}-${
														dispensers.filter((el) => el.id === dispenser.id)[0]
															.dispenser.tank.substance.name
													}`}
												</TableCell>
												<TableCell>
													{
														dispensers.filter((el) => el.id === dispenser.id)[0]
															.prev_A
													}
												</TableCell>
												<TableCell>
													<Input
														value={
															dispensers.filter(
																(el) => el.id === dispenser.id
															)[0].curr_A
														}
														onGetErrorMessage={(value) => {
															return value >= dispenser.prev_A
																? ""
																: `يجب ان تكون القيمة اكبر من او يساوي  ${dispenser.prev_A}.`;
														}}
														validateOnFocusOut
														onChange={(e) => {
															e.stopPropagation();
															const updatedDispensers = dispensers.map((el) => {
																if (el.id === dispenser.id) {
																	return {
																		...el,
																		curr_A: +e.target.value,
																		totalLiters:
																			+e.target.value -
																			dispenser.prev_A +
																			(dispenser.curr_B - dispenser.prev_B),
																		totalValue:
																			(+e.target.value -
																				dispenser.prev_A +
																				(dispenser.curr_B - dispenser.prev_B)) *
																			dispenser.price,
																	};
																}
																return el;
															});

															setDispensers(updatedDispensers);
														}}
														onFocus={(e) => e.target.select()}
														onWheel={(e) => e.target.blur()}
														onKeyDown={(e) => {
															if (
																e.key === "ArrowUp" ||
																e.key === "ArrowDown"
															) {
																e.preventDefault();
															}
														}}
														type="number"
														min={dispenser.prev_A}
													/>
												</TableCell>
												<TableCell>
													{
														dispensers.filter((el) => el.id === dispenser.id)[0]
															.prev_B
													}
												</TableCell>
												<TableCell>
													<Input
														value={
															dispensers.filter(
																(el) => el.id === dispenser.id
															)[0].curr_B
														}
														onGetErrorMessage={(value) => {
															return value >= dispenser.prev_B
																? ""
																: `يجب ان تكون القيمة اكبر من او يساوي  ${dispenser.prev_B}.`;
														}}
														validateOnFocusOut
														onChange={(e) => {
															e.stopPropagation();

															const updatedDispensers = dispensers.map((el) => {
																if (el.id === dispenser.id) {
																	return {
																		...el,
																		curr_B: +e.target.value,
																		totalLiters:
																			+e.target.value -
																			dispenser.prev_B +
																			(dispenser.curr_A - dispenser.prev_A),
																		totalValue:
																			(+e.target.value -
																				dispenser.prev_B +
																				(dispenser.curr_A - dispenser.prev_A)) *
																			dispenser.price,
																	};
																}
																return el;
															});

															setDispensers(updatedDispensers);
														}}
														onFocus={(e) => e.target.select()}
														onWheel={(e) => e.target.blur()}
														onKeyDown={(e) => {
															if (
																e.key === "ArrowUp" ||
																e.key === "ArrowDown"
															) {
																e.preventDefault();
															}
														}}
														type="number"
														min={dispenser.prev_B}
													/>
												</TableCell>
												<TableCell>{dispenser.totalLiters || 0}</TableCell>
												<TableCell>
													<Select
														label="اسم المستلم"
														onChange={(e) => {
															const updatedDispensers = dispensers.map((el) => {
																if (el.id === dispenser.id) {
																	return {
																		...el,
																		employee_id: e.target.value,
																	};
																}
																return el;
															});

															setDispensers(updatedDispensers);
														}}
														value={
															dispensers.filter(
																(el) => el.id === dispenser.id
															)[0].employee_id
														}
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
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardBody>
						</Card>
					)}
					{couponsIsChecked && (
						<Card>
							<CardHeader className="bg-primary text-default-50 font-bold text-medium">
								مسحوبات الفرع
							</CardHeader>
							<CardBody>
								{coupons.length > 0 ? (
									<Table aria-label="Default table">
										<TableHeader>
											<TableColumn className="w-1/5">الكمية</TableColumn>
											<TableColumn className="w-1/5">المستودع</TableColumn>
											<TableColumn className="w-1/5">النوع</TableColumn>
											<TableColumn className="w-1/5">الموظف</TableColumn>
											<TableColumn className="w-1/5">خيارات</TableColumn>
										</TableHeader>
										<TableBody>
											{coupons.map((item, i) => (
												<TableRow key={i}>
													<TableCell>
														<Input
															value={
																coupons.filter((el) => el.id === item.id)[0]
																	.amount
															}
															isDisabled={item.saved}
															onFocus={(e) => e.target.select()}
															onWheel={(e) => e.target.blur()}
															onKeyDown={(e) => {
																if (
																	e.key === "ArrowUp" ||
																	e.key === "ArrowDown"
																) {
																	e.preventDefault();
																}
															}}
															onChange={(e) => {
																const updated = coupons.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			amount: e.target.value,
																		};
																	}
																	return el;
																});
																setCoupons(updated);
															}}
															type="number"
														/>
													</TableCell>
													<TableCell>
														<Select
															label="المستودع"
															isDisabled={item.saved}
															className="max-w-xs"
															onChange={(e) => {
																const updated = coupons.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			store: +e.target.value,
																			substance: storesName.filter(
																				(el) => el.id === +e.target.value
																			)[0].substance,
																		};
																	}
																	return el;
																});
																setCoupons(updated);
															}}
															value={
																coupons.filter((el) => el.id === item.id)[0]
																	.store
															}
														>
															{storesName &&
																storesName
																	.filter((el) => el.type === "نقدي")
																	.map((el) => {
																		return (
																			<SelectItem key={el.id}>
																				{`${el.name} - ${el.substance.name}`}
																			</SelectItem>
																		);
																	})}
														</Select>
													</TableCell>
													<TableCell>
														<Select
															label="النوع"
															isDisabled={item.saved}
															className="max-w-xs"
															onChange={(e) => {
																const updated = coupons.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			type: e.target.value,
																		};
																	}
																	return el;
																});
																setCoupons(updated);
															}}
															value={
																coupons.filter((el) => el.id === item.id)[0]
																	.store
															}
														>
															<SelectItem key={1}>كوبونات</SelectItem>
															<SelectItem key={2}>اخرى</SelectItem>
														</Select>
													</TableCell>
													<TableCell>
														<Select
															label="اسم الموظف"
															isDisabled={item.saved}
															onChange={(e) => {
																const updated = coupons.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			employee_id: e.target.value,
																		};
																	}
																	return el;
																});
																setCoupons(updated);
															}}
															value={
																coupons.filter((el) => el.id === item.id)[0]
																	.employee_id
															}
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
													</TableCell>
													<TableCell>
														<div style={{ display: "flex", gap: "5px" }}>
															<Button
																color="primary"
																onPress={() => saveCouponsHandler(item)}
																isDisabled={item.saved}
															>
																<Save />
															</Button>

															<Button
																onPress={() =>
																	setCoupons((prev) =>
																		prev.filter((el) => el.id !== item.id)
																	)
																}
																color="danger"
															>
																<Trash />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								) : (
									<EmptyContainer msg="لا توجد بيانات" />
								)}
								<Row>
									<Button
										color="primary"
										onPress={() => {
											addCouponsHandler();
										}}
										isDisabled={
											others.filter((el) => el.saved === false).length > 0 ||
											creditSales.filter((el) => el.saved === false).length >
												0 ||
											coupons.filter((el) => el.saved === false).length > 0
										}
									>
										إضافة
									</Button>
								</Row>
							</CardBody>
						</Card>
					)}
					{othersIsChecked && (
						<Card>
							<CardHeader className="bg-primary text-default-50 font-bold text-medium">
								مسحوبات اخرى
							</CardHeader>
							<CardBody>
								{others.length > 0 ? (
									<Table aria-label="Default table">
										<TableHeader>
											<TableColumn className="w-1/6">المخزن</TableColumn>
											<TableColumn className="w-1/6">البيان</TableColumn>
											<TableColumn className="w-1/6">الكمية</TableColumn>
											<TableColumn className="w-1/6">اجمالي المبلغ</TableColumn>
											<TableColumn className="w-1/6">الموظف</TableColumn>
											<TableColumn className="w-1/6"></TableColumn>
										</TableHeader>
										<TableBody>
											{others.map((item) => (
												<TableRow key={item.id}>
													<TableCell>
														<Select
															label="المستودع"
															isDisabled={item.saved}
															onChange={(e) => {
																const updated = others.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			store: +e.target.value,
																			substance: storesName.filter(
																				(ele) => ele.id === +e.target.value
																			)[0].substance,
																		};
																	}
																	return el;
																});
																setOthers(updated);
															}}
															value={
																others.filter((el) => el.id === item.id)[0]
																	.store
															}
															// disabled={item.saved}
														>
															{storesName &&
																storesName
																	.filter((el) => el.type === "مجنب")
																	.map((el) => {
																		return (
																			<SelectItem key={el.id}>
																				{`${el.name} - ${el.substance.name}`}
																			</SelectItem>
																		);
																	})}
														</Select>
													</TableCell>
													<TableCell>
														<Input
															value={
																others.filter((el) => el.id === item.id)[0]
																	.title
															}
															isDisabled={item.saved}
															onChange={(e) => {
																e.stopPropagation();
																const updated = others.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			title: e.target.value,
																		};
																	}
																	return el;
																});
																setOthers(updated);
															}}
															onFocus={(e) => e.target.select()}
															onWheel={(e) => e.target.blur()}
															onKeyDown={(e) => {
																if (
																	e.key === "ArrowUp" ||
																	e.key === "ArrowDown"
																) {
																	e.preventDefault();
																}
															}}
														/>
													</TableCell>
													<TableCell>
														<Input
															value={
																others.filter((el) => el.id === item.id)[0]
																	.amount
															}
															isDisabled={item.saved}
															onChange={(e) => {
																const updated = others.map((other) => {
																	if (other.id === item.id) {
																		return {
																			...other,
																			amount: +e.target.value,
																			value: item.substance.price
																				? item.substance.price * +e.target.value
																				: 0,
																		};
																	} else {
																		return other;
																	}
																});
																setOthers(updated);
															}}
															// onFocus={(e) => e.target.select()}
															onWheel={(e) => e.target.blur()}
															onKeyDown={(e) => {
																if (
																	e.key === "ArrowUp" ||
																	e.key === "ArrowDown"
																) {
																	e.preventDefault();
																}
															}}
															type="number"
															min="1"
														/>
													</TableCell>
													<TableCell>
														{others.filter((el) => el.id === item.id)[0].value}
													</TableCell>
													<TableCell>
														<Select
															label="اسم الموظف"
															isDisabled={item.saved}
															onChange={(e) => {
																const updated = others.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			employee_id: e.target.value,
																		};
																	}
																	return el;
																});
																setOthers(updated);
															}}
															value={
																others.filter((el) => el.id === item.id)[0]
																	.employee_id
															}
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
													</TableCell>
													<TableCell>
														<div style={{ display: "flex", gap: "5px" }}>
															<Button
																color="primary"
																onPress={() => saveOtherHandler(item)}
																isDisabled={item.saved}
															>
																<Save />
															</Button>
															<Button
																onPress={() =>
																	setOthers((prev) =>
																		prev.filter((el) => el.id !== item.id)
																	)
																}
																color="danger"
															>
																<Trash />
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
										onPress={() => addOthersHandler()}
										isDisabled={
											others.filter((el) => el.saved === false).length > 0 ||
											creditSales.filter((el) => el.saved === false).length >
												0 ||
											coupons.filter((el) => el.saved === false).length > 0
										}
									>
										إضافة
									</Button>
								</Row>
							</CardBody>
						</Card>
					)}
					{creditSalesIsChecked && (
						<Card>
							<CardHeader className="bg-primary text-default-50 font-bold text-medium">
								مبيعات آجلة
							</CardHeader>
							<CardBody>
								{creditSales.length > 0 ? (
									<Table aria-label="Default table">
										<TableHeader>
											<TableColumn className="w-1/5">الكمية</TableColumn>
											<TableColumn className="w-1/5">المستودع</TableColumn>
											<TableColumn className="w-1/5">المستفيد</TableColumn>
											<TableColumn className="w-1/5">البيان</TableColumn>
											<TableColumn className="w-1/5">الموظف</TableColumn>
											<TableColumn className="w-1/5">خيارات</TableColumn>
										</TableHeader>
										<TableBody>
											{creditSales.map((item, i) => (
												<TableRow key={i}>
													<TableCell>
														<Input
															value={
																creditSales.filter((el) => el.id === item.id)[0]
																	.amount
															}
															isDisabled={item.saved}
															onFocus={(e) => e.target.select()}
															onWheel={(e) => e.target.blur()}
															onKeyDown={(e) => {
																if (
																	e.key === "ArrowUp" ||
																	e.key === "ArrowDown"
																) {
																	e.preventDefault();
																}
															}}
															onChange={(e) => {
																const updated = creditSales.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			amount: e.target.value,
																		};
																	}
																	return el;
																});
																setCreditSales(updated);
															}}
															type="number"
														/>
													</TableCell>
													<TableCell>
														<Select
															label="المستودع"
															isDisabled={item.saved}
															className="max-w-xs"
															onChange={(e) => {
																const updated = creditSales.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			store: +e.target.value,
																			substance: storesName.filter(
																				(el) => el.id === +e.target.value
																			)[0].substance,
																		};
																	}
																	return el;
																});
																setCreditSales(updated);
															}}
															value={
																creditSales.filter((el) => el.id === item.id)[0]
																	.store
															}
														>
															{storesName &&
																storesName.map((el) => {
																	return (
																		<SelectItem key={el.id}>
																			{`${el.name} - ${el.substance.name}`}
																		</SelectItem>
																	);
																})}
														</Select>
													</TableCell>
													<TableCell>
														<Select
															label="المستفيد"
															className="max-w-xs"
															isDisabled={item.saved}
															onChange={(e) => {
																const updated = creditSales.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			beneficiary: +e.target.value,
																		};
																	}
																	return el;
																});
																setCreditSales(updated);
															}}
															value={
																creditSales.filter((el) => el.id === item.id)[0]
																	.beneficiary
															}
														>
															{storesName &&
																storesName.map((el) => {
																	return (
																		<SelectItem key={el.id}>
																			{`${el.name} - ${el.substance.name}`}
																		</SelectItem>
																	);
																})}
														</Select>
													</TableCell>
													<TableCell>
														<Input
															value={
																creditSales.filter((el) => el.id === item.id)[0]
																	.title
															}
															isDisabled={item.saved}
															onChange={(e) => {
																e.stopPropagation();
																const updated = creditSales.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			title: e.target.value,
																		};
																	}
																	return el;
																});
																setCreditSales(updated);
															}}
															onFocus={(e) => e.target.select()}
															onWheel={(e) => e.target.blur()}
															onKeyDown={(e) => {
																if (
																	e.key === "ArrowUp" ||
																	e.key === "ArrowDown"
																) {
																	e.preventDefault();
																}
															}}
														/>
													</TableCell>
													<TableCell>
														<Select
															label="اسم الموظف"
															onChange={(e) => {
																const updated = creditSales.map((el) => {
																	if (el.id === item.id) {
																		return {
																			...el,
																			employee_id: e.target.value,
																		};
																	}
																	return el;
																});
																setCreditSales(updated);
															}}
															isDisabled={item.saved}
															value={
																creditSales.filter((el) => el.id === item.id)[0]
																	.employee_id
															}
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
													</TableCell>
													<TableCell>
														<div style={{ display: "flex", gap: "5px" }}>
															<Button
																color="primary"
																onPress={() => saveCreditSalesHandler(item)}
																isDisabled={item.saved}
															>
																<Save />
															</Button>

															<Button
																onPress={() =>
																	setCreditSales((prev) =>
																		prev.filter((el) => el.id !== item.id)
																	)
																}
																color="danger"
															>
																<Trash />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								) : (
									<EmptyContainer msg="لا توجد بيانات" />
								)}
								<Row>
									<Button
										color="primary"
										onPress={() => addCreditSalesHandler()}
										isDisabled={
											others.filter((el) => el.saved === false).length > 0 ||
											creditSales.filter((el) => el.saved === false).length >
												0 ||
											coupons.filter((el) => el.saved === false).length > 0
										}
									>
										إضافة
									</Button>
								</Row>
							</CardBody>
						</Card>
					)}
				</div>
			</form>
		</div>
	);
};

export default ShiftForm;
