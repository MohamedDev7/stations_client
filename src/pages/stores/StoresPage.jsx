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
import { getAllStations, getAllStores } from "../../api/serverApi";
import { toast } from "react-toastify";
import TopBar from "../../components/TopBar/TopBar";
import Table from "../../UI/table/Table";
import { AddRegular, DeleteRegular, EditRegular } from "@fluentui/react-icons";
import Card from "../../UI/card/Card";

const StoresPage = () => {
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
	// const { data: stations } = useQuery({
	// 	queryKey: ["stations"],
	// 	queryFn: getAllStations,
	// 	select: (res) => {
	// 		return res.data.stations.map((el) => el);
	// 	},
	// });
	const { data: stores } = useQuery({
		queryKey: ["stores"],
		queryFn: getAllStores,
		select: (res) => {
			return res.data.stores.map((el) => {
				return {
					...el,
					station_name: el.station.name,
					store_name: `${el.name}-${el.substance.name}`,
				};
			});
		},
	});
	const columns = [
		{ field: "id", headerName: "م", width: 70 },
		{ field: "store_name", headerName: "المخزن", width: 350 },
		{ field: "station_name", headerName: "المحطة", width: 350 },
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
											title: "حذف مادة",
											content: (
												<DialogContent>
													هل أنت متأكد من حذف مادة
													<span
														style={{
															fontWeight: "bold",
															fontSize: "16px",
															color: "#b33c37",
														}}
													>{` ال${params.row.name} `}</span>
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
				<Card title="المخازن">
					<div style={{ margin: "20px 0" }}>
						{stores && stores.length > 0 ? (
							<Table rows={stores} columns={columns} />
						) : (
							<div style={{ padding: "20px", textAlign: "center" }}>
								لا توجد بيانات مضافة
							</div>
						)}
					</div>
				</Card>
			</div>
		</>
	);
};

export default StoresPage;
