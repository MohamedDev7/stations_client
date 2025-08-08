import React, { useState } from "react";
import Row from "../../UI/row/Row";
import { useQuery } from "react-query";
import {
	getAllStations,
	getStoreByStationId,
	getStoresMovmentSummaryReport,
} from "@/api/serverApi";
import {
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
	Button,
	SelectSection,
	DatePicker,
} from "@heroui/react";
import { Desktop } from "@mynaui/icons-react";
import useNavigateWithQuery from "./../../hooks/useNavigateWithQuery";
import { useSearchParams } from "react-router-dom";
import { parseDate } from "@internationalized/date";

const StoresMovmentSummaryReport = () => {
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
	const [selectedStores, setSelectedStores] = useState(
		searchParams.get("selectedStores")
			? searchParams.get("selectedStores").split(",")
			: []
	);
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
	const updateParams = (params) => {
		setSearchParams({
			startDate,
			endDate,
			station,
			selectedStores,
			...params, // overwrite changed
		});
	};

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
							<Row flex={[1, 1]}>
								<Select
									label="المخازن"
									onChange={(e) => {
										const selectedSet = new Set(e.target.value.split(","));
										setSelectedStores(Array.from(selectedSet));
										updateParams({ selectedStores: e.target.value });
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
													key={store.text}
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
