import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { serverApi } from "./../api/axios";
export const AuthContext = createContext({
	currUser: "",
	stations: [],
	permissions: {},
	version: null,
	updateProgress: null,
	login: () => {},
	logout: () => {},
});

const AuthContextProvider = ({ children }) => {
	AuthContextProvider.propTypes = {
		children: PropTypes.any,
	};
	const [currUser, setCurrUser] = useState(
		JSON.parse(localStorage.getItem("user")) || null
	);
	const [permissions, setPermissions] = useState(
		JSON.parse(localStorage.getItem("permissions")) || null
	);
	const [stations, setStations] = useState(
		JSON.parse(localStorage.getItem("stations")) || null
	);
	const [version, setVersion] = useState(
		JSON.parse(localStorage.getItem("version")) || null
	);
	const [deviceId, setDeviceId] = useState(null);
	const [updateProgress, setUpdateProgress] = useState(null);

	// Function to update version in both state and localStorage
	const updateVersion = (newVersion) => {
		setVersion(newVersion);
		localStorage.setItem("version", JSON.stringify(newVersion));
	};

	useEffect(() => {
		// Get motherboard ID
		window.electron
			.getMotherboardId()
			.then((data) => {
				setDeviceId(data);
			})
			.catch((error) => console.error("Error getting motherboard ID:", error));

		// Get app version
		window.electron
			.getAppVersion()
			.then((data) => {
				updateVersion(data);
			})
			.catch((error) => console.error("Error getting app version:", error));

		// Set up event listeners for changes
		window.electron.onMotherboardId((event, data) => {
			setDeviceId(data);
		});

		window.electron.onAppVersion((event, data) => {
			updateVersion(data);
		});

		// Handle update progress and logout
		if (window.electron?.onUpdateProgress) {
			window.electron.onUpdateProgress((percent) => {
				setUpdateProgress(percent);
				logout();
			});
		}

		// Cleanup listeners when the component unmounts
		return () => {
			window.electron.removeListeners();
		};
	}, []);

	useEffect(() => {
		localStorage.setItem("user", JSON.stringify(currUser));
		localStorage.setItem("permissions", JSON.stringify(permissions));
		localStorage.setItem("stations", JSON.stringify(stations));
	}, [currUser, permissions, stations]);

	const login = async (data) => {
		const res = await serverApi.post(
			// "http://3.235.213.140:8060/api/v1/auth/login",
			"http://localhost:8060/api/v1/auth/login",
			// "http://192.168.2.200:8050/api/v1/auth/login",
			// "https://pixalloy.com/edt/api/v1/auth/login",
			{ ...data, deviceId }
			// {
			// 	withCredentials: true,
			// 	headers: {
			// 		crossDomain: true,
			// 		"Content-Type": "application/json",
			// 	},
			// }
		);
		localStorage.setItem("token", JSON.stringify(res.data.token));
		setCurrUser(res.data.user);
		setPermissions(res.data.permissions);
		setStations(res.data.stations);
		serverApi.defaults.headers.common["Authorization"] = `Bearer ${JSON.parse(
			localStorage.getItem("token")
		)}`;
	};
	const logout = () => {
		setCurrUser(null);
		setPermissions(null);
		setStations(null);
		localStorage.setItem("token", null);
	};
	const value = {
		currUser,
		permissions,
		stations,
		version,
		updateProgress,
		login,
		logout,
	};
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContextProvider;
