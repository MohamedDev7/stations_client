import React, { useState } from "react";
import Row from "../../UI/row/Row";
import { useQuery } from "react-query";
import { getAllStations, getDispensersMovmentReport } from "@/api/serverApi";
import useNavigateWithQuery from "./../../hooks/useNavigateWithQuery";
import { useSearchParams } from "react-router-dom";
import { parseDate } from "@internationalized/date";
import { toast } from "react-toastify";
import {
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
	Button,
	DatePicker,
} from "@heroui/react";
import { Desktop } from "@mynaui/icons-react";
const DispensersMovmentReport = () => {
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

	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});

	const { data, refetch, isLoading } = useQuery({
		queryKey: ["dispensersMovmentReport", startDate, endDate, station],
		queryFn: getDispensersMovmentReport,
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
					reportTemplate: "dispensersMovmentReport",
				},
			});
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
		retry: 0,
		enabled: false,
	});
	const updateParams = (params) => {
		setSearchParams({
			startDate,
			endDate,
			station,
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
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							حركة العدادات
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

export default DispensersMovmentReport;
