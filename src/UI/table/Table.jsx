import React from "react";
import { DataGrid } from "@mui/x-data-grid";
const Table = ({
	rows,
	columns,
	hideFooter,
	checkboxSelection,
	onRowSelectionModelChange,
	pageSize,
	pageSizeModel,
}) => {
	return (
		<DataGrid
			rows={rows}
			autoHeight
			columns={columns}
			initialState={{
				pagination: {
					paginationModel: {
						page: 0,
						pageSize: pageSizeModel ? pageSizeModel : 10,
					},
				},
			}}
			hideFooter={hideFooter ? hideFooter : false}
			checkboxSelection={checkboxSelection ? checkboxSelection : false}
			onRowSelectionModelChange={(ids) => {
				const selectedIDs = new Set(ids);
				const selectedRowData = rows.filter((row) => selectedIDs.has(row.id));

				onRowSelectionModelChange(selectedRowData);
			}}
			sx={{
				fontSize: "18px",
				outline: "none !important",
				maxWidth: "100%",
				"&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
					outline: "none !important",
				},
				".highlight": {
					bgcolor: "rgba(255, 0, 0,.1)",
					"&:hover": {
						bgcolor: "rgba(255, 0, 0,.1)",
					},
				},
				"& .MuiDataGrid-columnHeaderTitle": {
					whiteSpace: "normal",
					lineHeight: "normal",
				},
				"& .MuiDataGrid-columnHeader": {
					// Forced to use important since overriding inline styles
					height: "unset !important",
				},
				"& .MuiDataGrid-columnHeaders": {
					// Forced to use important since overriding inline styles
					maxHeight: "168px !important",
				},
			}}
			pageSizeOptions={pageSize ? pageSize : [5, 10]}
			// checkboxSelection
			disableRowSelectionOnClick
			getRowClassName={(params) => {
				return params.row.isDeleted === 1 ? "highlight" : "";
			}}
		/>
	);
};

export default Table;
