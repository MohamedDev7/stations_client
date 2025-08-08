import React, { useState } from "react";

import Row from "../../UI/row/Row";

import { useQuery } from "react-query";
import {
	getAllStations,
	getAllSubstances,
	getStoresMovmentReport,
} from "@/api/serverApi";

import {
	Card,
	CardBody,
	Select,
	SelectItem,
	Button,
	RadioGroup,
	Radio,
	DatePicker,
} from "@heroui/react";
import { Desktop } from "@mynaui/icons-react";
import useNavigateWithQuery from "./../../hooks/useNavigateWithQuery";
import { useSearchParams } from "react-router-dom";
import { parseDate } from "@internationalized/date";
const StoresMovmentReport = () => {
	//hooks
	const navigate = useNavigateWithQuery();
	const [searchParams, setSearchParams] = useSearchParams();
	const rawEndDate = searchParams.get("endDate");
	const rawStartDate = searchParams.get("startDate");
	//states
	const [startDate, setStartDate] = useState(
		rawStartDate && rawStartDate !== "null" ? parseDate(rawStartDate) : null
	);
	const [endDate, setEndDate] = useState(
		rawEndDate && rawEndDate !== "null" ? parseDate(rawEndDate) : null
	);
	const [station, setStation] = useState(searchParams.get("station") || "");
	const [substance, setSubstance] = useState(
		+searchParams.get("substance") || ""
	);
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});
	const { data: substances } = useQuery({
		queryKey: ["substances"],
		queryFn: getAllSubstances,
		select: (res) => {
			return res.data.substances;
		},
	});
	const { data, refetch, isLoading } = useQuery({
		queryKey: ["storesMovmentReport", startDate, endDate, station, substance],
		queryFn: getStoresMovmentReport,
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
					reportTemplate: "storesMovmentReport",
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
			substance,
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
							</Row>

							<Row>
								<RadioGroup
									value={substance}
									orientation="horizontal"
									className=" text-right"
									label="المادة"
									onChange={(e) => {
										setSubstance(+e.target.value);
										updateParams({ substance: +e.target.value });
									}}
								>
									{substances &&
										substances.map((substance) => (
											<Radio value={substance.id} key={substance.id}>
												{substance.name}
											</Radio>
										))}
								</RadioGroup>
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

export default StoresMovmentReport;
