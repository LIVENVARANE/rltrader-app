const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path')

let win;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const iconPath = process.platform !== 'darwin'
    ? 'src/assets/icons/icon.ico'
    : 'src/assets/icons/icon.icns';

function createWindow() {
  win = new BrowserWindow({
    width: 1150,
    height: 800,
    resizable: false,
    icon: path.join(iconPath),
    frame: false,
        
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  //win.webContents.openDevTools();
  win.setMenuBarVisibility(false);

  win.once('ready-to-show', () => {
    autoUpdater.autoDownload = false;
    autoUpdater.checkForUpdates();
  });
}

  app.on('ready', () => {
    createWindow();
    win.loadFile('src/loading.html');
    setTimeout(function(){ 
      
      win.loadFile('src/index.html');
  }, 2000);  
  })
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  })


  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });

  ipcMain.on('close_app', () => {
    app.quit();
  });

  ipcMain.on('minimize_app', () => {
    win.minimize();
  });

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for updates...');
  })

  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('An update is available! Downloading..');
    autoUpdater.downloadUpdate();
  })

  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('RLTrader is up to date.');
  })

  autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
  })

  autoUpdater.on('update-downloaded', () => {
    sendStatusToWindow('Update downloaded, restarting..');
    autoUpdater.quitAndInstall();
  });

  function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
  }