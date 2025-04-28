import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
const ReportViewer = () => {
	const info = useLocation();

	useEffect(() => {
		var viewer = new Stimulsoft.Viewer.StiViewer(null, "StiViewer", false);
		Stimulsoft.Base.StiLicense.loadFromFile("stimulsoft/license.key");

		viewer.options.appearance.rightToLeft = true;
		viewer.options.appearance.scrollbarsMode = true;
		viewer.options.toolbar.viewMode = 1;
		viewer.options.toolbar.showAboutButton = false;
		viewer.options.toolbar.showFullScreenButton = false;
		viewer.options.toolbar.showOpenButton = false;

		var report = new Stimulsoft.Report.StiReport();
		report.loadFile(`reportsTemplates/${info.state.reportTemplate}.mrt`);

		var dataSet = new Stimulsoft.System.Data.DataSet("Demo");
		dataSet.readJson(info.state.data);
		report.dictionary.databases.clear();
		// Assign the data source to the report
		report.regData("Demo", "Demo", dataSet);
		viewer.report = report;
		viewer.renderHtml("viewer");
	}, []);

	return <div className="w-full h-full overflow-auto " id="viewer"></div>;
};
export default ReportViewer;
