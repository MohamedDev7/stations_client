import React, { useEffect, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";

import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Checkbox,
	Table,
	TableBody,
	TableHeader,
	TableRow,
	TableColumn,
	TableCell,
} from "@heroui/react";
import { useMutation, useQuery } from "react-query";
import { addClient, getAllStations } from "@/api/serverApi";
import useNavigateWithQuery from "../../hooks/useNavigateWithQuery";
import { toast } from "react-toastify";

import { X, Save } from "@mynaui/icons-react";
import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";
const ClientFormPage = () => {
	//hooks
	const navigate = useNavigateWithQuery();
	//states
	const [name, setName] = useState("");
	const [selectedStations, setSelectedStations] = useState([]);

	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});

	// const { data: substances } = useQuery({
	// 	queryKey: ["substances"],
	// 	queryFn: getAllSubstances,
	// 	select: (res) => {
	// 		return res.data.substances;
	// 	},
	// });
	const addMutation = useMutation({
		mutationFn: addClient,
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
	// const editMutation = useMutation({
	// 	mutationFn: updateBank,
	// 	onSuccess: (res) => {
	// 		toast.success("تم التعديل بنجاح", {
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
	//functions
	const handleStationsCheckboxChange = (station) => {
		const index = selectedStations.findIndex(
			(el) => el.station_id === station.id
		);

		if (index === -1) {
			// Station is checked, add it with default values
			setSelectedStations([
				...selectedStations,
				{
					station_id: station.id,
					hasStore: false,
					allowCredit: false,
					selectedSubstances: [],
					stores: [],
				},
			]);
		} else {
			// Station is unchecked, remove it completely
			const updatedStations = [...selectedStations];
			updatedStations.splice(index, 1);
			setSelectedStations(updatedStations);
		}
	};
	const updateStationProperty = (stationId, property, value) => {
		setSelectedStations((prev) =>
			prev.map((station) =>
				station.station_id === stationId
					? { ...station, [property]: value }
					: station
			)
		);
	};
	return (
		<div className="w-full h-full overflow-auto">
			<form
				onSubmit={(e) => {
					e.stopPropagation();

					addMutation.mutate({
						name,
						stations: selectedStations,
					});
				}}
			>
				<TopBar
					right={
						<>
							<Button
								color="warning"
								onPress={() => navigate("./..")}
								disabled={addMutation.isLoading}
							>
								<X />
								الغاء
							</Button>
							<Button
								color="primary"
								type="submit"
								disabled={addMutation.isLoading}
							>
								<Save />
								حفظ
							</Button>
							<Button color="primary" onPress={() => {}}>
								<Save />
								test
							</Button>
						</>
					}
				/>
				<div className="w-full p-5 pb-16">
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							بيانات العميل
						</CardHeader>
						<CardBody>
							<div className="flex gap-4">
								<Input
									label="اسم العميل"
									className="max-w-md"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>
						</CardBody>
					</Card>
					<Card>
						<CardHeader className="bg-primary text-default-50 font-bold text-medium">
							المحطات
						</CardHeader>
						<CardBody>
							<div className="flex flex-col gap-10">
								{stations && stations.length > 0 ? (
									stations.map((station) => {
										const selectedStation = selectedStations.find(
											(el) => el.station_id === station.id
										);
										const isStationSelected = !!selectedStation;

										return (
											<div
												key={station.id}
												className="p-5 flex flex-col border-b-4 border-primary-200"
											>
												{/* Main Station Checkbox */}
												<Checkbox
													isSelected={isStationSelected}
													aria-label="checkbox"
													onChange={() => handleStationsCheckboxChange(station)}
													className="font-bold"
												>
													{station.name}
												</Checkbox>
												{/* secondary Station Checkbox */}
												{isStationSelected && (
													<div className="flex p-4 gap-3">
														<Checkbox
															isSelected={selectedStation?.allowCredit}
															aria-label="checkbox"
															onChange={() =>
																updateStationProperty(
																	station.id,
																	"allowCredit",
																	!selectedStation?.allowCredit
																)
															}
														>
															بيع آجل
														</Checkbox>
													</div>
												)}
											</div>
										);
									})
								) : (
									<EmptyContainer msg="لا توجد بيانات" />
								)}
							</div>
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	);
};

export default ClientFormPage;
