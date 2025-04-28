import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DismissRegular, SaveRegular } from "@fluentui/react-icons";
import TopBar from "../../components/TopBar/TopBar";

import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	Button,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
	Select,
} from "@fluentui/react-components";

import {
	addDispenser,
	getAllStations,
	getTanksByStationId,
} from "../../api/serverApi";
import {
	DefaultButton,
	Dropdown,
	PrimaryButton,
	TextField,
} from "@fluentui/react";
import Card from "../../UI/card/Card";
import { toast } from "react-toastify";

const DispenserFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [station, setStation] = useState("");
	const [date, setDate] = useState("");
	const [dispensers, setDispensers] = useState([]);
	const [number, setNumber] = useState("");
	const [tank, setTank] = useState("");
	const [A, setA] = useState("");
	const [B, setB] = useState("");
	const [wheelCounterA, setWheelCounterA] = useState("");
	const [wheelCounterB, setWheelCounterB] = useState("");
	const [substance, setSubstance] = useState("");
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});
	const { data: tanks } = useQuery({
		queryKey: ["tanks", station],
		queryFn: getTanksByStationId,
		select: (res) => {
			return res.data.tanks.map((el) => el);
		},
		enabled: !!station,
	});
	const saveMutation = useMutation({
		mutationFn: addDispenser,
		onSuccess: (res) => {
			toast.success("تم إضافة الطرمبة بنجاح", {
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
	//functions

	return (
		<div className="w-full h-full overflow-auto ">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					saveMutation.mutate({
						station_id: station,
						number,
						A,
						B,
						date,
						tank,
						wheelCounterA,
						wheelCounterB,
						substance,
					});
				}}
			>
				<TopBar
					right={
						<>
							<DefaultButton
								appearance="secondary"
								icon={<DismissRegular />}
								onClick={() => {
									navigate("./..");
								}}
							>
								الغاء
							</DefaultButton>
							<PrimaryButton
								appearance="primary"
								icon={<SaveRegular />}
								type="submit"
							>
								حفظ
							</PrimaryButton>
						</>
					}
				/>
				<div
					style={{
						padding: "0 5px",
						marginTop: "10px",

						display: "flex",
						flexDirection: "column",
						gap: "15px",
					}}
				>
					<Card title="بيانات الحركة">
						<Row flex={[3, 2, 4]}>
							<Dropdown
								onChange={(e, selection) => {
									setStation(selection.key);
								}}
								label="اسم المحطة"
								placeholder="اختر المحطة"
								options={
									stations &&
									stations.map((el) => {
										return { key: el.id, text: el.name };
									})
								}
							/>
							<TextField
								label="تاريخ البدء"
								placeholder="تاريخ البدء"
								value={date}
								type="date"
								onChange={(e) => {
									e.stopPropagation();
									setDate(e.target.value);
								}}
							/>
						</Row>
					</Card>
					<Card title="الطرمبات">
						<Table arial-label="Default table">
							<TableHeader>
								<TableRow>
									<TableHeaderCell rowSpan={2} style={{ width: "110px" }}>
										رقم الطرمبة
									</TableHeaderCell>
									<TableHeaderCell rowSpan={2} style={{ width: "150px" }}>
										الخزان
									</TableHeaderCell>
									<TableHeaderCell colSpan={2} style={{ width: "400px" }}>
										العداد الرقمي
									</TableHeaderCell>
									<TableHeaderCell colSpan={2} style={{ width: "400px" }}>
										العداد السري
									</TableHeaderCell>
								</TableRow>
								<TableRow>
									<TableHeaderCell>أ</TableHeaderCell>
									<TableHeaderCell>ب</TableHeaderCell>
									<TableHeaderCell>أ</TableHeaderCell>
									<TableHeaderCell>ب</TableHeaderCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>
										<Input
											value={number}
											style={{ maxWidth: "100px" }}
											onChange={(e) => {
												e.stopPropagation();

												setNumber(e.target.value);
											}}
											onFocus={(e) => e.target.select()}
											onWheel={(e) => e.target.blur()}
											onKeyDown={(e) => {
												if (e.key === "ArrowUp" || e.key === "ArrowDown") {
													e.preventDefault();
												}
											}}
											type="number"
											min="0"
										/>
									</TableCell>
									<TableCell>
										<Select
											required
											onChange={(e) => {
												e.stopPropagation();
												setTank(JSON.parse(e.target.value).id);
												setSubstance(JSON.parse(e.target.value).substance.id);
											}}
										>
											<option></option>
											{tanks &&
												tanks.map((el) => (
													<option key={el.id} value={JSON.stringify(el)}>
														{el.number}-{el.substance.name}
													</option>
												))}
										</Select>
									</TableCell>
									<TableCell>
										<Input
											value={A}
											onChange={(e) => {
												e.stopPropagation();
												setA(e.target.value);
											}}
											onFocus={(e) => e.target.select()}
											onWheel={(e) => e.target.blur()}
											onKeyDown={(e) => {
												if (e.key === "ArrowUp" || e.key === "ArrowDown") {
													e.preventDefault();
												}
											}}
											type="number"
											min="0"
										/>
									</TableCell>
									<TableCell>
										<Input
											value={B}
											onChange={(e) => {
												e.stopPropagation();
												setB(e.target.value);
											}}
											onFocus={(e) => e.target.select()}
											onWheel={(e) => e.target.blur()}
											onKeyDown={(e) => {
												if (e.key === "ArrowUp" || e.key === "ArrowDown") {
													e.preventDefault();
												}
											}}
											type="number"
											min="0"
										/>
									</TableCell>
									<TableCell>
										<Input
											value={wheelCounterA}
											onChange={(e) => {
												e.stopPropagation();

												setWheelCounterA(e.target.value);
											}}
											onFocus={(e) => e.target.select()}
											onWheel={(e) => e.target.blur()}
											onKeyDown={(e) => {
												if (e.key === "ArrowUp" || e.key === "ArrowDown") {
													e.preventDefault();
												}
											}}
											type="number"
											min="0"
										/>
									</TableCell>
									<TableCell>
										<Input
											value={wheelCounterB}
											onChange={(e) => {
												e.stopPropagation();

												setWheelCounterB(e.target.value);
											}}
											onFocus={(e) => e.target.select()}
											onWheel={(e) => e.target.blur()}
											onKeyDown={(e) => {
												if (e.key === "ArrowUp" || e.key === "ArrowDown") {
													e.preventDefault();
												}
											}}
											type="number"
											min="0"
										/>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default DispenserFormPage;
