import React, { useRef, useState } from "react";
import {
	deleteUser,
	editPasswordByAdmin,
	getAllUsers,
} from "../../api/serverApi";
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
import { Refresh } from "@mynaui/icons-react";

import { SaveRegular, DeleteRegular, EditRegular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
const UsersPage = () => {
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
	const { data: users } = useQuery({
		queryKey: ["users"],
		queryFn: getAllUsers,
		select: (res) => {
			return res.data.users.map((el, i) => {
				return { ...el, m: i + 1 };
			});
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: (res) => {
			queryClient.invalidateQueries("users");
			toast.success("تم حذف المستخدم بنجاح", {
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
	const changePassword = useMutation({
		mutationFn: editPasswordByAdmin,
		onSuccess: (res) => {
			queryClient.invalidateQueries("users");
			toast.success("تم تعديل كلمة المرور وارسالها لرقم المستخدم بنجاح", {
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
		{ field: "m", headerName: "م", width: 70 },
		{ field: "username", headerName: "اسم المستخدم", width: 200 },
		{ field: "first_name", headerName: "الاسم الاول ", width: 200 },
		{ field: "last_name", headerName: "الاسم الاخير ", width: 200 },
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
								// disabled={item.state === "paid" ? true : false}
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
								// disabled={item.state === "paid" ? true : false}
								{...restoreFocusTargetAttribute}
								onClick={() => {
									setDialog((prev) => {
										return {
											...prev,
											isOpened: true,
											title: "حذف مستخدم",
											content: (
												<DialogContent>
													هل أنت متأكد من حذف المستخدم
													<span
														style={{
															fontWeight: "bold",
															fontSize: "16px",
															color: "#b33c37",
														}}
													>{` ${params.row.first_name} ${params.row.last_name} `}</span>
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
						<Tooltip content="تغيير كلمة المرور" relationship="label">
							<Button
								appearance="primary"
								icon={<Refresh />}
								size="medium"
								// disabled={item.state === "paid" ? true : false}
								{...restoreFocusTargetAttribute}
								onClick={() => {
									setDialog((prev) => {
										return {
											...prev,
											isOpened: true,
											title: "تغيير كلمة المرور",
											content: (
												<DialogContent>
													هل أنت متأكد من تغيير كلمة المرور للمستخدم
													<span
														style={{
															fontWeight: "bold",
															fontSize: "16px",
															color: "#b33c37",
														}}
													>{` ${params.row.first_name} ${params.row.last_name} `}</span>
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
															changePassword.mutate(params.id);
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
		<>
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
				<Card title="المستخدمين">
					<div style={{ margin: "20px 0" }}>
						{users && users.length > 0 && (
							<Table rows={users} columns={columns} />
						)}
					</div>
				</Card>
			</div>
		</>
	);
};

export default UsersPage;
