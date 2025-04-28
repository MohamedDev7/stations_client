import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { changeMovmentState, getMovmentData } from "../../api/serverApi";
import { useMutation, useQuery } from "react-query";
import TopBar from "../../components/TopBar/TopBar";
import { Save, X } from "@mynaui/icons-react";
import { toast } from "react-toastify";
import {
	Card,
	CardBody,
	CardHeader,
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Button,
	Spinner,
} from "@heroui/react";
const ConfirmMovmentPage = () => {
	//hooks
	const info = useLocation();
	const navigate = useNavigate();

	//queries
	const { data: movmentReport, isLoading } = useQuery({
		queryKey: ["movmentReport", info.state.movment_id],
		queryFn: getMovmentData,
		select: (res) => {
			return res.data;
		},
	});
	const saveMutation = useMutation({
		mutationFn: changeMovmentState,
		onSuccess: (res) => {
			toast.success("تم اعتماد الحركة بنجاح", {
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
	return (
		<div className="w-full h-full overflow-auto ">
			<TopBar
				right={
					<>
						<Button
							color="warning"
							onPress={() => {
								navigate("./..");
							}}
						>
							<X />
							الغاء
						</Button>
						<Button
							color="primary"
							type="submit"
							onPress={() => {
								saveMutation.mutate({
									state: "approved",
									movment_id: info.state.movment_id,
									station_id: info.state.station_id,
									date: info.state.date,
								});
							}}
						>
							<Save />
							حفظ
						</Button>
					</>
				}
			/>
			<div className="w-full p-5 pb-16">
				{isLoading ? (
					<Spinner />
				) : (
					<>
						<Card>
							<CardHeader className="bg-primary text-default-50 font-bold text-medium">
								خلاصة الحركة اليومية
							</CardHeader>
							<CardBody>
								<div>
									<div
										style={{
											display: "flex",
											gap: "10px",
											margin: "10px 0",
											fontSize: "16px",
											fontWeight: "bold",
										}}
									>
										<div>المحطة:</div>
										<div>{info.state.station_name}</div>
									</div>
									<div
										style={{
											display: "flex",
											gap: "10px",
											margin: "10px 0",
											fontSize: "16px",
											fontWeight: "bold",
										}}
									>
										<div>التاريخ:</div>
										<div>{info.state.date}</div>
									</div>
									<div
										style={{
											display: "flex",
											gap: "10px",
											margin: "10px 0",
											fontSize: "16px",
											fontWeight: "bold",
										}}
									>
										<div>رقم الحركة:</div>
										<div>{info.state.number}</div>
									</div>
									<div
										style={{
											display: "flex",
											gap: "10px",
											margin: "10px 0",
											fontSize: "16px",
											fontWeight: "bold",
										}}
									>
										<div>عدد المناوبات:</div>
										<div>{info.state.shifts}</div>
									</div>
								</div>
							</CardBody>
						</Card>
						<Card>
							<CardHeader className="bg-primary text-default-50 font-bold text-medium">
								حركة المخازن
							</CardHeader>
							<CardBody>
								<Table removeWrapper>
									<TableHeader>
										<TableColumn>المخزن</TableColumn>
										<TableColumn>الرصيد السابق</TableColumn>
										<TableColumn>الرصيد الحالي</TableColumn>
									</TableHeader>
									<TableBody>
										{movmentReport.storesMovment.map((store) => (
											<TableRow key={store.id}>
												<TableCell>
													{`${store.name}-${store.substance}`}
												</TableCell>
												<TableCell>{store.prev_value}</TableCell>
												<TableCell>{store.curr_value}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardBody>
						</Card>
						<Card>
							<CardHeader className="bg-primary text-default-50 font-bold text-medium">
								حركة العدادات
							</CardHeader>
							<CardBody>
								<Table removeWrapper arial-label="Default table">
									<TableHeader>
										<TableColumn>الطرمبة</TableColumn>
										<TableColumn>بداية المناوبة (أ)</TableColumn>
										<TableColumn>نهاية المناوبة (أ)</TableColumn>
										<TableColumn>بداية المناوبة (ب)</TableColumn>
										<TableColumn>نهاية المناوبة (ب)</TableColumn>
										<TableColumn>الفارق</TableColumn>
									</TableHeader>
									<TableBody>
										{movmentReport.dispensersMovment.map((dispenser) => (
											<TableRow key={dispenser.id}>
												<TableCell>
													{`${dispenser.number}-${dispenser.substance}`}
												</TableCell>
												<TableCell>{dispenser.prev_A}</TableCell>
												<TableCell>{dispenser.curr_A}</TableCell>
												<TableCell>{dispenser.prev_B}</TableCell>
												<TableCell>{dispenser.curr_B}</TableCell>
												<TableCell>
													{dispenser.curr_A -
														dispenser.prev_A +
														dispenser.curr_B -
														dispenser.prev_B}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardBody>
						</Card>
						{movmentReport && movmentReport.incomes.length > 0 && (
							<Card>
								<CardHeader className="bg-primary text-default-50 font-bold text-medium">
									الواردات
								</CardHeader>
								<CardBody>
									<Table removeWrapper arial-label="Default table">
										<TableHeader>
											<TableColumn>الكمية</TableColumn>
											<TableColumn>المستودع</TableColumn>
											<TableColumn>الناقلة</TableColumn>
											<TableColumn>السائق</TableColumn>
										</TableHeader>
										<TableBody>
											{movmentReport.incomes.map((income, i) => (
												<TableRow key={i}>
													<TableCell>{income.amount}</TableCell>
													<TableCell>
														{`${income.store.name} - ${income.store.substance.name}`}
													</TableCell>
													<TableCell>{income.truck_number}</TableCell>
													<TableCell>{income.truck_driver}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardBody>
							</Card>
						)}

						{movmentReport && movmentReport.calibrations.length > 0 && (
							<Card>
								<CardHeader className="bg-primary text-default-50 font-bold text-medium">
									معايرة
								</CardHeader>
								<CardBody>
									<Table removeWrapper arial-label="Default table">
										<TableHeader>
											<TableColumn>الكمية</TableColumn>
											<TableColumn>المستودع</TableColumn>
										</TableHeader>
										<TableBody>
											{movmentReport.calibrations.map((item) => (
												<TableRow key={item.id}>
													<TableCell>{item.amount}</TableCell>
													<TableCell>
														{`${item.store.name} - ${item.store.substance.name}`}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardBody>
							</Card>
						)}
						{movmentReport && movmentReport.surplus.length > 0 && (
							<Card>
								<CardHeader className="bg-primary text-default-50 font-bold text-medium">
									فائض
								</CardHeader>
								<CardBody>
									<Table removeWrapper arial-label="Default table">
										<TableHeader>
											<TableColumn>الكمية</TableColumn>
											<TableColumn>المستودع</TableColumn>
										</TableHeader>
										<TableBody>
											{movmentReport.surplus.map((item) => (
												<TableRow key={item.id}>
													<TableCell>{item.amount}</TableCell>
													<TableCell>
														{`${item.store.name} - ${item.store.substance.name}`}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardBody>
							</Card>
						)}
						{movmentReport && movmentReport.coupons.length > 0 && (
							<Card>
								<CardHeader className="bg-primary text-default-50 font-bold text-medium">
									مسحوبات الفرع
								</CardHeader>
								<CardBody>
									<Table removeWrapper arial-label="Default table">
										<TableHeader>
											<TableColumn>الكمية</TableColumn>
											<TableColumn>المستودع</TableColumn>
											<TableColumn>النوع</TableColumn>
										</TableHeader>
										<TableBody>
											{movmentReport.coupons.map((item) => (
												<TableRow key={item.id}>
													<TableCell>{item.amount}</TableCell>
													<TableCell>
														{`${item.store.name} - ${item.store.substance.name}`}
													</TableCell>
													<TableCell>{item.type}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardBody>
							</Card>
						)}
						{movmentReport && movmentReport.others.length > 0 && (
							<Card>
								<CardHeader className="bg-primary text-default-50 font-bold text-medium">
									مسحوبات أخرى
								</CardHeader>
								<CardBody>
									<Table removeWrapper arial-label="Default table">
										<TableHeader>
											<TableColumn>المخزن</TableColumn>
											<TableColumn>البيان</TableColumn>
											<TableColumn>الكمية</TableColumn>
										</TableHeader>
										<TableBody>
											{movmentReport.others.map((item) => (
												<TableRow key={item.id}>
													<TableCell>
														{`${item.store.name} - ${item.store.substance.name}`}
													</TableCell>
													<TableCell>{item.title}</TableCell>
													<TableCell>{item.amount}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardBody>
							</Card>
						)}
					</>
				)}
			</div>
		</div>
	);
};
export default ConfirmMovmentPage;
