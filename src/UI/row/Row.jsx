import classes from "./row.module.scss";
import PropTypes from "prop-types";

const Row = ({ children, className, flex }) => {
	Row.propTypes = {
		children: PropTypes.any,
		className: PropTypes.any,
		flex: PropTypes.any,
	};
	let content = [];
	if (children.length > 0) {
		content = children.map((el, i) => (
			<div key={i} style={{ flex: flex[i] }}>
				{el}
			</div>
		));
	} else {
		content = children;
	}
	return (
		<div className={` ${classes.row}`}>
			<div className={`${classes.content} ${className}`}>{content}</div>
		</div>
	);
};

export default Row;
