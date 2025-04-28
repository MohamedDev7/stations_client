import classes from "./templateTable.module.scss";
import TableRow from "./TableRow";

const Table = (props) => {
	const checkAllChangeHandler = () => {
		props.checkAllHandler();
	};

	return (
		<table className={`${props.className} ${classes.table}`} id={props.id}>
			<thead>
				<tr>
					{props.checkBox && (
						<th>
							<input
								type="checkBox"
								onChange={checkAllChangeHandler}
								checked={props.checkAll}
							/>
						</th>
					)}

					{props.columns.map((col) => (
						<th key={col.field} style={{ width: `${col.width}` }}>
							{col.headerName}
						</th>
					))}
					{props.actions && <th style={{ width: "120px" }}>خيارات</th>}
				</tr>
			</thead>
			<tbody>
				{props.rows?.map((row) => (
					<TableRow
						key={row.id}
						checkBox={props.checkBox}
						row={row}
						actions={props.actions}
						columns={props.columns}
						onDelete={props.onDelete}
						onEdit={props.onEdit}
						onView={props.onView}
						checked={
							props.selected &&
							props.selected.filter((el) => el._id === row._id).length > 0
								? true
								: false
						}
						onCheckBox={props.onCheckBox}
						onOpenModal={props.onOpenModal}
					/>
				))}
			</tbody>
		</table>
	);
};

export default Table;
