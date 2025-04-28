import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import { Field, Input } from "@fluentui/react-components";
import { SaveRegular } from "@fluentui/react-icons";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	addUser,
	editUser,
	getAllStations,
	getUser,
} from "../../api/serverApi";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, Checkbox } from "@heroui/react";
const UserFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();

	//states
	const [username, setUsername] = useState("");
	const [firstname, setFirstname] = useState("");
	const [lastname, setLastname] = useState("");
	// const [password, setPassword] = useState("");
	const [phone, setPhone] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [permissions, setPermissions] = useState({
		addUser: false,
		editUser: false,
		deleteUser: false,
		addDailyMovment: false,
		addShift: false,
		confirmMovment: false,
		confirmNotification: false,
		editNotification: false,
		stocktaking: false,
		calibration: false,
		admin: false,
	});
	const [selectedStations, setSelectedStations] = useState([]);
	//queries
	useQuery({
		queryKey: ["user", info.state?.id],
		queryFn: getUser,
		onSuccess: (res) => {
			setUsername(res.data.user.username);
			setFirstname(res.data.user.first_name);
			setLastname(res.data.user.last_name);
			setPhone(res.data.user.phone);

			res.data.permissions.forEach((el) => {
				setPermissions((prev) => {
					return { ...prev, [el.permission]: true };
				});
			});
			setSelectedStations(res.data.stations);
		},
		enabled: !!info.state,
	});

	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});
	const addMutation = useMutation({
		mutationFn: addUser,
		onSuccess: (res) => {
			toast.success("تم إضافةالمستخدم بنجاح", {
				position: "top-center",
			});
			navigate("./..", {
				// state: {
				// 	receive: res.data.receive[0],
				// },
			});
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	const editMutation = useMutation({
		mutationFn: editUser,
		onSuccess: (res) => {
			toast.success("تم تعديل المستخدم بنجاح", {
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
	const handleStationsCheckboxChange = (station) => {
		const index = selectedStations.findIndex(
			(el) => el.station_id === station.id
		);

		if (index === -1) {
			// Station is checked, add it to selectedStations
			setSelectedStations([...selectedStations, { station_id: station.id }]);
		} else {
			// Station is unchecked, remove it from selectedStations
			const updatedStations = [...selectedStations];
			updatedStations.splice(index, 1);
			setSelectedStations(updatedStations);
		}
	};

	return (
		<div className="w-full h-full overflow-auto ">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					// if (password !== confirmPassword) {
					// 	toast.error("كلمة المرور غير متطابقة", {
					// 		position: "top-center",
					// 	});
					// 	return;
					// }

					info.state
						? editMutation.mutate({
								username,
								// password,
								phone,
								firstname,
								lastname,
								permissions,
								id: info.state.id,
								stations: selectedStations,
						  })
						: addMutation.mutate({
								username,
								// password,
								phone,
								firstname,
								lastname,
								permissions,
								stations: selectedStations,
						  });
				}}
			>
				<TopBar
					right={
						<>
							<Button color="outline" onPress={() => navigate("./..")}>
								الغاء
							</Button>
							<Button color="primary" icon={<SaveRegular />} type="submit">
								حفظ
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							بيانات المستخدم
						</CardHeader>
						<CardBody>
							<Row flex={[1, 1, 3]}>
								<Field label="اسم المستخدم" required>
									<Input
										value={username}
										onChange={(e) => setUsername(e.target.value)}
									/>
								</Field>
								<Field label="الجوال" required>
									<Input
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
									/>
								</Field>

								<></>
							</Row>
							<Row flex={[1, 1, 1, 1]}>
								<Field label="الاسم الاول">
									<Input
										value={firstname}
										onChange={(e) => setFirstname(e.target.value)}
									/>
								</Field>
								<Field label="الاسم الاخير">
									<Input
										value={lastname}
										onChange={(e) => setLastname(e.target.value)}
									/>
								</Field>
								<></>
								<></>
							</Row>
							{/* <Row flex={[1, 1, 1, 1]}>
								<Field label="كلمة المرور" required>
									<Input
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
								</Field>
								<Field label="تاكيد كلمة المرور" required>
									<Input
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
									/>
								</Field>
								<></>
								<></>
							</Row> */}
						</CardBody>
					</Card>
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							صلاحيات المستخدم
						</CardHeader>
						<CardBody>
							<div className="flex gap-10">
								<div className="flex flex-col text-right gap-5">
									<h4 className="underline font-bold text-lg">المستخدمين</h4>
									<Checkbox
										isSelected={permissions.addUser}
										onChange={(e) => {
											setPermissions((prev) => {
												return { ...prev, addUser: e.target.checked };
											});
										}}
									>
										إضافة مستخدم
									</Checkbox>
									<Checkbox
										isSelected={permissions.editUser}
										onChange={(e) => {
											setPermissions((prev) => {
												return { ...prev, editUser: e.target.checked };
											});
										}}
									>
										تعديل مستخدم
									</Checkbox>
									<Checkbox
										isSelected={permissions.deleteUser}
										onChange={(e) => {
											setPermissions((prev) => {
												return { ...prev, deleteUser: e.target.checked };
											});
										}}
									>
										حذف مستخدم
									</Checkbox>
								</div>
								<div className="flex flex-col text-right gap-5">
									<h4 className="underline font-bold text-lg">
										الحركة اليومية
									</h4>
									<Checkbox
										isSelected={permissions.addDailyMovment}
										onChange={(e) => {
											setPermissions((prev) => {
												return { ...prev, addDailyMovment: e.target.checked };
											});
										}}
									>
										إضافة حركة يومية
									</Checkbox>
									<Checkbox
										isSelected={permissions.addShift}
										onChange={(e) => {
											setPermissions((prev) => {
												return { ...prev, addShift: e.target.checked };
											});
										}}
									>
										إضافة مناوبة
									</Checkbox>
									<Checkbox
										isSelected={permissions.confirmMovment}
										onChange={(e) => {
											setPermissions((prev) => {
												return { ...prev, confirmMovment: e.target.checked };
											});
										}}
									>
										اعتماد الحركة اليومية
									</Checkbox>
								</div>
								<div className="flex flex-col text-right gap-5">
									<h4 className="underline font-bold text-lg">الاشعارات</h4>
									<Checkbox
										isSelected={permissions.confirmNotification}
										onChange={(e) => {
											setPermissions((prev) => {
												return {
													...prev,
													confirmNotification: e.target.checked,
												};
											});
										}}
									>
										تأكيد الحركة
									</Checkbox>
									<Checkbox
										isSelected={permissions.editNotification}
										onChange={(e) => {
											setPermissions((prev) => {
												return { ...prev, editNotification: e.target.checked };
											});
										}}
									>
										فتح الحركة
									</Checkbox>
								</div>
								<div className="flex flex-col text-right gap-5">
									<h4 className="underline font-bold text-lg">الاعدادات</h4>
									<Checkbox
										isSelected={permissions.stocktaking}
										onChange={(e) => {
											setPermissions((prev) => {
												return {
													...prev,
													stocktaking: e.target.checked,
												};
											});
										}}
									>
										الجرد
									</Checkbox>
									<Checkbox
										isSelected={permissions.calibration}
										onChange={(e) => {
											setPermissions((prev) => {
												return { ...prev, calibration: e.target.checked };
											});
										}}
									>
										المعايرة
									</Checkbox>
									<Checkbox
										isSelected={permissions.admin}
										onChange={(e) => {
											setPermissions((prev) => {
												return { ...prev, admin: e.target.checked };
											});
										}}
									>
										ادمن
									</Checkbox>
								</div>
							</div>
						</CardBody>
					</Card>
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							المحطات
						</CardHeader>
						<CardBody>
							<div className="flex gap-10">
								{stations && stations.length > 0 ? (
									stations.map((station) => (
										<Checkbox
											isSelected={selectedStations.some(
												(el) => el.station_id === station.id
											)}
											key={station.id}
											onChange={() => handleStationsCheckboxChange(station)}
										>
											{station.name}
										</Checkbox>
									))
								) : (
									<EmptyContainer msg="لا توجد بيانات" />
								)}
							</div>
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default UserFormPage;
