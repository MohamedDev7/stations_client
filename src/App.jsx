import { useContext } from "react";
import Navbar from "./components/navbar/Navbar";
import SideBar from "./components/sideBar/SideBar";
import LoginPage from "./pages/login/LoginPage";
import PropTypes from "prop-types";
import {
	createHashRouter,
	RouterProvider,
	Outlet,
	Navigate,
} from "react-router-dom";
import { AuthContext } from "./store/auth-context";
import HomePage from "./pages/home/HomePage";
import UsersPage from "./pages/users/UsersPage";
import UserFormPage from "./pages/users/UserFormPage";
import StationsPage from "./pages/stations/stationsPage";
import StationFormPage from "./pages/stations/StationFormPage";
import SubstanceFromPage from "./pages/substances/SubstanceFromPage";
import SubstancesPage from "./pages/substances/SubstancesPage";
import DailyMovments from "./pages/dailyMovment/DailyMovments";
import DailyMovmentForm from "./pages/dailyMovment/DailyMovmentForm";
import IncomesPage from "./pages/income/IncomesPage";
import IncomePageForm from "./pages/income/IncomePageForm";
import ShiftForm from "./pages/dailyMovment/ShiftForm";
import DailyReport from "./templates/dailyReport/DailyReport";
import ConfirmMovmentPage from "./pages/dailyMovment/ConfirmMovmentPage";
import ReportViewer from "./reports/ReportViewer";
import EditShiftForm from "./pages/dailyMovment/EditShiftForm";
import SubstancePriceChangeFromPage from "./pages/substances/SubstancePriceChangeFromPage";
import StoresPage from "./pages/stores/StoresPage";
import StoreFormPage from "./pages/stores/StoreFormPage";
import DispensersPage from "./pages/dispensers/DispensersPage";
import DispenserFormPage from "./pages/dispensers/DispenserFormPage";
import StoresMovmentReport from "./pages/reports/StoresMovmentReport";
import DispensersMovmentReport from "./pages/reports/DispensersMovmentReport";
import EmployeesPage from "./pages/employees/EmployeesPage";
import EmployeesFormPage from "./pages/employees/EmployeesFormPage";
import CalibrationsPage from "./pages/calibration/calibrationsPage";
import CalibrationFormPage from "./pages/calibration/calibrationsFormPage";
import SurplusesPage from "./pages/surplus/SurplusPage";
import SurplusFormPage from "./pages/surplus/SurplusFormPage";
import StoresMovmentSummaryReport from "./pages/reports/StoresMovmentSummaryReport";
import ReceivesPage from "./pages/receives/ReceivesPage";
import CreditSalesPage from "./pages/creditSales/CreditSalesPage";
import SettleCreditSaleFormPage from "./pages/creditSales/SettleCreditSaleFormPage";
import ReceiveFormPage from "./pages/receives/ReceiveFormPage";
import DepositsPage from "./pages/deposits/DepositsPage";
import DepositFormPage from "./pages/deposits/DepositFormPage";
import AccountStatement from "./pages/reports/AccountStatement";
import BanksPage from "./pages/banks/BanksPage";
import BankFormPage from "./pages/banks/bankFormPage";
import IncomesReportPage from "./pages/reports/IncomesReportPage";
import DepositsMovmentReport from "./pages/reports/DepositsMovmentReport";
import ChangePasswordPage from "./pages/changePassword/ChangePasswordPage";
import StocktakingForm from "./pages/stocktaking/StocktakingForm";
import Stocktakings from "./pages/stocktaking/Stocktakings";
import CreditSalesReport from "./pages/reports/CreditSalesReport";

