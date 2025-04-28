import {
	Button,
	Dialog,
	DialogActions,
	DialogBody,
	DialogContent,
	DialogSurface,
	DialogTitle,
	DialogTrigger,
	Tooltip,
	useRestoreFocusTarget,
} from "@fluentui/react-components";
import React, { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { changeDispenserState, getAllDispensers } from "../../api/serverApi";
import { toast } from "react-toastify";
import TopBar from "../../components/TopBar/TopBar";
import Table from "../../UI/table/Table";
import {
	AddRegular,
	PresenceBlockedRegular,
	CheckmarkFilled,
} from "@fluentui/react-icons";
import Card from "../../UI/card/Card";

const DispensersPage = () => {
	//hooks
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const restoreFocusTargetAttribute = useRestoreFocusTarget();
	const componentRef = useRef();
	//states
	const [dialog, setDialog] = useState({
		isOpened: false,
		title: "",
		content: "",
		actions: "",
	});
	//queries

	const { data: dispensers } = useQuery({
		queryKey: ["dispensers"],
		queryFn: getAllDispensers,
		select: (res) => {
			return res.data.dispensers.map((el) => {
				return {
					...el,
					station_name: el.station.name,
					substance: el.tank.substance.name,
					is_active: el.is_active ? true : false,
				};
			});
		},
	});
	const updateMutation = useMutation({
		mutationFn: changeDispenserState,
		onSuccess: (res) => {
			setDialog({
				isOpened: false,
				title: "",
				content: "",
				actions: "",
			});
			toast.success("تمت العملية بنجاح", {
				position: "top-center",
			});
			queryClient.invalidateQueries("dispensers");
		},
		onError: (err) => {
			setDialog({
				isOpened: false,
				title: "",
				content: "",
				actions: "",
			});
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	const columns = [
		{ field: "id", headerName: "م", width: 70 },
		{ field: "number", headerName: "رقم الطرمبة", width: 150 },
		{ field: "substance", headerName: "المادة", width: 150 },
		{
			field: "is_active",
			headerName: "الحالة",
			width: 150,
			renderCell: (params) => {
				return params.row.is_active ? "نشط" : "خامل";
			},
		},
		{ field: "station_name", headerName: "المحطة", width: 350 },
		{
			field: "actions",
			filterable: false,
			headerName: "خيارات",
			width: 250,
			renderCell: (params) => {
				return (
					<div style={{ display: "flex", gap: "10px" }}>
						{params.row.is_active ? (
							<Tooltip content="تعطيل" relationship="label">
								<Button
									style={{
										backgroundColor: "#b33c37",
									}}
									appearance="primary"
									icon={<PresenceBlockedRegular />}
									size="medium"
									{...restoreFocusTargetAttribute}
									onClick={() => {
										setDialog((prev) => {
											return {
												...prev,
												isOpened: true,
												title: "تعطيل طرمبة",
												content: (
													<DialogContent>
														هل أنت متأكد من تعطيل الطرمبة
														<span
															style={{
																fontWeight: "bold",
																fontSize: "16px",
																color: "#b33c37",
															}}
														>{` ${params.row.number} - ${params.row.substance}`}</span>
														؟
													</DialogContent>
												),
												actions: (
													<DialogActions>
														<DialogTrigger disableButtonEnhancement>
															<Button appearance="secondary">الغاء</Button>
														</DialogTrigger>
														<Button
															appearance="primary"
															onClick={() => {
																updateMutation.mutate({
																	...params.row,
																	active: !params.row.is_active,
																});
															}}
														>
															تأكيد
														</Button>
													</DialogActions>
												),
											};
										});
									}}
									disabled={updateMutation.isLoading ? true : false}
								/>
							</Tooltip>
						) : (
							<Tooltip content="تنشيط" relationship="label">
								<Button
									style={{
										backgroundColor: "#008000",
									}}
									appearance="primary"
									icon={<CheckmarkFilled />}
									size="medium"
									{...restoreFocusTargetAttribute}
									onClick={() => {
										setDialog((prev) => {
											return {
												...prev,
												isOpened: true,
												title: "تنشيط طرمبة",
												content: (
													<DialogContent>
														هل أنت متأكد من تنشيط الطرمبة
														<span
															style={{
																fontWeight: "bold",
																fontSize: "16px",
																color: "#b33c37",
															}}
														>{` ${params.row.number} - ${params.row.substance}`}</span>
														؟
													</DialogContent>
												),
												actions: (
													<DialogActions>
														<DialogTrigger disableButtonEnhancement>
															<Button appearance="secondary">الغاء</Button>
														</DialogTrigger>
														<Button
															appearance="primary"
															onClick={() => {
																updateMutation.mutate({
																	...params.row,
																	active: !params.row.is_active,
																});
															}}
														>
															تأكيد
														</Button>
													</DialogActions>
												),
											};
										});
									}}
									disabled={updateMutation.isLoading ? true : false}
								/>
							</Tooltip>
						)}
					</div>
				);
			},
		},
	];
	return (
		<div className="w-full h-full overflow-auto ">
			<Dialog
				open={dialog.isOpened}
				onOpenChange={(event, data) => {
					setDialog((prev) => {
						return { ...prev, isOpened: data.open };
					});
				}}
			>
				<DialogSurface>
					<DialogBody>
						<DialogTitle>{dialog.title}</DialogTitle>
						<DialogContent ref={componentRef}>{dialog.content}</DialogContent>
						<DialogActions>{dialog.actions}</DialogActions>
					</DialogBody>
				</DialogSurface>
			</Dialog>
			<TopBar
				right={
					<>
						<Button
							appearance="primary"
							icon={<AddRegular />}
							onClick={() => {
								navigate("./add");
							}}
						>
							اضافة
						</Button>
					</>
				}
			/>
			<div
				style={{
					padding: "0 15px",
					marginTop: "10px",

					display: "flex",
					flexDirection: "column",
					gap: "15px",
				}}
			>
				<Card title="الطرمبات">
					<div style={{ margin: "20px 0" }}>
						{dispensers && dispensers.length > 0 ? (
							<Table rows={dispensers} columns={columns} pageSize={[5, 10]} />
						) : (
							<div style={{ padding: "20px", textAlign: "center" }}>
								لا توجد بيانات مضافة
							</div>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
};

export default DispensersPage;
