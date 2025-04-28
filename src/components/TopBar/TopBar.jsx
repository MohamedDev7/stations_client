import classes from "./topBar.module.scss";
import PropTypes from "prop-types";
const TopBar = ({ left, right }) => {
	TopBar.propTypes = {
		left: PropTypes.any,
		right: PropTypes.any,
	};
	return (
		<div className={classes.container}>
			<div className={classes.right}>{left}</div>
			<div className={classes.left}>{right}</div>
		</div>
	);
};

export default TopBar;
