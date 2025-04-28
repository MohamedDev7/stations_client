import { Button, useRestoreFocusTarget } from "@fluentui/react-components";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { Dropdown } from "@fluentui/react/lib/Dropdown";

import { getAllStations } from "../../api/serverApi";
import Card from "../../UI/card/Card";

const Filters = ({ options, onChange }) => {
	//hooks
	const restoreFocusTargetAttribute = useRestoreFocusTarget();
	// //states
	// const [station, setStation] = useState();
	// //queries
	// const { data: stations } = useQuery({
	// 	queryKey: ["stations"],
	// 	queryFn: getAllStations,
	// 	select: (res) => {
	// 		return res.data.stations.map((el) => el);
	// 	},
	// });
	return (
		// <Card title="تصفية">
		<div style={{ display: "flex", gap: "15px", alignItems: "flex-end" }}>
			<Dropdown
				// onChange={(e, selection) => {
				// 	setStation(selection.key);
				// }}
				required
				label="اسم المحطة"
				multiSelect
				placeholder="اختر المحطة"
				style={{ minWidth: "250px" }}
				options={options}
				onChange={onChange}
			/>
			<Button
				appearance="primary"
				// icon={<ViewDesktopFilled />}
				// disabled={params.row.state === "approved" ? false : true}
				size="medium"
				{...restoreFocusTargetAttribute}
				type="submit"
				// disabled={isLoading}
			>
				تطبيق
			</Button>
		</div>
		// </Card>
	);
};

export default Filters;
