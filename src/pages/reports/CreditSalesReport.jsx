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
	getCreditSalesStatementReport,
	getStoreByStationId,
} from "../../api/serverApi";
const CreditSalesReport = () => {
	//hooks
	const navigate = useNavigate();
	//states
	const [station, setStation] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [date, setDate] = useState("");
	const [selectedStores, setSelectedStores] = useState("");
	const [type, setType] = useState("");

	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations;
		},
	});
	const { data: stores } = useQuery({
		queryKey: ["employees", station],
		queryFn: getStoreByStationId,
		select: (res) => {
			return res.data.stores;
		},
		enabled: !!station,
	});
	const { refetch: creditSales, isLoading } = useQuery({
		queryKey: [
			"creditSalesStatement",
			startDate,
			endDate,
			station,
			selectedStores,
		],
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
						refetchBox();
					}}
				>
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							كشف مبيعات آجلة
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
							<Select
								label="المخزن"
								selectedKeys={selectedStores ? [selectedStores.toString()] : []}
								onChange={(e) => {
									setSelectedStores(+e.target.value);
								}}
								isRequired
							>
								{stores && stores.length > 0 ? (
									stores.map((store) => {
										const displayText = `${store.name}${
											store.substance ? `-${store.substance.name}` : ""
										}`;
										return (
											<SelectItem key={store.id} textValue={displayText}>
												{displayText}
											</SelectItem>
										);
									})
								) : (
									<SelectItem textValue="No stores available">
										No stores available
									</SelectItem>
								)}
							</Select>
							<Row>
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
