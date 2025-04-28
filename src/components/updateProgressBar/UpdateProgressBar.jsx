import React from "react";

const UpdateProgressBar = ({ progress }) => {
	return (
		<div className="w-full max-w-md mx-auto mt-10">
			<h2 className="text-lg text-center mb-2 font-semibold text-gray-700">
				جاري تحميل التحديث: {progress}%
			</h2>
			<div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden shadow-md">
				<div
					className="h-full bg-blue-500 transition-all duration-500"
					style={{
						width: `${progress}%`,
						minWidth: progress === 0 ? "0.1px" : "0",
					}}
				></div>
			</div>
		</div>
	);
};

export default UpdateProgressBar;
