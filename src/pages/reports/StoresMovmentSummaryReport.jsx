import React, { useState } from "react";
import Row from "../../UI/row/Row";
import { useQuery } from "react-query";
import {
	getAllStations,
	getStoreByStationId,
	getStoresMovmentSummaryReport,
} from "../../api/serverApi";
import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Select,
	SelectItem,
	Button,
	SelectSection,
} from "@heroui/react";
import { Desktop } from "@mynaui/icons-react";
import { useNavigate } from "react-router-dom";

const StoresMovmentSummaryReport = () => {
	//hooks
	const navigate = useNavigate();
	//states
	const [station, setStation] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [selectedStores, setSelectedStores] = useState([]);

	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
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
	const { data, refetch, isLoading } = useQuery({
		queryKey: [
			"storesMovmentReport",
			startDate,
			endDate,
			station,
			selectedStores,
		],
		queryFn: getStoresMovmentSummaryReport,
		onSuccess: (data) => {
			const fromDataToPrint = `${data.data.info.fromDate
				.split("T")[0]
				.replace(/-/g, "/")}`;
			const toDataToPrint = `${data.data.info.toDate
				.split("T")[0]
				.replace(/-/g, "/")}`;

			navigate("./print", {
				state: {
					data: {
						...data.data,
						info: {
							...data.data.info,
							fromDate: fromDataToPrint,
							toDate: toDataToPrint,
						},
					},
					reportTemplate: "storesMovmentSummaryReport",
				},
			});
		},
		enabled: false,
	});
	//functions

	return (
		<div className="w-full h-full overflow-auto">
			<div className="w-full p-5 pb-16">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						refetch();
					}}
				>
					<Card title="حركة المخزون خلال مدة">
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							حركة المخزون خلال مدة
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
							<Row flex={[1, 1]}>
								<Select
									label="المخازن"
									onChange={(e) => {
										const selectedSet = new Set(e.target.value.split(","));
										setSelectedStores(Array.from(selectedSet));
									}}
									selectedKeys={selectedStores}
									selectionMode="multiple"
								>
									{stores &&
										stores.map((store) => {
											return (
												<SelectSection
													showDivider
													title={store.text}
													key={store.key}
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

export default StoresMovmentSummaryReport;
