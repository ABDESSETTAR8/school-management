const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

// The live web app (shared Supabase cloud database). Override with APP_URL if
// you rename the Netlify site or use a custom domain.
const APP_URL = process.env.APP_URL || "https://schoolmanagementwebappp.netlify.app";

let mainWindow;
let splash;

function load() {
  if (mainWindow) mainWindow.loadURL(APP_URL);
}

function createSplash() {
  splash = new BrowserWindow({
    width: 380,
    height: 300,
    frame: false,
    resizable: false,
    center: true,
    backgroundColor: "#0f172a",
    show: true,
  });
  splash.loadFile(path.join(__dirname, "splash.html"));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: "Scholar — School Management",
    backgroundColor: "#0f172a",
    autoHideMenuBar: true,
    show: false, // shown once the app has loaded
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: { contextIsolation: true },
  });

  load();

  // Swap the splash for the real window once the page is ready.
  mainWindow.once("ready-to-show", () => {
    if (splash) {
      splash.destroy();
      splash = null;
    }
    mainWindow.show();
  });

  // Open external links (WhatsApp/SMS/Telegram, etc.) in the system default app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Auto-retry if the page fails to load (e.g. brief connection drop).
  mainWindow.webContents.on("did-fail-load", (_e, code, _desc, _url, isMainFrame) => {
    if (isMainFrame && code !== -3) setTimeout(load, 3000);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function buildMenu() {
  const template = [
    {
      label: "App",
      submenu: [
        { label: "Reload", accelerator: "CmdOrCtrl+R", click: load },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    { role: "editMenu" },
    {
      label: "View",
      submenu: [
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createSplash();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
