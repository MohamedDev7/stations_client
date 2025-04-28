import React from "react";
import { Icon } from "@fluentui/react/lib/Icon";
const EmptyContainer = ({ msg }) => {
	return (
		<div
			style={{
				padding: "20px",
				textAlign: "center",
				fontSize: "18px",
				fontWeight: "bold",
				display: "flex",
				gap: "5px",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<p>{msg ? msg : "لا توجد بيانات"}</p>
			<Icon
				iconName="error"
				style={{ fontSize: "30px", fontWeight: "bold", paddingTop: "5px" }}
			/>
		</div>
	);
};

export default EmptyContainer;
