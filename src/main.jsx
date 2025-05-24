import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthContextProvider from "./store/auth-context.jsx";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import App from "./App.jsx";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import { HeroUIProvider } from "@heroui/react";

// Set UK English as default locale for numbers and dates
const ukLocale = "en-GB";
Intl.NumberFormat.defaultLocale = ukLocale;
Intl.DateTimeFormat.defaultLocale = ukLocale;

// Override default Date formatting
Date.prototype.toLocaleDateString = function () {
	return this.toLocaleDateString(ukLocale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			suspense: false,
			refetchOnWindowFocus: false,
			cacheTime: 0,
		},
	},
});
initializeIcons();
ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthContextProvider>
				<FluentProvider theme={webLightTheme} dir="rtl">
					<HeroUIProvider locale="ar">
						<main className="light text-foreground bg-background">
							<App />
						</main>
					</HeroUIProvider>
				</FluentProvider>
				<ToastContainer />
			</AuthContextProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
