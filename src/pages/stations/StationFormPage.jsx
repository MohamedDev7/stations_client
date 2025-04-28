import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from "../../components/TopBar/TopBar";
import {
	Button,
	Field,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
	makeStyles,
	Select,
} from "@fluentui/react-components";
import {
	DismissRegular,
	SaveRegular,
	DeleteRegular,
} from "@fluentui/react-icons";
import Card from "../../UI/card/Card";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	addStation,
	getAllSubstances,
	getSubstancesPricesByDate,
} from "../../api/serverApi";
import { toast } from "react-toastify";
import { getPrevDate } from "../../utils/functions";

//styles
const useStyles = makeStyles({
	deleteBtn: {
		backgroundColor: "#dd3547",
		":hover": { backgroundColor: "#c82333" },
	},
});

const StationFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	const styles = useStyles();
	//states
	const [name, setName] = useState("");
	const [supervisor, setSupervisor] = useState("");
	const [number, setNumber] = useState("");
	const [date, setDate] = useState("");
	const [province, setProvince] = useState("");
	const [tanks, setTanks] = useState([]);
	const [dispensers, setDispensers] = useState([]);
	const [stores, setStores] = useState([]);
	const [shifts, setShifts] = useState([]);
	const [dispensersCount, setDispensersCount] = useState(0);
	const [tanksCount, setTanksCount] = useState(0);
	const [storesCount, setStoresCount] = useState(0);
	const [shiftsCount, setShiftsCount] = useState(0);
	//queries

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

	const saveMutation = useMutation({
		mutationFn: addStation,
		onSuccess: (res) => {
			toast.success("تم إضافة المحطة بنجاح", {
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
	// const editMutation = useMutation({
	// 	mutationFn: editStation,
	// 	onSuccess: (res) => {
	// 		toast.success("تم تعديل الصندوق بنجاح", {
	// 			position: "top-center",
	// 		});
	// 		navigate("./..", {});
	// 	},
	// 	onError: (err) => {
	// 		toast.error(err.response.data.message, {
	// 			position: "top-center",
	// 		});
	// 	},
	// });
	//functions
	const addTankHandler = () => {
		setTanks((prev) => [
			...prev,
			{
				id: tanksCount + 1,
				number: "",
				substance: "",
				deadAmount: 0,
				capacity: 0,
				price: 0,
			},
		]);
		setTanksCount((prev) => prev + 1);
	};
	const addDispenserHandler = () => {
		setDispensers((prev) => [
			...prev,
			{
				id: dispensersCount + 1,
				tankId: "",
				number: "",
				A: 0,
				B: 0,
				tankNumber: "",
				wheelCounter_A: 0,
				wheelCounter_B: 0,
				price: 0,
			},
		]);
		setDispensersCount((prev) => prev + 1);
	};
	const addStoreHandler = () => {
		setStores((prev) => [
			...prev,
			{
				id: storesCount + 1,
				name: "",
				substance_id: "",
				substance_name: "",
				type: "",
				init_stock: 0,
				price: 0,
			},
		]);
		setStoresCount((prev) => prev + 1);
	};
	const addShiftHandler = () => {
		setShifts((prev) => [
			...prev,
			{
				id: shiftsCount + 1,
				number: "",
				start: "",
				end: "",
			},
		]);
		setShiftsCount((prev) => prev + 1);
	};

	return (
		<div className="w-full h-full overflow-auto ">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					info.state
						? editMutation.mutate({
								name,
								id: info.state.id,
						  })
						: saveMutation.mutate({
								name,
								tanks,
								dispensers,
								stores,
								shifts,
								date,
								// prevDate: getPrevDate(date),
								number,
								province,
								supervisor,
						  });
				}}
			>
				<TopBar
					right={
						<>
							<Button
								appearance="secondary"
								icon={<DismissRegular />}
								onClick={() => {
									navigate("./..");
								}}
							>
								الغاء
							</Button>
							<Button appearance="primary" icon={<SaveRegular />} type="submit">
								حفظ
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card title="بيانات المحطة">
						<Row flex={[2, 1, 1]}>
							<Field label="اسم المحطة" required>
								<Input value={name} onChange={(e) => setName(e.target.value)} />
							</Field>
							<Field label="رقم المحطة" required>
								<Input
									value={number}
									onChange={(e) => setNumber(e.target.value)}
								/>
							</Field>
							<Field label="تاريخ البدء" required>
								<Input
									value={date}
									type="date"
									onChange={(e) => setDate(e.target.value)}
								/>
							</Field>
						</Row>
						<Row flex={[1, 3]}>
							<Field label="المديرية" required>
								<Select
									required
									onChange={(e) => {
										setProvince(e.target.value);
									}}
								>
									<option></option>
									<option value="الغيضة">الغيضة</option>
									<option value="شحن">شحن</option>
									<option value="حوف">حوف</option>
									<option value="سيحوت">سيحوت</option>
									<option value="قشن">قشن</option>
								</Select>
							</Field>
							<Field label="مشرف المحطة" required>
								<Input
									value={supervisor}
									onChange={(e) => setSupervisor(e.target.value)}
								/>
							</Field>
						</Row>
					</Card>
					<Card title="الخزانات">
						<Table arial-label="Default table">
							<TableHeader>
								<TableRow>
									<TableHeaderCell>رقم الخزان</TableHeaderCell>
									<TableHeaderCell>المادة</TableHeaderCell>
									<TableHeaderCell>سعة الخزان</TableHeaderCell>
									<TableHeaderCell>الكمية الميتة</TableHeaderCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{tanks.map((item) => (
									<TableRow key={item.id}>
										<TableCell>
											<Input
												required
												value={
													tanks.filter((el) => el.id === item.id)[0].number
												}
												onChange={(e) => {
													e.stopPropagation();
													const updated = tanks.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																number: +e.target.value,
															};
														}
														return el;
													});
													setTanks(updated);
												}}
											/>
										</TableCell>
										<TableCell>
											<Select
												required
												onChange={(e, id) => {
													e.stopPropagation();
													const updated = tanks.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																substance: +e.target.value,
																price: substances.filter(
																	(ele) => ele.id === +e.target.value
																)[0].price,
															};
														}
														return el;
													});
													setTanks(updated);
												}}
											>
												<option></option>
												{substances &&
													substances.length > 0 &&
													substances.map((el) => (
														<option value={el.id} key={el.id}>
															{el.name}
														</option>
													))}
											</Select>
										</TableCell>
										<TableCell>
											<Input
												value={
													tanks.filter((el) => el.id === item.id)[0].capacity
												}
												onChange={(e) => {
													e.stopPropagation();
													const updated = tanks.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																capacity: +e.target.value,
															};
														}
														return el;
													});
													setTanks(updated);
												}}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
												type="number"
												min="1"
											/>
										</TableCell>
										<TableCell>
											<Input
												value={
													tanks.filter((el) => el.id === item.id)[0].deadAmount
												}
												onChange={(e) => {
													e.stopPropagation();
													const updated = tanks.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																deadAmount: +e.target.value,
															};
														}
														return el;
													});
													setTanks(updated);
												}}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
												type="number"
												min="1"
											/>
										</TableCell>
										<TableCell>
											<Button
												icon={<DeleteRegular />}
												appearance="primary"
												className={styles.deleteBtn}
												onClick={() =>
													setTanks((prev) =>
														prev.filter((el) => el.id !== item.id)
													)
												}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<Row>
							<Button appearance="primary" onClick={addTankHandler}>
								إضافة
							</Button>
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
								{dispensers.map((item) => (
									<TableRow key={item.id}>
										<TableCell>
											<Input
												value={
													dispensers.filter((el) => el.id === item.id)[0].number
												}
												style={{ maxWidth: "100px" }}
												onChange={(e) => {
													e.stopPropagation();
													const updated = dispensers.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																number: +e.target.value,
															};
														}
														return el;
													});
													setDispensers(updated);
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
													const updated = dispensers.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																tankId: +e.target.value,
																tankNumber: tanks.filter(
																	(el) => el.id === +e.target.value
																)[0].number,
																price: tanks.filter(
																	(ele) => ele.id === +e.target.value
																)[0].price,
															};
														}
														return el;
													});
													setDispensers(updated);
												}}
											>
												<option></option>
												{tanks.map((el) => (
													<option key={el.id} value={el.number}>
														{el.number}-
														{
															substances.filter(
																(ele) => ele.id === el.substance
															)[0].name
														}
													</option>
												))}
											</Select>
										</TableCell>
										<TableCell>
											<Input
												value={
													dispensers.filter((el) => el.id === item.id)[0].A
												}
												onChange={(e) => {
													e.stopPropagation();
													const updated = dispensers.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																A: +e.target.value,
															};
														}
														return el;
													});
													setDispensers(updated);
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
												value={
													dispensers.filter((el) => el.id === item.id)[0].B
												}
												onChange={(e) => {
													e.stopPropagation();
													const updated = dispensers.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																B: +e.target.value,
															};
														}
														return el;
													});
													setDispensers(updated);
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
												value={
													dispensers.filter((el) => el.id === item.id)[0]
														.wheelCounter_A
												}
												onChange={(e) => {
													e.stopPropagation();
													const updated = dispensers.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																wheelCounter_A: +e.target.value,
															};
														}
														return el;
													});
													setDispensers(updated);
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
												value={
													dispensers.filter((el) => el.id === item.id)[0]
														.wheelCounter_B
												}
												onChange={(e) => {
													e.stopPropagation();
													const updated = dispensers.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																wheelCounter_B: +e.target.value,
															};
														}
														return el;
													});
													setDispensers(updated);
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
											<Button
												icon={<DeleteRegular />}
												appearance="primary"
												className={styles.deleteBtn}
												onClick={() =>
													setDispensers((prev) =>
														prev.filter((el) => el.id !== item.id)
													)
												}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<Row>
							<Button appearance="primary" onClick={addDispenserHandler}>
								إضافة
							</Button>
						</Row>
					</Card>
					<Card title="المخازن">
						<Table arial-label="Default table">
							<TableHeader>
								<TableRow>
									<TableHeaderCell>اسم المخزن</TableHeaderCell>
									<TableHeaderCell>المادة</TableHeaderCell>
									<TableHeaderCell>رصيد افتتاحي</TableHeaderCell>
									<TableHeaderCell>النوع</TableHeaderCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{stores.map((item) => (
									<TableRow key={item.id}>
										<TableCell>
											<Input
												value={stores.filter((el) => el.id === item.id)[0].name}
												onChange={(e) => {
													e.stopPropagation();
													const updated = stores.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																name: e.target.value,
															};
														}
														return el;
													});
													setStores(updated);
												}}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
											/>
										</TableCell>
										<TableCell>
											<Select
												required
												onChange={(e, id) => {
													e.stopPropagation();
													const updated = stores.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																substance_id: +e.target.value,
																substance_name: substances.filter(
																	(el) => el.id === +e.target.value
																)[0].name,
																price: substances.filter(
																	(ele) => ele.id === +e.target.value
																)[0].price,
															};
														}
														return el;
													});
													setStores(updated);
												}}
												value={
													stores.filter((el) => el.id === item.id)[0].substance
												}
											>
												<option></option>
												{substances &&
													substances.length > 0 &&
													substances.map((el) => (
														<option value={el.id} key={el.id}>
															{el.name}
														</option>
													))}
											</Select>
										</TableCell>
										<TableCell>
											<Input
												value={
													stores.filter((el) => el.id === item.id)[0].init_stock
												}
												onChange={(e) => {
													e.stopPropagation();
													const updated = stores.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																init_stock: e.target.value,
															};
														}
														return el;
													});
													setStores(updated);
												}}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
											/>
										</TableCell>
										<TableCell>
											<Select
												required
												onChange={(e) => {
													e.stopPropagation();
													const updated = stores.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																type: e.target.value,
															};
														}
														return el;
													});
													setStores(updated);
												}}
												value={stores.filter((el) => el.id === item.id)[0].type}
											>
												<option></option>
												<option value="نقدي">نقدي</option>
												<option value="مجنب">مجنب</option>
											</Select>
										</TableCell>
										<TableCell>
											<Button
												icon={<DeleteRegular />}
												appearance="primary"
												className={styles.deleteBtn}
												onClick={() =>
													setStores((prev) =>
														prev.filter((el) => el.id !== item.id)
													)
												}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<Row>
							<Button appearance="primary" onClick={addStoreHandler}>
								إضافة
							</Button>
						</Row>
					</Card>
					<Card title="المناوبات">
						<Table arial-label="Default table">
							<TableHeader>
								<TableRow>
									<TableHeaderCell>رقم النوبة</TableHeaderCell>
									<TableHeaderCell>بداية النوبة</TableHeaderCell>
									<TableHeaderCell>نهاية النوبة</TableHeaderCell>
									<TableHeaderCell></TableHeaderCell>
								</TableRow>
							</TableHeader>
							<TableBody>
								{shifts.map((item) => (
									<TableRow key={item.id}>
										<TableCell>
											<Input
												value={
													shifts.filter((el) => el.id === item.id)[0].number
												}
												onChange={(e) => {
													e.stopPropagation();
													const updated = shifts.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																number: +e.target.value,
															};
														}
														return el;
													});
													setShifts(updated);
												}}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
												type="number"
											/>
										</TableCell>
										<TableCell>
											<Input
												value={
													shifts.filter((el) => el.id === item.id)[0].start
												}
												onChange={(e) => {
													e.stopPropagation();
													const updated = shifts.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																start: e.target.value,
															};
														}
														return el;
													});
													setShifts(updated);
												}}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
												type="time"
											/>
										</TableCell>
										<TableCell>
											<Input
												value={shifts.filter((el) => el.id === item.id)[0].end}
												onChange={(e) => {
													e.stopPropagation();
													const updated = shifts.map((el) => {
														if (el.id === item.id) {
															return {
																...el,
																end: e.target.value,
															};
														}
														return el;
													});
													setShifts(updated);
												}}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
												type="time"
											/>
										</TableCell>
										<TableCell>
											<Button
												icon={<DeleteRegular />}
												appearance="primary"
												className={styles.deleteBtn}
												onClick={() =>
													setShifts((prev) =>
														prev.filter((el) => el.id !== item.id)
													)
												}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<Row>
							<Button appearance="primary" onClick={addShiftHandler}>
								إضافة
							</Button>
						</Row>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default StationFormPage;
