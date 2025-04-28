const timeChanger = (time) => {
	const [hours, minutes, seconds] = time.split(":");
	let hours12 = hours % 12 || 12;
	const period = hours < 12 ? "صباحاً" : "مساءاً";
	const time12 = `${hours12}:${minutes} ${period}`;
	return time12;
};
export default timeChanger;
