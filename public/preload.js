const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electron", {
	startScan: () => ipcRenderer.invoke("start-scan"),
	getMotherboardId: () => ipcRenderer.invoke("getMotherboardId"),
	getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
	getScannersList: () => ipcRenderer.invoke("getScannersList"),
	onMotherboardId: (callback) => ipcRenderer.on("motherboardId", callback),
	onAppVersion: (callback) => ipcRenderer.on("appVersion", callback),
	onScannersList: (callback) => ipcRenderer.on("scannersList", callback),
	onUpdateProgress: (callback) =>
		ipcRenderer.on("updateProgress", (_event, progress) => {
			callback(progress);
		}),
	removeListeners: () => {
		ipcRenderer.removeAllListeners("motherboardId");
		ipcRenderer.removeAllListeners("appVersion");
		ipcRenderer.removeAllListeners("scannersList");
		ipcRenderer.removeAllListeners("updateProgress");
	},
});
