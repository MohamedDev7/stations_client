import { serverApi } from "./axios";
//Stations API
export const addStation = async (data) => {
	const res = await serverApi.post("/stations", data);
	return res;
};
export const getAllStations = async () => {
	const res = await serverApi.get("/stations");
	return res;
};
export const deleteStation = async (id) => {
	const res = await serverApi.delete(`/stations/${id}`);
	return res;
};
// export const getStation = async (data) => {
// 	const res = await serverApi.get(`/stations/${data.queryKey[1]}`);
// 	return res;
// };
// export const editStation = async (data) => {
// 	const res = await serverApi.patch(`/stations/${data.id}`, data);
// 	return res;
// };

//Income API

export const getAllIncomes = async (data) => {
	const res = await serverApi.get(
		`/income?page=${data.queryKey[1]}&limit=${data.queryKey[2]}`
	);
	return res;
};
export const getIncomesByMovmentIdAndShiftId = async (data) => {
	const res = await serverApi.get(
		`/income/movment/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
export const addIncome = async (data) => {
	const res = await serverApi.post("/income", data);
	return res;
};
export const deleteIncome = async (id) => {
	const res = await serverApi.delete(`/income/${id}`);
	return res;
};
export const getIncome = async (data) => {
	const res = await serverApi.get(`/income/${data.queryKey[1]}`);
	return res;
};
export const editIncome = async (data) => {
	const res = await serverApi.patch(`/income/${data.id}`, data);
	return res;
};
//calibrations API
export const getAllCalibrationsReports = async () => {
	const res = await serverApi.get("/calibration");
	return res;
};
export const getCalibrationsByMovmentIdAndShiftId = async (data) => {
	const res = await serverApi.get(
		`/calibration/movment/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
export const addCalibration = async (data) => {
	const res = await serverApi.post("/calibration", data);
	return res;
};
export const deleteCalibrationReport = async (id) => {
	const res = await serverApi.delete(`/calibration/${id}`);
	return res;
};
export const getCalibration = async (data) => {
	const res = await serverApi.get(`/calibration/${data.queryKey[1]}`);
	return res;
};
export const editCalibration = async (data) => {
	const res = await serverApi.patch(`/calibration/${data.id}`, data);
	return res;
};
//surplus API
export const getAllSurpluses = async (data) => {
	const res = await serverApi.get(
		`/surplus?page=${data.queryKey[1]}&limit=${data.queryKey[2]}`
	);
	return res;
};
export const getSurplusesByMovmentIdAndShiftId = async (data) => {
	const res = await serverApi.get(
		`/surplus/movment/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
export const addSurplus = async (data) => {
	const res = await serverApi.post("/surplus", data);
	return res;
};
export const deleteSurplus = async (id) => {
	const res = await serverApi.delete(`/surplus/${id}`);
	return res;
};
export const getSurplus = async (data) => {
	const res = await serverApi.get(`/surplus/${data.queryKey[1]}`);
	return res;
};
export const editSurplus = async (data) => {
	const res = await serverApi.patch(`/surplus/${data.id}`, data);
	return res;
};
//Movments API
export const getAllMovments = async (data) => {
	const res = await serverApi.get(
		`/movments?page=${data.queryKey[1]}&limit=${data.queryKey[2]}&filters=${data.queryKey[3]}`
	);
	return res;
};
export const getStationMovment = async (data) => {
	const res = await serverApi.get(
		`/movments/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
export const getStationMovmentByDate = async (data) => {
	const res = await serverApi.get(
		`/movments/station/date/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
export const getStationPendingMovment = async (data) => {
	const res = await serverApi.get(
		`/movments/pending/station/${data.queryKey[1]}`
	);
	return res;
};
export const addMovment = async (data) => {
	const res = await serverApi.post(`/movments`, data);
	return res;
};
export const addShiftMovment = async (data) => {
	const res = await serverApi.post(`/movments/shift`, data);
	return res;
};
export const editShiftMovment = async (data) => {
	const res = await serverApi.patch(`/movments/shift`, data);
	return res;
};
export const deleteMovment = async (id) => {
	const res = await serverApi.delete(`/movments/${id}`);
	return res;
};
export const getMovmentData = async (data) => {
	const res = await serverApi.get(`/movments/report/${data.queryKey[1]}`);
	return res;
};

export const getShiftData = async (data) => {
	const res = await serverApi.get(
		`shifts/movment/shift/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
export const changeMovmentState = async (data) => {
	const res = await serverApi.post(`/movments/state/${data.movment_id}`, data);
	return res;
};

//Dispensers API
export const getDispensersMovmentByMovmentIdAndShiftId = async (data) => {
	const res = await serverApi.get(
		`/dispensers/movments/shifts/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
export const getAllDispensers = async () => {
	const res = await serverApi.get(`/dispensers`);
	return res;
};
export const getDispensersByStationId = async (data) => {
	const res = await serverApi.get(`/dispensers/station/${data.queryKey[1]}`);
	return res;
};
export const changeDispenserState = async (data) => {
	const res = await serverApi.patch(`/dispensers/state/${data.id}`, data);
	return res;
};
export const addDispenser = async (data) => {
	const res = await serverApi.post(`/dispensers`, data);
	return res;
};
//Tanks API
export const getTanksByStationId = async (data) => {
	const res = await serverApi.get(`/tanks/station/${data.queryKey[1]}`);
	return res;
};

//Shifts API
export const getShiftsByStationId = async (data) => {
	const res = await serverApi.get(`/shifts/station/${data.queryKey[1]}`);
	return res;
};
export const getMovmentsShiftsByMovmentId = async (data) => {
	const res = await serverApi.get(`/shifts/movment/${data.queryKey[1]}`);
	return res;
};
export const getLastShiftIdByMovmentId = async (data) => {
	const res = await serverApi.get(`/shifts/last/movment/${data.queryKey[1]}`);
	return res;
};
export const deleteShiftBYMovmentIdAndShiftId = async (data) => {
	const res = await serverApi.delete(
		`/shifts/movment/shift/${data.movment_id}/${data.shift_id}`
	);
	return res;
};
//Stores API
export const getStoreByStationId = async (data) => {
	const res = await serverApi.get(`/stores/station/${data.queryKey[1]}`);
	return res;
};
export const getAllStores = async () => {
	const res = await serverApi.get(`/stores`);
	return res;
};
export const getStoresMovmentByMovmentIdAndShiftId = async (data) => {
	const res = await serverApi.get(
		`/stores/movments/shifts/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
//Substances API
export const addSubstance = async (data) => {
	const res = await serverApi.post("/substances", data);
	return res;
};
export const getAllSubstances = async () => {
	const res = await serverApi.get("/substances");
	return res;
};
export const deleteSubstance = async (id) => {
	const res = await serverApi.delete(`/substances/${id}`);
	return res;
};
export const getSubstance = async (data) => {
	const res = await serverApi.get(`/substances/${data.queryKey[1]}`);
	return res;
};
export const getSubstancesPricesByDate = async (data) => {
	const res = await serverApi.get(`/substances/date/${data.queryKey[1]}`);
	return res;
};
export const editSubstance = async (data) => {
	const res = await serverApi.patch(`/substances/${data.id}`, data);
	return res;
};
export const changeSubstancePrice = async (data) => {
	const res = await serverApi.post(`/substances/${data.substance_id}`, data);
	return res;
};
export const getSubstancesStocksByMovmentIdAndShiftId = async (data) => {
	const res = await serverApi.get(
		`/substances/substancesStocks?movmentId=${data.queryKey[1]}&shiftId=${data.queryKey[2]}&substanceIds=${data.queryKey[3]}`
	);
	return res;
};
export const getSubstancePriceMovment = async (data) => {
	const res = await serverApi.get(
		`/substances/price?date=${data.queryKey[1]}&substanceIds=${data.queryKey[2]}`
	);
	return res;
};
//Employees API
export const addEmployee = async (data) => {
	const res = await serverApi.post("/employees", data);
	return res;
};
export const getAllEmployees = async () => {
	const res = await serverApi.get("/employees");
	return res;
};
export const deleteEmployee = async (id) => {
	const res = await serverApi.delete(`/employees/${id}`);
	return res;
};
export const getEmployee = async (data) => {
	const res = await serverApi.get(`/employees/${data.queryKey[1]}`);
	return res;
};
export const getEmployeeByStationId = async (data) => {
	const res = await serverApi.get(`/employees/station/${data.queryKey[1]}`);
	return res;
};
export const editEmployee = async (data) => {
	const res = await serverApi.patch(`/employees/${data.id}`, data);
	return res;
};
//Users API
export const addUser = async (data) => {
	const res = await serverApi.post("/users", data);
	return res;
};
export const getAllUsers = async () => {
	const res = await serverApi.get("/users");
	return res;
};
export const getUser = async (data) => {
	const res = await serverApi.get(`/users/${data.queryKey[1]}`);
	return res;
};
export const getUsername = async (data) => {
	const res = await serverApi.get(`/users/username/${data.queryKey[1]}`);
	return res;
};
export const editUser = async (data) => {
	const res = await serverApi.patch(`/users/${data.id}`, data);
	return res;
};
export const deleteUser = async (id) => {
	const res = await serverApi.delete(`/users/${id}`);
	return res;
};
//password API
export const editPassword = async (data) => {
	const res = await serverApi.post(`/users/password`, data);
	return res;
};
export const editPasswordByAdmin = async (id) => {
	const res = await serverApi.get(`/users/passwordByAdmin/${id}`);
	return res;
};
//Stocktaking API
export const addStocktaking = async (data) => {
	const res = await serverApi.post("/stocktaking", data);
	return res;
};
export const getStocktakingByMovmentId = async (data) => {
	const res = await serverApi.get(`/stocktaking/movment/${data.queryKey[1]}`);
	return res;
};
export const getStocktakingId = async (data) => {
	const res = await serverApi.get(`/stocktaking/${data.queryKey[1]}`);
	return res;
};
export const getAllStocktaking = async (data) => {
	const res = await serverApi.get(
		`/stocktaking?page=${data.queryKey[1]}&limit=${data.queryKey[2]}`
	);
	return res;
};
export const deleteStocktaking = async (id) => {
	const res = await serverApi.delete(`/stocktaking/${id}`);
	return res;
};
//receives API
export const getAllReceives = async (data) => {
	const res = await serverApi.get(
		`/receives?page=${data.queryKey[1]}&limit=${data.queryKey[2]}`
	);
	return res;
};
export const getReceive = async (data) => {
	const res = await serverApi.get(`/receives/${data.queryKey[1]}`);
	return res;
};
export const addReceive = async (data) => {
	const res = await serverApi.post("/receives", data);
	return res;
};
export const updateReceive = async (data) => {
	const res = await serverApi.patch(`/receives/${data.id}`, data);
	return res;
};
export const deleteReceive = async (id) => {
	const res = await serverApi.delete(`/receives/${id}`);
	return res;
};
//deposits API
export const getAllDeposits = async (data) => {
	const res = await serverApi.get(
		`/deposits?page=${data.queryKey[1]}&limit=${data.queryKey[2]}`
	);
	return res;
};
export const getDeposit = async (data) => {
	const res = await serverApi.get(`/deposits/${data.queryKey[1]}`);
	return res;
};
export const addDeposit = async (data) => {
	const res = await serverApi.post("/deposits", data);
	return res;
};
export const updateDeposit = async (data) => {
	const res = await serverApi.patch(`/deposits/${data.id}`, data);
	return res;
};
export const deleteDeposit = async (id) => {
	const res = await serverApi.delete(`/deposits/${id}`);
	return res;
};
//banks API
export const getAllBanks = async () => {
	const res = await serverApi.get("/banks");
	return res;
};
export const getBank = async (id) => {
	const res = await serverApi.get(`/banks/${id}`);
	return res;
};
export const addBank = async (data) => {
	const res = await serverApi.post("/banks", data);
	return res;
};
export const updateBank = async (data) => {
	const res = await serverApi.patch(`/banks/${data.id}`, data);
	return res;
};
export const deleteBank = async (id) => {
	const res = await serverApi.delete(`/banks/${id}`);
	return res;
};
//Credit Sales API
export const getAllCreditSales = async (data) => {
	const res = await serverApi.get(
		`/creditSales?page=${data.queryKey[1]}&limit=${data.queryKey[2]}`
	);
	return res;
};
// export const getBank = async (id) => {
// 	const res = await serverApi.get(`/banks/${id}`);
// 	return res;
// };
// export const addBank = async (data) => {
// 	const res = await serverApi.post("/banks", data);
// 	return res;
// };
// export const updateBank = async (data) => {
// 	const res = await serverApi.patch(`/banks/${data.id}`, data);
// 	return res;
// };
// export const deleteBank = async (id) => {
// 	const res = await serverApi.delete(`/banks/${id}`);
// 	return res;
// };
//reports API
export const getStoresMovmentReport = async (data) => {
	const res = await serverApi.get(
		`/reports/storesMovment?startDate=${data.queryKey[1]}&endDate=${data.queryKey[2]}&station=${data.queryKey[3]}&substance=${data.queryKey[4]}`
	);
	return res;
};
export const getEmployeeAccountStatementReport = async (data) => {
	const res = await serverApi.get(
		`/reports/accountStatement/employee/?startDate=${data.queryKey[1]}&endDate=${data.queryKey[2]}&station=${data.queryKey[3]}&employee=${data.queryKey[4]}`
	);
	return res;
};
export const getBoxAccountStatementReport = async (data) => {
	const res = await serverApi.get(
		`/reports/accountStatement/box/?startDate=${data.queryKey[1]}&endDate=${data.queryKey[2]}&station=${data.queryKey[3]}`
	);
	return res;
};
export const getCreditSalesStatementReport = async (data) => {
	const res = await serverApi.get(
		`/reports/creditSales/?startDate=${data.queryKey[1]}&endDate=${data.queryKey[2]}&station=${data.queryKey[3]}&station=${data.queryKey[4]}`
	);
	return res;
};
export const getStationAccountStatementReport = async (data) => {
	const res = await serverApi.get(
		`/reports/accountStatement/station/?startDate=${data.queryKey[1]}&endDate=${data.queryKey[2]}&station=${data.queryKey[3]}`
	);
	return res;
};
export const getStoresMovmentSummaryReport = async (data) => {
	const res = await serverApi.get(
		`/reports/storesMovmentSummary?startDate=${data.queryKey[1]}&endDate=${data.queryKey[2]}&station=${data.queryKey[3]}&stores=${data.queryKey[4]}`
	);
	return res;
};
export const getIncomesMovmentReport = async (data) => {
	const res = await serverApi.get(
		`/reports/incomesMovment?startDate=${data.queryKey[1]}&endDate=${data.queryKey[2]}&station=${data.queryKey[3]}&stores=${data.queryKey[4]}`
	);
	return res;
};
export const getDispensersMovmentReport = async (data) => {
	const res = await serverApi.get(
		`/reports/DispensersMovment?startDate=${data.queryKey[1]}&endDate=${data.queryKey[2]}&station=${data.queryKey[3]}`
	);
	return res;
};
export const getDepositsMovmentReport = async (data) => {
	const res = await serverApi.get(
		`/reports/depositsMovment?startDate=${data.queryKey[1]}&endDate=${data.queryKey[2]}&station=${data.queryKey[3]}&type=${data.queryKey[4]}`
	);
	return res;
};
export const getCalibrationReport = async (data) => {
	const res = await serverApi.get(`/reports/calibration/${data.queryKey[1]}`);
	return res;
};
export const getStocktakingPriceReport = async (data) => {
	const res = await serverApi.get(
		`/reports/StocktakingPrice/${data.queryKey[1]}`
	);
	return res;
};
export const getOverview = async () => {
	const res = await serverApi.get(`/reports/overview`);
	return res;
};
