import React, { useState } from "react";
import Row from "../../UI/row/Row";
import { useQuery } from "react-query";
import {
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
	RadioGroup,
	Radio,
	Button,
	SelectSection,
	DatePicker,
} from "@heroui/react";
import { Desktop } from "@mynaui/icons-react";

import useNavigateWithQuery from "./../../hooks/useNavigateWithQuery";
import { useSearchParams } from "react-router-dom";
import { parseDate } from "@internationalized/date";
import {
	getAllStations,
	getBoxAccountStatementReport,
	getCreditSalesStatementReport,
	getEmployeeAccountStatementReport,
	getEmployeeByStationId,
	getStationAccountStatementReport,
	getStoreByStationId,
} from "@/api/serverApi";
const headingClasses =
	"flex py-1.5 px-2 bg-primary-100  rounded-small text-lg font-bold";
const AccountStatement = () => {
	//hooks
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigateWithQuery();
	const rawEndDate = searchParams.get("endDate");
	const rawStartDate = searchParams.get("startDate");
	//states
	const [station, setStation] = useState(searchParams.get("station") || "");
	const [startDate, setStartDate] = useState(
		rawStartDate && rawStartDate !== "null" ? parseDate(rawStartDate) : null
	);
	const [endDate, setEndDate] = useState(
		rawEndDate && rawEndDate !== "null" ? parseDate(rawEndDate) : null
	);
	const [selectedEmployee, setSelectedEmployee] = useState("");
	const [selectedStore, setSelectedStore] = useState(
		searchParams.get("store") || ""
	);
	const [type, setType] = useState(searchParams.get("type") || "");

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
	const { data: stores } = useQuery({
		queryKey: ["stores", station],
		queryFn: getStoreByStationId,
		select: (res) => {
			const substancessSet = new Set(
				res.data.stores.map((el) => el.substance.id)
			);

			const substances = Array.from(substancessSet);
			const substancesArr = substances.map((el) => {
				const text = res.data.stores.filter((ele) => ele.substance_id === el)[0]
					.substance.name;
				return { key: el, text };
			});
			substancesArr.forEach((el) => {
				el.items = res.data.stores.filter((ele) => ele.substance.id === el.key);
			});
			return substancesArr;
		},
		enabled: !!station && type === "مبيعات آجلة",
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
	const { refetch: refetchCreditSales, isLoading: creditSalesIsLoading } =
		useQuery({
			queryKey: ["creditSales", startDate, endDate, station, selectedStore],
			queryFn: getCreditSalesStatementReport,
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
						reportTemplate: "creditSalesStatement",
					},
				});
			},
			enabled: false,
		});
	const { refetch: refetchStation, isLoading: stationIsLoading } = useQuery({
		queryKey: ["stationAccountStatement", startDate, endDate, station],
		queryFn: getStationAccountStatementReport,
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

	//function
	const updateParams = (params) => {
		setSearchParams({
			startDate,
			endDate,
			station,
			selectedStore,
			selectedEmployee,
			type,
			...params, // overwrite changed
		});
	};
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
						if (type === "مبيعات آجلة") {
							refetchCreditSales();
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
										updateParams({ station: +e.target.value });
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
								<DatePicker
									label="من تاريخ"
									required
									value={startDate}
									onChange={(date) => {
										setStartDate(date);
										updateParams({ startDate: date });
									}}
								/>
								<DatePicker
									label="الى تاريخ "
									required
									value={endDate}
									onChange={(date) => {
										setEndDate(date);
										updateParams({ endDate: date });
									}}
								/>
								{/* <Input
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
								/> */}
							</Row>
							<RadioGroup
								value={type}
								orientation="horizontal"
								className=" text-right"
								label="نوع كشف الحساب"
								onChange={(e) => {
									setSelectedEmployee("");
									setType(e.target.value);
									updateParams({ type: e.target.value });
								}}
							>
								<Radio value="المحطة">المحطة</Radio>
								<Radio value="الصندوق">الصندوق</Radio>
								<Radio value="مبيعات آجلة">مبيعات آجلة</Radio>
								<Radio value="الموظف">الموظف</Radio>
							</RadioGroup>
							{type === "الموظف" && (
								<Row flex={[1000]}>
									<Select
										label="الموظف"
										selectedKeys={[selectedEmployee.toString()]}
										onChange={(e) => {
											setSelectedEmployee(+e.target.value);
											updateParams({ selectedEmployee: +e.target.value });
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
							{!!station && type === "مبيعات آجلة" && (
								<Row flex={[1000]}>
									<Select
										label="المخازن"
										onChange={(e) => {
											setSelectedStore(e.target.value);
											updateParams({ selectedStore: +e.target.value });
										}}
										selectedKey={selectedStore}
									>
										{stores &&
											stores.map((store) => {
												return (
													<SelectSection
														showDivider
														title={store.text}
														key={store.key}
														classNames={{
															heading: headingClasses,
														}}
													>
														{store.items.map((el) => (
															<SelectItem key={el.id}>{el.name}</SelectItem>
														))}
													</SelectSection>
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
										boxIsLoading ||
										EmployeeIsLoading ||
										stationIsLoading ||
										creditSalesIsLoading
									}
								>
									{boxIsLoading ||
									EmployeeIsLoading ||
									creditSalesIsLoading ||
									stationIsLoading ? (
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
