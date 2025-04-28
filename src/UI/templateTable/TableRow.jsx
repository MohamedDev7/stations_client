import React from "react";
import classes from "./tableRow.module.scss";
import TableActions from "../../components/TableActions/TableActions";

const TableRow = (props) => {
	const checkBoxChangeHandler = () => {
		props.onCheckBox(props.row, props.checked);
	};

	return (
		<tr className={`${props.row.status === "deleted" ? classes.deleted : ""}`}>
			{props.checkBox && (
				<td>
					<input
						type="checkBox"
						onChange={checkBoxChangeHandler}
						checked={props.checked}
					/>
				</td>
			)}

			{props.columns.map((col) => (
				<td key={col.field}>
					<div
						style={{
							whiteSpace: "nowrap",
							textOverflow: "ellipsis",
							overflow: "hidden",
						}}
					>
						{props.row[col.field]}
					</div>
				</td>
			))}
			{props.actions && (
				<td>
					<TableActions
						onDelete={
							props.onDelete ? props.onDelete.bind(this, props.row) : null
						}
						onEdit={props.onEdit ? props.onEdit.bind(this, props.row) : null}
						onView={props.onView ? props.onView.bind(this, props.row) : null}
						actions={props.actions}
						status={props.row.status}
					/>
				</td>
			)}
		</tr>
	);
};

export default TableRow;
