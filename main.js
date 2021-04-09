const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater');
const path = require('path')

const iconPath = process.platform !== 'darwin'
    ? 'src/assets/icons/icon.ico'
    : 'src/assets/icons/icon.icns';

function createWindow () {
    const win = new BrowserWindow({
      width: 1150,
      height: 800,
      resizable: false,
      icon: path.join(iconPath),
      
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    })
  
    win.loadFile('src/index.html')
    win.webContents.openDevTools()
    win.setMenuBarVisibility(false)

    win.once('ready-to-show', () => {
      autoUpdater.checkForUpdatesAndNotify();
    });
  }
  
  app.whenReady().then(createWindow)
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });

  autoUpdater.on('update-available', () => {
    win.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update_downloaded');
  });

  ipcMain.on('restart_app_update', () => {
    autoUpdater.quitAndInstall();
  });