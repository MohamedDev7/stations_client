import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
	addReceive,
	getAllStations,
	getEmployeeByStationId,
	getReceive,
	updateReceive,
} from "../../api/serverApi";
import { X, Save } from "@mynaui/icons-react";
import { Button } from "@heroui/button";
import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Select,
	SelectItem,
	Textarea,
} from "@heroui/react";
const ReceiveFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [station, setStation] = useState("");
	const [date, setDate] = useState("");
	const [amount, setAmount] = useState("");
	const [employee, setEmployee] = useState("");
	const [title, setTitle] = useState("");
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
	const { data: employees } = useQuery({
		queryKey: ["employees", station],
		queryFn: getEmployeeByStationId,
		select: (res) => {
			return res.data.employees.map((el) => {
				return { ...el, key: el.id, label: el.name };
			});
		},
		enabled: !!station,
	});
	useQuery({
		queryKey: ["receive", info.state?.id],
		queryFn: getReceive,
		select: (res) => res.data.receive,
		onSuccess: (data) => {
			setStation(data.station_id);
			setAmount(data.amount);
			setDate(data.date);
			setEmployee(data.employee_id);
			setTitle(data.title);
		},
		enabled: !!info.state?.id,
	});
	const addMutation = useMutation({
		mutationFn: addReceive,
		onSuccess: () => {
			toast.success("تم اضافة الاستلام بنجاح", {
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
		mutationFn: updateReceive,
		onSuccess: (res) => {
			toast.success("تم التعديل بنجاح", {
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
	return (
		<div className="w-full h-full overflow-auto">
			<form
				onSubmit={(e) => {
					e.stopPropagation();
					info.state
						? editMutation.mutate({
								date,
								station,
								amount,
								title,
								employee,
								id: info.state.id,
						  })
						: addMutation.mutate({ date, station, amount, employee, title });
				}}
			>
				<TopBar
					right={
						<>
							<Button
								color="warning"
								onPress={() => navigate("./..")}
								disabled={addMutation.isLoading || editMutation.isLoading}
							>
								<X />
								الغاء
							</Button>
							<Button
								color="primary"
								type="submit"
								disabled={addMutation.isLoading || editMutation.isLoading}
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
							بيانات الاستلام
						</CardHeader>
						<CardBody>
							<Row flex={[3, 2, 3, 2]}>
								<Select
									label="المحطة"
									selectedKeys={[station.toString()]}
									onChange={(e) => {
										setStation(+e.target.value);
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
									label="الموظف"
									selectedKeys={[employee.toString()]}
									onChange={(e) => {
										setEmployee(+e.target.value);
									}}
									isRequired
								>
									{employees &&
										employees.map((employee) => {
											return (
												<SelectItem key={employee.id}>
													{employee.name}
												</SelectItem>
											);
										})}
								</Select>

								<Input
									isRequired
									label="المبلغ"
									value={amount}
									onChange={(e) => {
										setAmount(+e.target.value);
									}}
									type="number"
								/>
							</Row>
							<Row flex={[4, 1]}>
								<Textarea
									isRequired
									label="البيان"
									value={title}
									onChange={(e) => {
										setTitle(e.target.value);
									}}
								/>
								<></>
							</Row>
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default ReceiveFormPage;
