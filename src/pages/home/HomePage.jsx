import { getOverview } from "@/api/serverApi";
import EmptyContainer from "@/components/EmptyContainer/EmptyContainer";
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Divider,
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Spinner,
} from "@heroui/react";
import { toast } from "react-toastify";
import React from "react";
import { useQuery } from "react-query";

const HomePage = () => {
	//hooks
	//states
	//queries
	const { data: stations, isLoading } = useQuery({
		queryKey: ["stations"],
		queryFn: getOverview,
		select: (res) => {
			res.data.stations.forEach((station) => {
				const groupedSubstances = Object.values(
					station.stores.reduce((acc, curr) => {
						const substanceId = curr["store.substance.id"];
						if (!acc[substanceId]) {
							acc[substanceId] = {
								substance_id: substanceId,
								substance_name: curr["store.substance.name"],
								total: 0,
							};
						}
						acc[substanceId].total += curr.curr_value;

						return acc;
					}, {})
				);
				const groupedTanks = Object.values(
					station.tanks.reduce((acc, curr) => {
						const substanceId = curr["substance_id"];

						if (!acc[substanceId]) {
							acc[substanceId] = {
								substance_id: substanceId,
								capacity: 0,
							};
						}
						acc[substanceId].capacity += curr.capacity;
						return acc;
					}, {})
				);
				station.stock = groupedSubstances;
				station.capacity = groupedTanks;
			});
			console.log(`res.data.stations`, res.data.stations);
			return res.data.stations;
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	return (
		<div className="w-full p-10 h-full overflow-auto bg-slate-600 grid grid-cols-4  gap-x-8 gap-y-4  grid-flow-row auto-rows-min">
			{!isLoading ? (
				stations && stations.length > 0 ? (
					stations.map((station) => (
						<Card
							key={station.number}
							className={
								`border-5 border-solid ` +
								(station.isUpToDate ? `border-transparent` : `border-red-700`)
							}
						>
							<CardHeader className="block">
								<div className="flex gap-3 ">
									<div className="p-4 border-2 rounded-md text-4xl font-bold ">
										{station["station.number"]}
									</div>
									<div className="flex flex-col gap-3 ">
										<h4>{station["station.name"]}</h4>{" "}
										<div className="flex gap-2 flex-col">
											{station.stock.map((stock, i) => {
												const capacity = station.capacity.filter(
													(ele) => ele.substance_id === stock.substance_id
												)[0].capacity;

												const percentage = (stock.total / capacity) * 100;
												const progress = (percentage / 100) * 200;
												return (
													<div className="flex gap-2" key={i}>
														<h4>{stock.substance_name}</h4>
														<svg
															width={200}
															height={25}
															style={{
																border: "1px solid #ddd",
																borderRadius: "5px",
															}}
														>
															{/* Full background of the progress bar */}
															<rect
																x="0"
																y="0"
																width={200} // Full width of the progress bar (200px)
																height={25} // Full height of the progress bar (50px)
																fill="white"
																// Full green color for the bar (background)
																rx="5" // Rounded corners
															/>
															{/* Foreground representing the filled part from right to left */}
															<rect
																x={200 - progress} // Start the fill from the right side
																y="0"
																width={progress} // Width of the fill based on the percentage
																height={25}
																fill="#4caf50" // White color for the filled portion
																rx="5" // Rounded corners
															/>
															{/* Display percentage text centered in the whole space */}
															<text
																x="50%" // Position the text at the center horizontally (whole space)
																y="50%" // Position the text at the center vertically
																alignmentBaseline="middle" // Vertically center the text
																textAnchor="middle" // Horizontally center the text
																fill="black" // Black text color for contrast
																fontSize="18" // Font size for the percentage text
																fontWeight="bold" // Make the text bold
															>
																{Math.round(percentage)}%
															</text>
														</svg>
													</div>
												);
											})}
										</div>
									</div>
								</div>
							</CardHeader>
							<Divider />
							<CardBody>
								<Table aria-label removeWrapper>
									<TableHeader>
										<TableColumn>المخزن</TableColumn>
										<TableColumn>الكمية (لتر)</TableColumn>
									</TableHeader>
									<TableBody>
										{station.stores &&
											station.stores.map((store) => (
												<TableRow key={store.id}>
													<TableCell>{`${store["store.name"]}-${store["store.substance.name"]}`}</TableCell>
													<TableCell>
														{new Intl.NumberFormat("en-US").format(
															store.curr_value
														)}
													</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</CardBody>
							<Divider />
							<CardFooter>
								<p>
									آخر حركة:
									<span className="font-bold">
										{station?.date?.replaceAll("-", "/")} م
									</span>
								</p>
							</CardFooter>
						</Card>
					))
				) : (
					<EmptyContainer />
				)
			) : (
				<Spinner size="lg" className="absolute top-1/2 right-1/2" />
			)}
		</div>
	);
};

export default HomePage;
