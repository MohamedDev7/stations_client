import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ReportViewer = () => {
	const info = useLocation();

	useEffect(() => {
		// Load the license key first
		Stimulsoft.Base.StiLicense.loadFromFile("stimulsoft/license.key");

		// Create a new report instance
		var report = new Stimulsoft.Report.StiReport();

		// Load the report template
		report.loadFile(`reportsTemplates/${info.state.reportTemplate}.mrt`);

		// Create a DataSet and load the JSON data
		var dataSet = new Stimulsoft.System.Data.DataSet("Demo");
		dataSet.readJson(info.state.data);

		// Clear existing data sources and register the new data
		report.dictionary.databases.clear();
		report.regData(dataSet.dataSetName, dataSet.dataSetName, dataSet);

		// Render the report asynchronously
		report.renderAsync(() => {
			// Create a viewer instance
			var viewer = new Stimulsoft.Viewer.StiViewer(null, "StiViewer", false);

			// Set viewer options
			viewer.options.appearance.rightToLeft = true;
			viewer.options.appearance.scrollbarsMode = true;
			viewer.options.toolbar.viewMode = 1;
			viewer.options.toolbar.showAboutButton = false;
			viewer.options.toolbar.showFullScreenButton = false;
			viewer.options.toolbar.showOpenButton = false;

			// Assign the report to the viewer
			viewer.report = report;

			// Render the viewer in the specified div
			viewer.renderHtml("viewer");
		});
	}, [info.state.reportTemplate, info.state.data]);

	return <div id="viewer"></div>;
};

export default ReportViewer;
