export const getPrevDate = (date) => {
	const currDate = new Date(date);
	const previousDay = new Date(currDate);
	previousDay.setDate(currDate.getDate() - 1);
	return previousDay.toISOString().split("T")[0];
};
