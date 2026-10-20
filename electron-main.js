const { app, BrowserWindow } = require('electron');
const path = require('path');

function createStudioWindow() {
  const win = new BrowserWindow({
    width: 1460,
    height: 920,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#0b0e14',
    title: 'SonicRange Pro — Аудіометрія для звукорежисерів',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createStudioWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createStudioWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
