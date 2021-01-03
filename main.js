const { app, BrowserWindow } = require('electron')

function createWindow () {
    const win = new BrowserWindow({
      width: 1150,
      height: 800,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    })
  
    
    win.loadFile('src/index.html')
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