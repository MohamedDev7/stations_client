import axios from "axios";

// Create axios instance with base configuration
export const serverApi = axios.create({
	// baseURL: "http://3.235.213.140:8060/api/v1/",
	baseURL: "http://localhost:8060/api/v1/",
	// baseURL: "http://192.168.2.200:8050/api/v1/",
	// baseURL: "https://pixalloy.com/edt/api/v1/",
});

// Add request interceptor to ensure headers are always current
serverApi.interceptors.request.use(
	(config) => {
		// Get the latest version from localStorage
		const version = JSON.parse(localStorage.getItem("version"));
		const token = JSON.parse(localStorage.getItem("token"));

		// Set headers for each request
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		if (version) {
			config.headers.AppVersion = version;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);
