import { useNavigate, useLocation } from "react-router-dom";

const useNavigateWithQuery = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (path, options = {}) => {
		const currentQuery = location.search;
		const separator = path.includes("?") ? "&" : "?";
		const fullPath = `${path}${
			currentQuery ? separator + currentQuery.slice(1) : ""
		}`;
		navigate(fullPath, options);
	};
};

export default useNavigateWithQuery;
