const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "AI Health Tracker",
    autoHideMenuBar: true, // Hides the top menu bar for a clean look
    icon: path.join(__dirname, 'public', 'app-icon.ico'), // Your custom icon!
    webPreferences: {
      nodeIntegration: true,
    }
  });
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});