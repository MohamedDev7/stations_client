import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	getAllStations,
	addMovment,
	getStationMovmentByDate,
} from "../../api/serverApi";
import { useLocation, useNavigate } from "react-router-dom";
import { Save, X } from "@mynaui/icons-react";
import { toast } from "react-toastify";
import { Button } from "@heroui/button";
import {
	Card,
	CardBody,
	CardHeader,
	DatePicker,
	Input,
	Select,
	SelectItem,
} from "@heroui/react";
const DailyMovmentForm = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();

	//states
	const [station, setStation] = useState("");
	const [date, setDate] = useState(null);
	const [prevDate, setPrevDate] = useState("");
	const [number, setNumber] = useState("");
	//queries

	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});
	useQuery({
		queryKey: ["LastMovments", station, prevDate],
		queryFn: getStationMovmentByDate,
		onSuccess: (res) => {
			if (!res.data.movment) {
				setNumber("");
				toast.error("لم يتم ادخال حركة اليوم السابق", {
					position: "top-center",
				});
				return;
			}
			let movmentNumber = +res.data.movment.number.substring(4) + 1;
			const movmentStr = `${movmentNumber}`.padStart(4, "0");
			const fullNumber = `${res.data.movment.number.substring(
				0,
				4
			)}${movmentStr}`;

			setNumber(fullNumber);
		},
		enabled: !!station && !!prevDate,
	});

	const saveMutation = useMutation({
		mutationFn: addMovment,
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
	const onSaveMovmentHandler = () => {
		saveMutation.mutate({
			date: date.toString(),
			station_id: station,
			number,
			station_number: stations.filter((el) => el.id === +station)[0].number,
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
								icon={<X />}
								onPress={() => {
									navigate("./..");
								}}
								disabled={saveMutation.isLoading}
							>
								الغاء
							</Button>
							<Button
								color="primary"
								icon={<Save />}
								type="submit"
								disabled={saveMutation.isLoading}
							>
								حفظ
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card>
						<CardHeader>بيانات الحركة</CardHeader>
						<CardBody>
							<div className="flex gap-10">
								<Select
									label="اسم المحطة"
									className="max-w-xs"
									onChange={(e) => {
										setStation(e.target.value);
									}}
									value={station}
								>
									{stations &&
										stations.map((station) => {
											return (
												<SelectItem key={station.id}>{station.name}</SelectItem>
											);
										})}
								</Select>
								<DatePicker
									className="max-w-[284px]"
									label="تاريخ الحركة"
									value={date}
									onChange={(date) => {
										const previousDay = date.add({ days: -1 });
										setDate(date);
										setPrevDate(previousDay);
									}}
								/>
								<Input
									label="رقم الحركة"
									placeholder="رقم الحركة"
									value={number}
									readOnly
									className="max-w-[284px]"
									type="number"
								/>
							</div>
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default DailyMovmentForm;
