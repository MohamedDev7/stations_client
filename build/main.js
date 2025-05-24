const path = require("path");
const contextMenu = require("electron-context-menu");
const {
	app,
	BrowserWindow,
	Menu,
	dialog,
	session,
	ipcMain,
	screen,
} = require("electron");
const isDev = require("electron-is-dev");
const si = require("systeminformation");
const log = require("electron-log");
const { autoUpdater } = require("electron-updater");
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
let motherboardId = null;
let version = app.getVersion();
const { exec } = require("child_process");

function createMainWindow() {
	// Create the browser window.
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;
	const win = new BrowserWindow({
		title: "شركة النفط اليمنية-المهرة",
		width: Math.min(1366, width), // Adjust the width based on screen width
		height: Math.min(600, height), // Adjust the height based on screen height
		// autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: path.join(__dirname, "preload.js"),
			// additionalArguments: ["--force-renderer-accessibility"],
		},
		icon: path.join(__dirname, "../src/assets/logo.png"),
	});
	// win.webContents.on("did-finish-load", () => {
	// 	win.webContents.insertCSS(`
	// 	  input[type="date"] {
	// 		direction: ltr !important;
	// 		text-align: right !important;
	// 	  }
	// 	`);
	// });
	win.maximize();
	const template = [
		// {
		// 	label: "File",
		// 	submenu: [{ role: "quit" }],
		// },
	];
	const menu = Menu.buildFromTemplate(template);

	Menu.setApplicationMenu(menu);
	// session.defaultSession.clearStorageData();
	win.loadURL(
		isDev ? "http://localhost:5173" : `file://${__dirname}/../build/index.html`
	);

	si.uuid()
		.then((data) => {
			motherboardId = data.hardware;
			win.webContents.send("motherboardId", motherboardId);
		})
		.catch((error) => {
			console.error("Error retrieving motherboard information:", error);
		});
}

contextMenu({
	showLearnSpelling: false,
	showLookUpSelection: false,
	showSearchWithGoogle: false,
	showCopyImage: false,
	showCopyLink: false,
	showSelectAll: false,
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createMainWindow();
	autoUpdater.checkForUpdates();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bars to stay active until the user quits
// explicitly with Cmd + Q.
ipcMain.on("open-pdf", (event, filePath) => {
	// Use the shell module to open the PDF file
	let win = new BrowserWindow({
		webPreferences: {
			plugins: true,
		},
	});
	win.loadURL(filePath);
});

ipcMain.handle("getAppVersion", async () => {
	return version;
});
ipcMain.handle("getMotherboardId", async () => {
	return motherboardId;
});
ipcMain.handle("getScannersList", async () => {
	return new Promise((resolve, reject) => {
		exec(
			"naps2.console --listdevices --driver twain",
			(error, stdout, stderr) => {
				if (error) {
					reject(`exec error: ${error}`);
				}
				resolve(stdout.trim().split("\n"));
			}
		);
	});
});
ipcMain.handle("start-scan", () => {
	return new Promise((resolve, reject) => {
		exec("naps2.console -o F:/test.pdf --force", (error, stdout, stderr) => {
			if (error) {
				reject(`exec error: ${error}`);
			}
			resolve(stdout);
		});
	});
});

autoUpdater.on("update-downloaded", (_event, releaseNote, releaseName) => {
	const dialogObj = {
		type: "info",
		buttons: ["إعادة التشغيل", "لاحقاً"],
		title: "تحديث النظام",
		message: process.platform === "win32" ? releaseNote : releaseName,
		detail:
			"تم تنزيل التحديثات بنجاح.الرجاء اعادة تشغيل البرنامج لتتم عملية التثبيت",
	};
	dialog.showMessageBox(dialogObj).then((returnValue) => {
		if (returnValue.response === 0) {
			autoUpdater.quitAndInstall();
		}
	});
});
// autoUpdater.on("download-progress", (progressObj) => {
// 	let log_message = "Download speed: " + progressObj.bytesPerSecond;
// 	log_message = log_message + " - Downloaded " + progressObj.percent + "%";
// 	log_message =
// 		log_message +
// 		" (" +
// 		progressObj.transferred +
// 		"/" +
// 		progressObj.total +
// 		")";
// 	sendStatusToWindow(log_message);
// });
autoUpdater.on("download-progress", (progressObj) => {
	const progress = Math.round(progressObj.percent);
	BrowserWindow.getAllWindows().forEach((win) => {
		win.webContents.send("updateProgress", progress);
	});
});

autoUpdater.on("update-available", (_event, releaseNote, releaseName) => {
	const dialogObj = {
		type: "info",
		buttons: ["حسناً"],
		title: "تحديث النظام",
		message: process.platform === "win32" ? releaseNote : releaseName,
		detail: "يوجد تحديث للنظام.جاري تنزيل التحديثات في الخلفية",
	};
	dialog.showMessageBox(dialogObj, (response) => {});
});
autoUpdater.on("error", (_event, releaseNote, releaseName) => {
	const dialogObj = {
		type: "info",
		buttons: ["حسناً"],
		title: "خطأ",
		message: process.platform === "win32" ? releaseNote : releaseName,
		detail: "حصل خطأ اثناء عملية التحديث.الرجاء المحاولة مرة اخرى",
	};
	dialog.showMessageBox(dialogObj, (response) => {});
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});
