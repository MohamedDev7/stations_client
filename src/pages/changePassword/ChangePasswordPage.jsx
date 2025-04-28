import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import { Field, Input } from "@fluentui/react-components";
import { SaveRegular } from "@fluentui/react-icons";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { editPassword } from "../../api/serverApi";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, Checkbox } from "@heroui/react";
const ChangePasswordPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();

	//states
	const [old, setOld] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	//queries
	const editMutation = useMutation({
		mutationFn: editPassword,
		onSuccess: (res) => {
			toast.success("تم تعديل كلمة المرور بنجاح", {
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

	return (
		<div className="w-full h-full overflow-auto ">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (password !== confirmPassword) {
						toast.error("كلمة المرور غير متطابقة", {
							position: "top-center",
						});
						return;
					}
					editMutation.mutate({
						old,
						password,
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
							<Row flex={[1, 5]}>
								<Field label="كلمة المرور القديمة" required>
									<Input
										value={old}
										onChange={(e) => setOld(e.target.value)}
										type="password"
									/>
								</Field>
								<></>
							</Row>
							<Row flex={[1, 5]}>
								<Field label="كلمة المرور الجديدة" required>
									<Input
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										type="password"
									/>
								</Field>
								<></>
							</Row>
							<Row flex={[1, 5]}>
								<Field label="تأكيد كلمة المرور" required>
									<Input
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										type="password"
									/>
								</Field>
								<></>
							</Row>
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default ChangePasswordPage;
