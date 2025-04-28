import React, { useState } from "react";
import Row from "../../UI/row/Row";
import { useQuery } from "react-query";
import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Select,
	SelectItem,
	RadioGroup,
	Radio,
	Button,
} from "@heroui/react";
import { Desktop } from "@mynaui/icons-react";

import { useNavigate } from "react-router-dom";
import {
	getAllStations,
	getBoxAccountStatementReport,
	getEmployeeAccountStatementReport,
	getEmployeeByStationId,
	getStationAccountStatementReport,
} from "../../api/serverApi";
const AccountStatement = () => {
	//hooks
	const navigate = useNavigate();
	//states
	const [station, setStation] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [date, setDate] = useState("");
	const [selectedEmployee, setSelectedEmployee] = useState("");
	const [type, setType] = useState("");

	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations;
		},
	});
	const { data: employees } = useQuery({
		queryKey: ["employees", station],
		queryFn: getEmployeeByStationId,
		select: (res) => {
			return res.data.employees;
		},
		enabled: !!station,
	});
	const { refetch: refetchEmployee, isLoading: EmployeeIsLoading } = useQuery({
		queryKey: [
			"employeeAccountStatement",
			startDate,
			endDate,
			station,
			selectedEmployee,
		],
		queryFn: getEmployeeAccountStatementReport,
		onSuccess: (data) => {
			const fromDataToPrint = `${data.data.data.info.startDate
				.split("T")[0]
				.replace(/-/g, "/")}`;
			const toDataToPrint = `${data.data.data.info.endDate
				.split("T")[0]
				.replace(/-/g, "/")}`;
			navigate("./print", {
				state: {
					data: {
						...data.data.data,
						info: {
							...data.data.data.info,
							startDate: fromDataToPrint,
							endDate: toDataToPrint,
						},
					},
					reportTemplate: "accountStatement",
				},
			});
		},
		enabled: false,
	});
	const { refetch: refetchBox, isLoading: boxIsLoading } = useQuery({
		queryKey: ["boxAccountStatement", startDate, endDate, station],
		queryFn: getBoxAccountStatementReport,
		onSuccess: (data) => {
			const fromDataToPrint = `${data.data.data.info.startDate
				.split("T")[0]
				.replace(/-/g, "/")}`;
			const toDataToPrint = `${data.data.data.info.endDate
				.split("T")[0]
				.replace(/-/g, "/")}`;
			navigate("./print", {
				state: {
					data: {
						...data.data.data,
						info: {
							...data.data.data.info,
							startDate: fromDataToPrint,
							endDate: toDataToPrint,
						},
					},
					reportTemplate: "accountStatement",
				},
			});
		},
		enabled: false,
	});
	const { refetch: refetchStation, isLoading: stationIsLoading } = useQuery({
		queryKey: ["stationAccountStatement", startDate, endDate, station],
		queryFn: getStationAccountStatementReport,
		onSuccess: (data) => {
			console.log(data);
			console.log(data.data.info);
			const fromDataToPrint = `${data.data.data.info.startDate
				.split("T")[0]
				.replace(/-/g, "/")}`;
			const toDataToPrint = `${data.data.data.info.endDate
				.split("T")[0]
				.replace(/-/g, "/")}`;
			navigate("./print", {
				state: {
					data: {
						...data.data.data,
						info: {
							...data.data.data.info,
							startDate: fromDataToPrint,
							endDate: toDataToPrint,
						},
					},
					reportTemplate: "accountStatement",
				},
			});
		},
		enabled: false,
	});
	return (
		<div className="w-full h-full overflow-auto">
			<div className="w-full p-5 pb-16">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (type === "المحطة") {
							refetchStation();
						}
						if (type === "الموظف") {
							refetchEmployee();
						}
						if (type === "الصندوق") {
							refetchBox();
						}
					}}
				>
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							كشف حساب
						</CardHeader>
						<CardBody>
							<Row flex={[1, 1, 1]}>
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
									label="من تاريخ"
									required
									placeholder="تاريخ الوارد"
									value={startDate}
									type="date"
									onChange={(e) => {
										setStartDate(e.target.value);
									}}
								/>
								<Input
									label="الى تاريخ "
									required
									placeholder="تاريخ الوارد"
									value={endDate}
									type="date"
									onChange={(e) => {
										setEndDate(e.target.value);
									}}
								/>
							</Row>
							<RadioGroup
								value={type}
								orientation="horizontal"
								className=" text-right"
								label="نوع كشف الحساب"
								onChange={(e) => {
									setSelectedEmployee("");
									setType(e.target.value);
								}}
							>
								<Radio value="المحطة">المحطة</Radio>
								<Radio value="الصندوق">الصندوق</Radio>
								<Radio value="الموظف">الموظف</Radio>
							</RadioGroup>
							{type === "الموظف" && (
								<Row flex={[1000]}>
									<Select
										label="الموظف"
										selectedKeys={[selectedEmployee.toString()]}
										onChange={(e) => {
											setSelectedEmployee(+e.target.value);
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
									<></>
								</Row>
							)}

							<Row>
								<Button
									color="primary"
									type="submit"
									disabled={
										boxIsLoading || EmployeeIsLoading || stationIsLoading
									}
								>
									{boxIsLoading || EmployeeIsLoading || stationIsLoading ? (
										<div>جاري معالجة البيانات...</div>
									) : (
										<div className="flex gap-2">
											<Desktop />
											عرض التقرير
										</div>
									)}
								</Button>
							</Row>
						</CardBody>
					</Card>
				</form>
			</div>
		</div>
	);
};

export default AccountStatement;