function App() {
	const { currUser } = useContext(AuthContext);
	const ProtectedRoute = ({ children }) => {
		ProtectedRoute.propTypes = { children: PropTypes.any };
		if (!currUser) {
			return <Navigate to="/login" />;
		}
		return children;
	};
	const RedirectLogedinUser = ({ children }) => {
		RedirectLogedinUser.propTypes = { children: PropTypes.any };
		if (currUser) {
			return <Navigate to="/" />;
		}
		return children;
	};
	const Layout = () => {
		return (
			<div style={{ height: "100vh", overflow: "hidden" }}>
				<Navbar />
				<div
					style={{
						overflow: "hidden",
						height: "100%",
						// paddingBottom: "120px",
						display: "flex",
						justifyContent: "center",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Outlet />
				</div>
			</div>
		);
	};
	// const Layout = () => {
	// 	return (
	// 		<div
	// 			style={{
	// 				flex: 1,
	// 				display: "flex",
	// 				flexDirection: "column",
	// 				position: "relative",
	// 			}}
	// 		>
	// 			<MenuBar />
	// 			<div style={{ overflow: "auto", padding: "0 15px" }}>
	// 				<Outlet />
	// 			</div>
	// 		</div>
	// 	);
	// };

	const router = createHashRouter([
		{
			path: "login",
			element: (
				<RedirectLogedinUser>
					<LoginPage />
				</RedirectLogedinUser>
			),
		},
		{
			path: "/",
			element: (
				<ProtectedRoute>
					<Layout />
				</ProtectedRoute>
			),
			children: [
				{
					path: "/",
					element: <Navigate to="/home" />,
				},
				{
					path: "home",
					element: <HomePage />,
				},
				{
					path: "substances",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <SubstancesPage />,
						},
						{
							path: "add",
							element: <SubstanceFromPage />,
						},
						{
							path: "edit",
							element: <SubstanceFromPage />,
						},
						{
							path: "priceChange",
							element: <SubstancePriceChangeFromPage />,
						},
					],
				},
				{
					path: "stations",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <StationsPage />,
						},
						{
							path: "add",
							element: <StationFormPage />,
						},
						{
							path: "edit",
							element: <StationFormPage />,
						},
					],
				},
				{
					path: "stores",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <StoresPage />,
						},
						{
							path: "add",
							element: <StoreFormPage />,
						},
					],
				},
				{
					path: "dispensers",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <DispensersPage />,
						},
						{
							path: "add",
							element: <DispenserFormPage />,
						},
					],
				},
				{
					path: "Stocktaking",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <Stocktakings />,
						},
						{
							path: "add",
							element: <StocktakingForm />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "Stocktaking",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <Stocktakings />,
						},
						{
							path: "add",
							element: <StocktakingForm />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "income",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <IncomesPage />,
						},
						{
							path: "add",
							element: <IncomePageForm />,
						},
						{
							path: "edit",
							element: <IncomePageForm />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "calibrations",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <CalibrationsPage />,
						},
						{
							path: "add",
							element: <CalibrationFormPage />,
						},
						{
							path: "edit",
							element: <CalibrationFormPage />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "surplus",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <SurplusesPage />,
						},
						{
							path: "add",
							element: <SurplusFormPage />,
						},
						{
							path: "edit",
							element: <SurplusFormPage />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "dailyMovment",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <DailyMovments />,
						},
						{
							path: "addMovment",
							element: <DailyMovmentForm />,
						},
						{
							path: "addShift",
							element: <ShiftForm />,
						},
						{
							path: "confirm",
							element: <ConfirmMovmentPage />,
						},
						{
							path: "edit",
							element: <DailyMovmentForm />,
						},
						{
							path: "editShift",
							element: <EditShiftForm />,
						},
						{
							path: "view",
							element: <DailyReport />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "users",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <UsersPage />,
						},
						{
							path: "add",
							element: <UserFormPage />,
						},
						{
							path: "edit",
							element: <UserFormPage />,
						},
					],
				},
				{
					path: "employees",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <EmployeesPage />,
						},
						{
							path: "add",
							element: <EmployeesFormPage />,
						},
						{
							path: "edit",
							element: <EmployeesFormPage />,
						},
					],
				},
				{
					path: "receives",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <ReceivesPage />,
						},
						{
							path: "add",
							element: <ReceiveFormPage />,
						},
						{
							path: "edit",
							element: <ReceiveFormPage />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "creditSales",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <CreditSalesPage />,
						},
						{
							path: "add",
							element: <SettleCreditSaleFormPage />,
						},
						{
							path: "edit",
							element: <SettleCreditSaleFormPage />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "creditSalesReport",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <CreditSalesReport />,
						},
						{
							path: "print",
							element: <CreditSalesReport />,
						},
					],
				},
				{
					path: "deposits",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <DepositsPage />,
						},
						{
							path: "add",
							element: <DepositFormPage />,
						},
						{
							path: "edit",
							element: <DepositFormPage />,
						},
					],
				},
				{
					path: "banks",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <BanksPage />,
						},
						{
							path: "add",
							element: <BankFormPage />,
						},
						{
							path: "edit",
							element: <BankFormPage />,
						},
					],
				},
				{
					path: "storesMovmentReport",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <StoresMovmentReport />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "incomesReport",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <IncomesReportPage />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "storesMovmentSummaryReport",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <StoresMovmentSummaryReport />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "dispensersMovmentReport",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <DispensersMovmentReport />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "depositsReport",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <DepositsMovmentReport />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "accountStatements",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <AccountStatement />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "changePassword",
					element: <ChangePasswordPage />,
				},
			],
		},
	]);
	return <RouterProvider router={router} />;
}

export default App;
