import React, { useEffect, useState } from "react";

const AppVersionDisplay = () => {
	const [version, setVersion] = useState("");

	useEffect(() => {
		const fetchVersion = async () => {
			if (window.electron?.getAppVersion) {
				const ver = await window.electron.getAppVersion();
				setVersion(ver);
			}
		};
		fetchVersion();
	}, []);

	return (
		<div className="text-center text-gray-700 mt-4 text-sm">
			نسخة البرنامج: <span className="font-bold">{version}</span>
		</div>
	);
};

export default AppVersionDisplay;
