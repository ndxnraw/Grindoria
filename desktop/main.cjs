const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { installFullscreen } = require('./fullscreen.cjs');
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({ width: 1440, height: 960, minWidth: 960, minHeight: 640, autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  installFullscreen(mainWindow, ipcMain);
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  mainWindow.loadFile(path.join(__dirname, '../dist/Grindoria.html'));
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
