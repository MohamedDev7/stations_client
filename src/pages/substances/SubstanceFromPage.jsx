import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DismissRegular, SaveRegular } from "@fluentui/react-icons";
import TopBar from "../../components/TopBar/TopBar";
import { Button, Card, Field, Input } from "@fluentui/react-components";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import { addSubstance, editSubstance, getSubstance } from "../../api/serverApi";
const SubstanceFromPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");

	//queries
	useQuery({
		queryKey: ["substance", info.state?.id],
		queryFn: getSubstance,
		onSuccess: (res) => {
			setName(res.data.substance.name);
			setPrice(res.data.substance.price);
		},
		enabled: !!info.state,
	});
	const saveMutation = useMutation({
		mutationFn: addSubstance,
		onSuccess: (res) => {
			toast.success("تم إضافة المادة بنجاح", {
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
	const editMutation = useMutation({
		mutationFn: editSubstance,
		onSuccess: (res) => {
			toast.success("تم تعديل المادة بنجاح", {
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
	return (
		<div className="w-full h-full overflow-auto ">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					info.state
						? editMutation.mutate({
								name,
								id: info.state.id,
						  })
						: saveMutation.mutate({
								name,
								price,
						  });
				}}
			>
				<TopBar
					right={
						<>
							<Button
								appearance="secondary"
								icon={<DismissRegular />}
								onClick={() => {
									navigate("./..");
								}}
							>
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
					<Card title="بيانات المادة">
						<Row flex={[2, 1, 3]}>
							<Field label="اسم المادة" required>
								<Input value={name} onChange={(e) => setName(e.target.value)} />
							</Field>
							<Field label="السعر" required>
								<Input
									value={price}
									type="number"
									disabled={info.state ? true : false}
									onChange={(e) => setPrice(e.target.value)}
								/>
							</Field>
							<></>
						</Row>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default SubstanceFromPage;
