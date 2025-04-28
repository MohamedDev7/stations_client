import classes from "./card.module.scss";
import PropTypes from "prop-types";

const Card = ({ children, className, title, width, backgroundColor }) => {
	Card.propTypes = {
		children: PropTypes.any,
		className: PropTypes.any,
		title: PropTypes.any,
		width: PropTypes.any,
		backgroundColor: PropTypes.any,
	};
	return (
		<div
			className={`${classes.card} ${className}`}
			style={{ width: width, backgroundColor: backgroundColor }}
		>
			{title && <div className={classes.title}>{title}</div>}
			<div className={classes.content}>{children}</div>
		</div>
	);
};

export default Card;
