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
	Button,
	SelectSection,
	RadioGroup,
	Radio,
	DatePicker,
} from "@heroui/react";
import { Desktop } from "@mynaui/icons-react";

import { useNavigate } from "react-router-dom";
import {
	getAllStations,
	getClientsByStationId,
	getCreditSalesByStoreIdAndClientsIds,
	getCreditSalesStatementReport,
	getStoreByStationId,
} from "@/api/serverApi";
const headingClasses =
	"flex py-1.5 px-2 bg-primary-100  rounded-small text-lg font-bold";
const CreditSalesReport = () => {
	//hooks
	const navigate = useNavigate();
	//states
	const [station, setStation] = useState("");
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [selectedStore, setSelectedStore] = useState("");
	const [selectedClients, setSelectedClients] = useState([]);
	const [type, setType] = useState("حسب المحطة");
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations;
		},
	});
	const { data: clients } = useQuery({
		queryKey: ["clients", station],
		queryFn: getClientsByStationId,
		select: (res) => {
			return res.data.clients;
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
		enabled: !!station,
	});
	const { refetch, isLoading } = useQuery({
		queryKey: [
			"creditSalesStatement",
			startDate,
			endDate,
			station,
			selectedStore,
			selectedClients,
			type,
		],
		queryFn: getCreditSalesByStoreIdAndClientsIds,
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
					reportTemplate: "creditSalesReport",
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
						refetch();
					}}
				>
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							كشف مبيعات آجلة
						</CardHeader>
						<CardBody>
							<Row flex={[1, 1, 1]}>
								<DatePicker
									label="من تاريخ"
									required
									value={startDate}
									onChange={(date) => {
										setStartDate(date);
									}}
								/>
								<DatePicker
									label="الى تاريخ "
									required
									value={endDate}
									onChange={(date) => {
										setEndDate(date);
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
								<RadioGroup
									label="نوع التقرير"
									orientation="horizontal"
									className="text-right"
									onValueChange={setType}
									value={type}
								>
									<Radio value="حسب المحطة">حسب المحطة</Radio>
									<Radio value="حسب العميل">حسب العميل</Radio>
								</RadioGroup>
							</Row>
							<Row flex={[1, 1, 1, 1]}>
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
								<Select
									label="المستودع"
									onChange={(e) => setSelectedStore(e.target.value)}
									value
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
								<Select
									label="العملاء"
									onChange={(e) => {
										const selectedSet = new Set(e.target.value.split(","));
										setSelectedClients(Array.from(selectedSet));
									}}
									selectedKeys={selectedClients}
									selectionMode="multiple"
								>
									{clients &&
										clients.map((client) => (
											<SelectItem key={client.client.id}>
												{client.client.name}
											</SelectItem>
										))}
								</Select>
								<></>
							</Row>
							<Row flex={[1, 1]}>
								<Button color="primary" type="submit" disabled={isLoading}>
									{isLoading ? (
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

export default CreditSalesReport;
