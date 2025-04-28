import React, { useEffect, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import { Button } from "@fluentui/react-components";
import { SaveRegular } from "@fluentui/react-icons";
// import Card from "../../UI/card/Card";
import { Card, CardBody, CardHeader, Input } from "@heroui/react";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { addBank, getBank, updateBank } from "../../api/serverApi";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { Select, SelectItem } from "@heroui/react";
export const animals = [
	{ key: "cat", label: "Cat" },
	{ key: "dog", label: "Dog" },
	{ key: "elephant", label: "Elephant" },
	{ key: "lion", label: "Lion" },
	{ key: "tiger", label: "Tiger" },
	{ key: "giraffe", label: "Giraffe" },
	{ key: "dolphin", label: "Dolphin" },
	{ key: "penguin", label: "Penguin" },
	{ key: "zebra", label: "Zebra" },
	{ key: "shark", label: "Shark" },
	{ key: "whale", label: "Whale" },
	{ key: "otter", label: "Otter" },
	{ key: "crocodile", label: "Crocodile" },
];
const BankFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [name, setName] = useState("");
	//queries
	const addMutation = useMutation({
		mutationFn: addBank,
		onSuccess: (res) => {
			toast.success("تمت الاضافة بنجاح", {
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
		mutationFn: updateBank,
		onSuccess: (res) => {
			toast.success("تم التعديل بنجاح", {
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
	useEffect(() => {
		if (info.state) {
			setName(info.state.name);
		}
	}, []);
	return (
		<div className="w-full h-full overflow-auto ">
			<form
				onSubmit={(e) => {
					e.stopPropagation();
					info.state
						? editMutation.mutate({
								name,
								id: info.state.id,
						  })
						: addMutation.mutate({ name });
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
					<Card>
						<CardHeader className="flex gap-3">بيانات الصرافة</CardHeader>
						<CardBody>
							<div className="flex gap-4">
								<Input
									label="اسم الصرافة"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>
						</CardBody>
					</Card>
					{/* <Card title="بيانات الصرافة"></Card> */}
				</div>
			</form>
		</div>
	);
};

export default BankFormPage;
