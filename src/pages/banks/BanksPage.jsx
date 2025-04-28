import { Trash, Edit } from "@mynaui/icons-react";
import React, { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import TopBar from "../../components/TopBar/TopBar";
import { Plus, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
	// Button,
	Dialog,
	DialogActions,
	DialogBody,
	DialogContent,
	DialogSurface,
	DialogTitle,
	DialogTrigger,
	useRestoreFocusTarget,
} from "@fluentui/react-components";
import { Button } from "@heroui/react";

import { SaveRegular, DeleteRegular, EditRegular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { deleteBank, getAllBanks } from "../../api/serverApi";
import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";
import Card from "../../UI/card/Card";
import Table from "../../UI/table/Table";

const BanksPage = () => {
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
	const { data: banks } = useQuery({
		queryKey: ["banks"],
		queryFn: getAllBanks,
		select: (res) => {
			return res.data.banks;
		},
		// onSuccess: (data) => {
		// 	setBanks(data);
		// },
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteBank,
		onSuccess: (res) => {
			queryClient.invalidateQueries("banks");
			toast.success("تم الحذف بنجاح", {
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
			accessorKey: "name",
			header: ({ column }) => {
				return (
					<div className="text-right">
						<Button
							variant="ghost"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
						>
							اسم الصرافة
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</Button>
					</div>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => {
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>خيارات</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() => {
									navigate("./edit", {
										state: { id: row.original.id, name: row.original.name },
									});
								}}
							>
								<Edit />
								تعديل
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => {
									setDialog((prev) => {
										return {
											...prev,
											isOpened: true,
											title: "حذف",
											content: (
												<DialogContent>هل أنت متأكد من الحذف ؟</DialogContent>
											),
											actions: (
												<DialogActions>
													<DialogTrigger disableButtonEnhancement>
														<Button appearance="secondary">الغاء</Button>
													</DialogTrigger>
													<Button
														appearance="primary"
														onClick={() => {
															deleteMutation.mutate(row.original.id);
														}}
													>
														تأكيد
													</Button>
												</DialogActions>
											),
										};
									});
								}}
							>
								<Trash />
								حذف
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
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
							color="primary"
							onPress={() => {
								navigate("./add");
							}}
						>
							<Plus />
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
				<Card title="الصرافات">
					{banks && banks.length > 0 ? (
						<Table columns={columns} rows={banks} />
					) : (
						<EmptyContainer />
					)}
				</Card>
			</div>
		</div>
	);
};

export default BanksPage;
