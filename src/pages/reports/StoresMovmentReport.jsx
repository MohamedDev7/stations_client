import React, { useState } from "react";

import Row from "../../UI/row/Row";

import { useQuery } from "react-query";
import {
	getAllStations,
	getAllSubstances,
	getStoresMovmentReport,
} from "../../api/serverApi";

import { useNavigate } from "react-router-dom";
import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Select,
	SelectItem,
	Button,
	RadioGroup,
	Radio,
} from "@heroui/react";
import { Desktop } from "@mynaui/icons-react";
const StoresMovmentReport = () => {
	//hooks
	const navigate = useNavigate();
	//states
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [station, setStation] = useState("");
	const [substance, setSubstance] = useState("");

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

							<Row>
								<RadioGroup
									value={substance}
									orientation="horizontal"
									className=" text-right"
									label="المادة"
									onChange={(e) => {
										setSubstance(+e.target.value);
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
