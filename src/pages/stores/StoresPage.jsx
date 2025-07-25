import React, { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useNavigateWithQuery from "../../hooks/useNavigateWithQuery";
import { getAllStores } from "../../api/serverApi";
import { toast } from "react-toastify";
import TopBar from "../../components/TopBar/TopBar";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Pagination,
	Card,
	CardBody,
	CardHeader,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import { useSearchParams } from "react-router-dom";
import { DotsVertical, Printer, Trash, Edit } from "@mynaui/icons-react";
import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";

const StoresPage = () => {
	//hooks
	const navigate = useNavigateWithQuery();
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	//states
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get("page")) || 1;
	const rowsPerPage = parseInt(searchParams.get("rowsPerPage")) || 5;
	const [pages, setPages] = useState(1);
	const [total, setTotal] = useState("");
	const [modal, setModal] = useState({
		header: "",
		body: "",
		footer: "",
	});
	//queries

	const { data: stores } = useQuery({
		queryKey: ["stores", page - 1, rowsPerPage],
		queryFn: getAllStores,
		select: (res) => {
			return res.data;
		},
		onSuccess: (data) => {
			setPages(Math.ceil(data.total / rowsPerPage));
			setTotal(data.total);
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
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
	//functions
	const onRowsPerPageChange = useCallback(
		(e) => {
			const newRowsPerPage = Number(e.target.value);
			setSearchParams({
				page: "1", // Reset to first page when changing rows per page
				rowsPerPage: newRowsPerPage.toString(),
			});
		},
		[setSearchParams]
	);
	const handlePageChange = (newPage) => {
		setSearchParams({
			page: newPage.toString(),
			rowsPerPage: rowsPerPage.toString(),
		});
	};
	useEffect(() => {
		const urlPage = parseInt(searchParams.get("page")) || 1;
		if (urlPage !== page) {
			// This ensures the pagination component updates when URL changes
			setPages((prev) => prev); // Force re-render if needed
		}
	}, [searchParams, page]);
	return (
		<div className="w-full h-full overflow-auto ">
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{() => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								{modal.header}
							</ModalHeader>
							<ModalBody>{modal.body}</ModalBody>
							<ModalFooter>{modal.footer}</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
			<TopBar
				right={
					<>
						<Button
							color="primary"
							onPress={() => {
								navigate("./add");
							}}
						>
							إضافة
						</Button>
					</>
				}
			/>
			<div className="w-full p-5 pb-16">
				<Card>
					<CardHeader className="bg-primary text-default-50 font-bold text-medium">
						العملاء
					</CardHeader>
					<CardBody>
						{stores && stores.stores.length > 0 ? (
							<Table
								aria-labelledby="table"
								bottomContent={
									<div className="py-2 px-2 flex justify-between items-center">
										<span className="text-default-400 text-small">
											الاجمالي {total} حركة
										</span>
										<Pagination
											isCompact
											showControls
											showShadow
											color="primary"
											page={page}
											total={pages}
											onChange={handlePageChange}
										/>
										<label className="flex items-center text-default-400 text-small">
											النتائج لكل صفحة:
											<select
												className="bg-transparent outline-none text-default-400 text-small"
												onChange={onRowsPerPageChange}
												value={rowsPerPage}
											>
												<option value="5">5</option>
												<option value="10">10</option>
												<option value="15">15</option>
											</select>
										</label>
									</div>
								}
								bottomContentPlacement="outside"
							>
								<TableHeader>
									<TableColumn> المحطة</TableColumn>
									<TableColumn>اسم المستودع</TableColumn>
									<TableColumn>خيارات</TableColumn>
								</TableHeader>
								<TableBody>
									{stores.stores &&
										stores.stores.map((client) => {
											return (
												<TableRow key={client.id}>
													<TableCell>{client.station.name}</TableCell>
													<TableCell>
														{client.name} - {client.substance.name}
													</TableCell>
													<TableCell>
														<div className="relative flex justify-center items-center gap-2">
															<Dropdown>
																<DropdownTrigger>
																	<Button isIconOnly variant="light">
																		<DotsVertical size="40" />
																	</Button>
																</DropdownTrigger>
																<DropdownMenu
																	onAction={(key) => {
																		if (key === "delete") {
																			setModal((prev) => {
																				return {
																					...prev,
																					header: "حذف عميل",
																					body: (
																						<div>
																							هل أنت متأكد من حذف العميل
																							<span
																								style={{
																									fontWeight: "bold",
																									fontSize: "16px",
																									color: "#b33c37",
																								}}
																							>{` ${client.name} `}</span>
																							؟
																						</div>
																					),
																					footer: (
																						<div className=" flex gap-5">
																							<Button
																								onPress={() => {
																									onClose();
																								}}
																								color="warning"
																							>
																								الغاء
																							</Button>
																							<Button
																								color="primary"
																								onPress={() => {
																									deleteMutation.mutate(
																										client.id
																									);
																								}}
																							>
																								تأكيد
																							</Button>
																						</div>
																					),
																				};
																			});
																			onOpen();
																		}
																	}}
																>
																	<DropdownItem
																		key="edit"
																		startContent={<Edit />}
																	>
																		تعديل
																	</DropdownItem>
																</DropdownMenu>
															</Dropdown>
														</div>
													</TableCell>
												</TableRow>
											);
										})}
								</TableBody>
							</Table>
						) : (
							<EmptyContainer />
						)}
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default StoresPage;
