import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DismissRegular, SaveRegular } from "@fluentui/react-icons";
import TopBar from "../../components/TopBar/TopBar";
import { Button, Card, Field, Input } from "@fluentui/react-components";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import {
	addSubstance,
	changeSubstancePrice,
	editSubstance,
	getSubstance,
} from "../../api/serverApi";
const SubstancePriceChangeFromPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [name, setName] = useState("");
	const [prevPrice, setPrevPrice] = useState("");
	const [newPrice, setNewPrice] = useState("");
	const [date, setDate] = useState("");

	//queries
	useQuery({
		queryKey: ["substance", info.state?.id],
		queryFn: getSubstance,
		onSuccess: (res) => {
			setName(res.data.substance.name);
			setPrevPrice(res.data.substance.prev_price);
		},
		enabled: !!info.state,
	});
	const saveMutation = useMutation({
		mutationFn: changeSubstancePrice,
		onSuccess: (res) => {
			toast.success("تم تعديل السعر بنجاح", {
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
	// const editMutation = useMutation({
	// 	mutationFn: editSubstance,
	// 	onSuccess: (res) => {
	// 		toast.success("تم تعديل المادة بنجاح", {
	// 			position: "top-center",
	// 		});
	// 		navigate("./..", {});
	// 	},
	// 	onError: (err) => {
	// 		toast.error(err.response.data.message, {
	// 			position: "top-center",
	// 		});
	// 	},
	// });
	return (
		<div className="w-full h-full overflow-auto ">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					saveMutation.mutate({
						name,
						prevPrice,
						newPrice,
						date,
						substance_id: info.state.id,
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
						<Row flex={[2, 1, 1, 1]}>
							<Field label="اسم المادة" required>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									readOnly
									disabled
								/>
							</Field>
							<Field label="السعر السابق">
								<Input
									value={prevPrice}
									type="number"
									disabled={info.state ? true : false}
								/>
							</Field>
							<Field label="السعر الحالي" required>
								<Input
									value={newPrice}
									type="number"
									onChange={(e) => setNewPrice(e.target.value)}
								/>
							</Field>
							<Field label="تاريخ البدء" required>
								<Input
									value={date}
									type="date"
									onChange={(e) => setDate(e.target.value)}
								/>
							</Field>
						</Row>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default SubstancePriceChangeFromPage;
