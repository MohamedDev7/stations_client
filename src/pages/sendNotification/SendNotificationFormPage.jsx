import React, { useRef, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { getAllUsers, sendNotifications } from "../../api/serverApi";
import useNavigateWithQuery from "./../../hooks/useNavigateWithQuery";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { X, Send } from "@mynaui/icons-react";
import {
	Button,
	Card,
	CardHeader,
	CardBody,
	Textarea,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Input,
} from "@heroui/react";

const SendNotificationFormPage = () => {
	//hooks
	const navigate = useNavigateWithQuery();
	const inputRef = useRef(null);
	//states
	const [msg, setMsg] = useState("");
	const [recipients, setRecipients] = useState(new Set());
	const [file, setFile] = useState(null);

	//queries
	const { data: users } = useQuery({
		queryKey: ["users"],
		queryFn: getAllUsers,
		select: (res) => {
			console.log(`res`, res);
			return res.data.users;
		},
	});

	const sendMutation = useMutation({
		mutationFn: sendNotifications,
		onSuccess: (res) => {
			toast.success("تم  ارسال التنبيه بنجاح", {
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
	//functions

	const handleButtonClick = () => {
		if (inputRef.current) inputRef.current.click();
	};

	const handleFileChange = (e) => {
		if (e.target.files.length > 0) {
			setFile(e.target.files[0]);
		} else {
			setFile(null);
		}
	};
	return (
		<div className="w-full h-full overflow-auto">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const formData = new FormData();
					formData.append("msg", msg);
					formData.append("recipients", JSON.stringify(Array.from(recipients)));
					if (file) {
						formData.append("file", file);
					}

					sendMutation.mutate(formData);
				}}
			>
				<TopBar
					right={
						<>
							<Button
								color="warning"
								onPress={() => navigate("./..")}
								disabled={sendMutation.isLoading}
							>
								<X />
								الغاء
							</Button>
							<Button
								color="primary"
								type="submit"
								isDisabled={sendMutation.isLoading}
							>
								<Send />
								ارسال
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							بيانات التنبيه
						</CardHeader>
						<CardBody>
							<Row flex={[2, 1]}>
								<Textarea
									label="نص الرسالة"
									value={msg}
									onChange={(e) => setMsg(e.target.value)}
								/>
								<></>
							</Row>
							<div style={{ position: "relative", width: 300 }}>
								{/* Hidden native file input */}
								<input
									type="file"
									accept="image/*,application/pdf"
									onChange={handleFileChange}
									ref={inputRef}
									name="file"
									style={{ display: "none" }}
								/>

								{/* Fake input field to show selected filename */}
								<input
									type="text"
									readOnly
									value={file ? file.name : ""}
									placeholder="اختر ملف"
									onClick={handleButtonClick}
									style={{
										width: "100%",
										paddingRight: 80,
										height: 40,
										boxSizing: "border-box",
										border: "1px solid #ccc",
										borderRadius: 4,
									}}
								/>

								{/* Button inside the input */}
								<button
									type="button"
									onClick={handleButtonClick}
									style={{
										position: "absolute",
										top: "50%",
										right: 0,
										transform: "translateY(-50%)",
										height: 36,
										padding: "0 12px",
										border: "none",
										backgroundColor: "#3b82f6", // Tailwind blue-500
										color: "white",
										cursor: "pointer",
										borderTopLeftRadius: 0,
										borderBottomLeftRadius: 0,
										borderTopRightRadius: 4,
										borderBottomRightRadius: 4,
									}}
								>
									اختيار
								</button>
							</div>
						</CardBody>
					</Card>
					{users && users.length > 0 && (
						<Card>
							<CardHeader className="bg-primary text-default-50 font-bold text-medium">
								المستلمين
							</CardHeader>
							<CardBody>
								<div className="w-[300px]">
									<Table
										aria-labelledby="table"
										selectionMode="multiple"
										selectedKeys={recipients}
										onSelectionChange={(keys) => {
											if (typeof keys === "string" && keys === "all") {
												setRecipients(
													new Set(users.map((user) => `${user.id}`))
												);
											} else {
												setRecipients(new Set(keys));
											}
										}}
									>
										<TableHeader>
											<TableColumn>الاسم</TableColumn>
										</TableHeader>
										<TableBody>
											{users.map((user) => (
												<TableRow key={user.id}>
													<TableCell>
														{user.first_name} {user.last_name}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</CardBody>
						</Card>
					)}
				</div>
			</form>
		</div>
	);
};

export default SendNotificationFormPage;
