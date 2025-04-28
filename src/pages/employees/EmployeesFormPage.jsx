import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import { Button } from "@fluentui/react-components";
import { SaveRegular } from "@fluentui/react-icons";
import Card from "../../UI/card/Card";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	addEmployee,
	editEmployee,
	getAllStations,
	getEmployee,
} from "../../api/serverApi";
import { Dropdown, TextField } from "@fluentui/react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
const EmployeesFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [name, setName] = useState("");
	const [station, setStation] = useState("");
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => {
				return { key: el.id, text: el.name };
			});
		},
	});
	useQuery({
		queryKey: ["employee", info.state?.id],
		queryFn: getEmployee,
		onSuccess: (res) => {
			setName(res.data.employee.name);
			setStation({ key: res.data.employee.station_id });
		},
		enabled: !!info.state,
	});
	const addMutation = useMutation({
		mutationFn: addEmployee,
		onSuccess: (res) => {
			toast.success("تم اضافة الموظف بنجاح", {
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
	const editMutation = useMutation({
		mutationFn: editEmployee,
		onSuccess: (res) => {
			toast.success("تم تعديل الموظف بنجاح", {
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
		<form
			onSubmit={(e) => {
				e.stopPropagation();
				info.state
					? editMutation.mutate({
							name,
							station: station.key,
							id: info.state.id,
					  })
					: addMutation.mutate({ name, station: station.key });
			}}
		>
			<TopBar
				right={
					<>
						<Button appearance="outline" onClick={() => navigate("./..")}>
							الغاء
						</Button>
						<Button appearance="primary" icon={<SaveRegular />} type="submit">
							حفظ
						</Button>
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
				<Card title="بيانات الموظف">
					<Row flex={[3, 2, 3]}>
						<TextField
							label="اسم الموظف"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>

						<Dropdown
							label="المحطة"
							placeholder="اختر المحطة"
							options={stations}
							required
							onChange={(event, item) => {
								setStation(item);
							}}
							selectedKey={station ? station.key : undefined}
						/>
						<></>
					</Row>
				</Card>
			</div>
		</form>
	);
};

export default EmployeesFormPage;
