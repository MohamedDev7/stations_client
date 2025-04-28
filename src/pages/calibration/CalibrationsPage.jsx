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
import {
	SaveRegular,
	DeleteRegular,
	EditRegular,
	PrintRegular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import {
	deleteCalibrationReport,
	getAllCalibrationsReports,
	getCalibrationReport,
} from "../../api/serverApi";

const CalibrationsPage = () => {
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
	const [calibrationReportToFetch, setCalibrationReportToFetch] = useState("");
	//queries
	const { data: calibrations } = useQuery({
		queryKey: ["calibrationReport"],
		queryFn: getAllCalibrationsReports,
		select: (res) => {
			return res.data.calibrations;
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	const { data, isLoading } = useQuery({
		queryKey: ["calibrationReport", calibrationReportToFetch],
		queryFn: getCalibrationReport,
		onSuccess: (data) => {
			setCalibrationReportToFetch("");
			navigate("./print", {
				state: {
					data: data.data.data,
					reportTemplate: "calibrationReport",
				},
			});
		},
		onError: () => {
			setCalibrationReportToFetch("");
		},
		enabled: !!calibrationReportToFetch,
	});
	const deleteMutation = useMutation({
		mutationFn: deleteCalibrationReport,
		onSuccess: (res) => {
			queryClient.invalidateQueries("calibrationReport");
			toast.success("تم حذف المعايرة بنجاح", {
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
		{
			field: "date",
			headerName: "التاريخ",
			width: 120,
			renderCell: (params) => {
				return params.row.movment.date;
			},
		},

		{
			field: "station",
			headerName: "المحطة",
			width: 200,
			renderCell: (params) => {
				return params.row.station.name;
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
						<Tooltip content="طباعة" relationship="label">
							<Button
								appearance="primary"
								icon={<PrintRegular />}
								size="medium"
								disabled={isLoading}
								{...restoreFocusTargetAttribute}
								onClick={() => {
									setCalibrationReportToFetch(params.id);
								}}
							/>
						</Tooltip>
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
											title: "حذف معايرة",
											content: (
												<DialogContent>
													هل أنت متأكد من حذف المعايرة ؟
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
				<Card title="المعايرات">
					<div style={{ margin: "20px 0" }}>
						{calibrations && calibrations.length > 0 && (
							<Table rows={calibrations} columns={columns} />
						)}
					</div>
				</Card>
			</div>
		</div>
	);
};

export default CalibrationsPage;
