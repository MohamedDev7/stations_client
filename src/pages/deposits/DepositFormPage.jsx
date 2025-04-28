import React, { useEffect, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
	addDeposit,
	getAllBanks,
	getAllStations,
	getDeposit,
	updateDeposit,
} from "../../api/serverApi";
import { X, Save } from "@mynaui/icons-react";
import { Button } from "@heroui/button";
import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Select,
	SelectItem,
	Textarea,
} from "@heroui/react";
const DepositFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();

	//states
	const [station, setStation] = useState("");
	const [amount, setAmount] = useState("");
	const [bank, setBank] = useState("");
	const [number, setNumber] = useState("");
	const [invoiceDate, setInvoiceDate] = useState("");
	const [date, setDate] = useState("");
	const [statement, setStatement] = useState("");
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations;
		},
	});
	const { data: banks } = useQuery({
		queryKey: ["banks"],
		queryFn: getAllBanks,
		select: (res) => {
			return res.data.banks;
		},
	});
	useQuery({
		queryKey: ["deposit", info.state?.id],
		queryFn: getDeposit,
		select: (res) => res.data.deposit,
		onSuccess: (data) => {
			setStation(data.station_id);
			setAmount(data.amount);
			setBank(data.bank_id);
			setNumber(data.number);
			setInvoiceDate(data.invoice_date);
			setStatement(data.statement);
		},
		enabled: !!info.state?.id,
	});
	const addMutation = useMutation({
		mutationFn: addDeposit,
		onSuccess: (res) => {
			toast.success("تمت الاضافة بنجاح", {
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
	const editMutation = useMutation({
		mutationFn: updateDeposit,
		onSuccess: (res) => {
			toast.success("تم التعديل بنجاح", {
				position: "top-center",
			});
			navigate("./..", {});
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});

	return (
		<div className="w-full h-full overflow-auto">
			<form
				onSubmit={(e) => {
					e.stopPropagation();
					info.state
						? editMutation.mutate({
								station,
								amount,
								bank,
								invoiceDate,
								number,
								statement,
								date,
								id: info.state.id,
						  })
						: addMutation.mutate({
								station,
								amount,
								bank,
								invoiceDate,
								number,
								date,
								statement,
						  });
				}}
			>
				<TopBar
					right={
						<>
							<Button
								color="warning"
								onPress={() => {
									navigate("./..");
								}}
								disabled={editMutation.isLoading || addMutation.isLoading}
							>
								<X />
								الغاء
							</Button>
							<Button
								color="primary"
								type="submit"
								disabled={editMutation.isLoading || addMutation.isLoading}
							>
								<Save />
								حفظ
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							بيانات الايداع
						</CardHeader>
						<CardBody>
							<Row flex={[3, 2, 3]}>
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
									label="تاريخ الحركة"
									isRequired
									value={date}
									type="date"
									onChange={(e) => setDate(e.target.value)}
								/>
								<Select
									label="الصرافة"
									selectedKeys={[bank.toString()]}
									onChange={(e) => {
										setBank(+e.target.value);
									}}
									isRequired
								>
									{banks &&
										banks.map((station) => {
											return (
												<SelectItem key={station.id}>{station.name}</SelectItem>
											);
										})}
								</Select>
							</Row>
							<Row flex={[1, 1, 1, 2]}>
								<Input
									label="رقم الاشعار"
									isRequired
									value={number}
									onChange={(e) => setNumber(e.target.value)}
								/>
								<Input
									label="تاريخ الاشعار"
									isRequired
									value={invoiceDate}
									type="date"
									onChange={(e) => setInvoiceDate(e.target.value)}
								/>
								<Input
									label="المبلغ"
									isRequired
									value={amount}
									type="number"
									onChange={(e) => setAmount(e.target.value)}
								/>

								<></>
							</Row>
							<Row flex={[1, 1]}>
								<Textarea
									label="البيان"
									isRequired
									value={statement}
									onChange={(e) => setStatement(e.target.value)}
								/>
								<></>
							</Row>
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default DepositFormPage;
