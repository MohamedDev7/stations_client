import { useEffect, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { changeClosingState, getStationStateByMonth } from "@/api/serverApi";
import useNavigateWithQuery from "./../../hooks/useNavigateWithQuery";

import { toast } from "react-toastify";

import { Lock, LockOpen } from "@mynaui/icons-react";

import {
	Button,
	Select,
	SelectItem,
	Card,
	CardHeader,
	CardBody,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
} from "@heroui/react";

const MonthlyClosingPageForm = () => {
	//hooks
	const navigate = useNavigateWithQuery();

	//states
	const [month, setMonth] = useState("");
	const [selectedStations, setSelectedStations] = useState(new Set());
	const [selectedStationsArr, setSelectedStationsArr] = useState([]);

	//queries
	const { data: stations } = useQuery({
		queryKey: ["stationsStates", month],
		queryFn: getStationStateByMonth,
		select: (res) => {
			console.log(`res`, res);
			return res.data.stations.map((el) => {
				return { ...el, state: el.isClosed === 1 ? "مغلق" : "مفتوح" };
			});
		},
		enabled: !!month,
	});
	const editMutation = useMutation({
		mutationFn: changeClosingState,
		onSuccess: () => {
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
	//functions
	//functions
	useEffect(() => {
		const arrayOfIds = Array.from(selectedStations);
		setSelectedStationsArr(arrayOfIds.map((el) => +el));
	}, [selectedStations]);
	return (
		<div className="w-full h-full overflow-auto">
			<form
				onSubmit={(e) => {
					e.preventDefault();

					editMutation.mutate({
						stations: selectedStationsArr,
						month,
						isClosed: 1,
					});
				}}
			>
				<TopBar
					right={
						<>
							<Button
								color="primary"
								disabled={editMutation.isLoading}
								type="button"
								onPress={() => {
									editMutation.mutate({
										stations: selectedStationsArr,
										month,
										isClosed: 1,
									});
								}}
							>
								<Lock />
								اغلاق
							</Button>
							<Button
								color="danger"
								type="button"
								disabled={editMutation.isLoading}
								onPress={() => {
									editMutation.mutate({
										stations: selectedStationsArr,
										month,
										isClosed: 0,
									});
								}}
							>
								<LockOpen />
								فتح
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							بيانات الاغلاق
						</CardHeader>
						<CardBody>
							<Row flex={[2, 8, 2]}>
								<Select
									label="الشهر"
									onChange={(e) => {
										setMonth(e.target.value);
									}}
									value={month}
								>
									<SelectItem key={1}>يناير</SelectItem>
									<SelectItem key={2}>فبراير</SelectItem>
									<SelectItem key={3}>مارس</SelectItem>
									<SelectItem key={4}>أبريل</SelectItem>
									<SelectItem key={5}>مايو</SelectItem>
									<SelectItem key={6}>يونيو</SelectItem>
									<SelectItem key={7}>يوليو</SelectItem>
									<SelectItem key={8}>أغسطس</SelectItem>
									<SelectItem key={9}>سبتمبر</SelectItem>
									<SelectItem key={10}>أكتوبر</SelectItem>
									<SelectItem key={11}>نوفمبر</SelectItem>
									<SelectItem key={12}>ديسمبر</SelectItem>
								</Select>
								<></>
								<></>
							</Row>
						</CardBody>
					</Card>
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							المحطات
						</CardHeader>
						<CardBody>
							<Table
								aria-label="Example static collection table"
								selectionMode="multiple"
								selectedKeys={selectedStations}
								onSelectionChange={(keys) => {
									if (typeof keys === "string" && keys === "all") {
										setSelectedStations(
											new Set(stations.map((item) => `${item.id}`))
										);
									} else {
										setSelectedStations(new Set(keys));
									}
								}}
							>
								<TableHeader>
									<TableColumn>المحطة</TableColumn>
									<TableColumn>الحالة</TableColumn>
									<TableColumn></TableColumn>
									<TableColumn></TableColumn>
									<TableColumn></TableColumn>
									<TableColumn></TableColumn>
									<TableColumn></TableColumn>
									<TableColumn></TableColumn>
									<TableColumn></TableColumn>
									<TableColumn></TableColumn>
								</TableHeader>
								<TableBody>
									{stations &&
										stations.length > 0 &&
										stations.map((station) => (
											<TableRow key={station.id}>
												<TableCell>{station.name}</TableCell>
												<TableCell>{station.state}</TableCell>
												<TableCell></TableCell>
												<TableCell></TableCell>
												<TableCell></TableCell>
												<TableCell></TableCell>
												<TableCell></TableCell>
												<TableCell></TableCell>
												<TableCell></TableCell>
												<TableCell></TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default MonthlyClosingPageForm;
