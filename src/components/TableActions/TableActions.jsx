import classes from "./tableActions.module.scss";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import PrintIcon from "@mui/icons-material/Print";
import PropTypes from "prop-types";

const TableActions = ({
	actions,
	onView,
	onEdit,
	onDelete,
	onPrint,
	onRestore,
}) => {
	TableActions.protoType = {
		actions: PropTypes.any,
		onView: PropTypes.any,
		onEdit: PropTypes.any,
		onDelete: PropTypes.any,
		onPrint: PropTypes.any,
		onRestore: PropTypes.any,
	};
	return (
		<div className={classes.actions}>
			{actions.includes("view") && (
				<div onClick={onView}>
					<VisibilityIcon />
					عرض
				</div>
			)}
			{actions.includes("edit") && (
				<div onClick={onEdit}>
					<ModeEditOutlineOutlinedIcon sx={{ width: 15, height: 15 }} />
					تعديل
				</div>
			)}
			{actions.includes("delete") && (
				<div onClick={onDelete}>
					<DeleteOutlineOutlinedIcon sx={{ width: 15, height: 15 }} />
					حذف
				</div>
			)}
			{actions.includes("restore") && (
				<div onClick={onRestore}>
					<RefreshOutlinedIcon sx={{ width: 15, height: 15 }} />
					استعادة
				</div>
			)}

			{actions.includes("print") && (
				<div onClick={onPrint}>
					<PrintIcon />
					طباعة
				</div>
			)}
		</div>
	);
};

export default TableActions;
