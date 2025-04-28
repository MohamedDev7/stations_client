import React, { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Table from "./../../UI/table/Table";
import Card from "../../UI/card/Card";
import { toast } from "react-toastify";
import TopBar from "../../components/TopBar/TopBar";
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
import { SaveRegular, DeleteRegular, EditRegular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { deleteEmployee, getAllEmployees } from "../../api/serverApi";
const EmployeesPage = () => {
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
	const { data: employees } = useQuery({
		queryKey: ["employees"],
		queryFn: getAllEmployees,
		select: (res) => {
			return res.data.employees;
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteEmployee,
		onSuccess: (res) => {
			queryClient.invalidateQueries("employees");
			toast.success("تم حذف الموظف بنجاح", {
				position: "top-center",
			});
			setDialog({
				isOpened: false,
				title: "",
				content: "",
				actions: "",
			});
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
			setDialog({
				isOpened: false,
				title: "",
				content: "",
				actions: "",
			});
		},
	});
	const columns = [
		{ field: "name", headerName: "اسم الموظف", width: 200 },
		{
			field: "station",
			headerName: "المحطة",
			width: 200,
			renderCell: (params) => {
				return params.row.station?.name || "-";
			},
		},
		{
			field: "actions",
			filterable: false,
			headerName: "خيارات",
			width: 250,
			renderCell: (params) => {
				return (
					<div style={{ display: "flex", gap: "10px" }}>
						<Tooltip content="تعديل" relationship="label">
							<Button
								appearance="primary"
								icon={<EditRegular />}
								size="medium"
								{...restoreFocusTargetAttribute}
								onClick={() => {
									navigate("./edit", { state: { id: params.id } });
								}}
							/>
						</Tooltip>
						<Tooltip content="حذف" relationship="label">
							<Button
								style={{
									backgroundColor: "#b33c37",
								}}
								appearance="primary"
								icon={<DeleteRegular />}
								size="medium"
								{...restoreFocusTargetAttribute}
								onClick={() => {
									setDialog((prev) => {
										return {
											...prev,
											isOpened: true,
											title: "حذف موظف",
											content: (
												<DialogContent>
													هل أنت متأكد من حذف الموظف
													<span
														style={{
															fontWeight: "bold",
															fontSize: "16px",
															color: "#b33c37",
														}}
													>{` ${params.row.name}`}</span>
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
															deleteMutation.mutate(params.id);
														}}
													>
														تأكيد
													</Button>
												</DialogActions>
											),
										};
									});
								}}
							/>
						</Tooltip>
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
							icon={<SaveRegular />}
							onClick={() => {
								navigate("./add");
							}}
						>
							إضافة
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
				<Card title="الموظفين">
					<div style={{ margin: "20px 0" }}>
						{employees && employees.length > 0 && (
							<Table rows={employees} columns={columns} />
						)}
					</div>
				</Card>
			</div>
		</div>
	);
};

export default EmployeesPage;
