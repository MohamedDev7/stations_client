import { useEffect, useState } from "react";

import TopBar from "../../components/TopBar/TopBar";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import {
	addStore,
	getAllStations,
	getAllSubstances,
	getClientsByStationId,
	getSubstancesPricesByDate,
} from "@/api/serverApi";
import { X, Save } from "@mynaui/icons-react";
import useNavigateWithQuery from "../../hooks/useNavigateWithQuery";
import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Button,
	Select,
	SelectItem,
} from "@heroui/react";
const StoreFormPage = () => {
	//hooks

	const navigate = useNavigateWithQuery();
	//states
	const [station, setStation] = useState("");
	const [client, setClient] = useState("");
	const [substance, setSubstance] = useState("");
	const [date, setDate] = useState("");
	const [storeName, setStoreName] = useState("");
	const [amount, setAmount] = useState(0);
	//queries

	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});
	const { data: prices } = useQuery({
		queryKey: ["prices", date],
		queryFn: getSubstancesPricesByDate,
		select: (res) => {
			return res.data.prices;
		},
		enabled: !!date,
	});
	const { data: substances } = useQuery({
		queryKey: ["substances"],
		queryFn: getAllSubstances,
		select: (res) => {
			return res.data.substances.map((el) => {
				const substanceId = el.id;
				let price = 0;
				prices.forEach((ele) => {
					if (ele.substance_id === substanceId) {
						price = ele.price;
					}
				});
				return { ...el, price };
			});
		},
		enabled: !!prices,
	});
	const { data: clients } = useQuery({
		queryKey: ["clients", station],
		queryFn: getClientsByStationId,
		select: (res) => {
			return res.data.clients;
		},
		enabled: !!station,
	});
	const addMutation = useMutation({
		mutationFn: addStore,
		onSuccess: () => {
			toast.success("تمت الاضافة بنجاح", {
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
	//functions
	useEffect(() => {
		if (client && substance) {
			const clientName =
				client === "none"
					? "شركة"
					: clients.filter((el) => el.client.id === +client)[0].client.name;

			const substanceName = substances.filter((el) => el.id === +substance)[0]
				.name;
			setStoreName(`${clientName} - ${substanceName}`);
		}
	}, [client, substance, clients, substances]);
	return (
		<div className="w-full h-full overflow-auto">
			<form
				onSubmit={(e) => {
					e.stopPropagation();

					addMutation.mutate({
						station,
						client,
						substance,
						date,
						name: clients.filter((el) => el.client.id === +client)[0].client
							.name,
						amount,
					});
				}}
			>
				<TopBar
					right={
						<>
							<Button
								color="warning"
								onPress={() => navigate("./..")}
								disabled={addMutation.isLoading}
							>
								<X />
								الغاء
							</Button>
							<Button
								color="primary"
								type="submit"
								disabled={addMutation.isLoading}
							>
								<Save />
								حفظ
							</Button>
							<Button color="primary" onPress={() => {}}>
								<Save />
								test
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							بيانات المستودع
						</CardHeader>
						<CardBody>
							<Row flex={[2, 2, 2, 1]}>
								<Select
									label="اسم المحطة"
									onChange={(e) => {
										setStation(e.target.value);
									}}
									value={station}
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
									value={date}
									type="date"
									onChange={(e) => {
										setDate(e.target.value);
									}}
								/>
								<Select
									label="اسم العميل"
									onChange={(e) => {
										setClient(e.target.value);
									}}
									value={client}
								>
									<SelectItem key="none">بدون</SelectItem>
									{clients &&
										clients.map((client) => {
											return (
												<SelectItem key={client.client.id}>
													{client.client.name}
												</SelectItem>
											);
										})}
								</Select>
								<></>
							</Row>
							<Row flex={[1, 1, 1, 1]}>
								<Select
									label="المادة"
									onChange={(e) => {
										setSubstance(e.target.value);
									}}
									value={substance}
								>
									{substances &&
										substances.map((substance) => {
											return (
												<SelectItem key={substance.id}>
													{substance.name}
												</SelectItem>
											);
										})}
								</Select>
								<Input
									label="اسم المستودع"
									required
									disabled
									readOnly
									value={storeName}
								/>
								<Input
									label="الرصيد الافتتاحي "
									required
									type=" number"
									value={amount}
									onChange={(e) => {
										setAmount(+e.target.value);
									}}
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

export default StoreFormPage;
