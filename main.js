const { app, BrowserWindow } = require('electron')
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
        enableRemoteModule: true
      }
    })
  
    win.loadFile('src/index.html')
    win.webContents.openDevTools()
    win.setMenuBarVisibility(false)
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