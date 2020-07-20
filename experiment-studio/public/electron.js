const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const { ipcMain } = require('electron')

const path = require('path');
const isDev = require('electron-is-dev');

const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
        nodeIntegration: true
    },
    titleBarStyle: 'hidden'
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  // if (isDev) {
  //   // Open the DevTools.
  //   //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
  //   mainWindow.webContents.openDevTools();
  // }
  mainWindow.on('closed', () => mainWindow = null);

}

// retransmit it to workerWindow
ipcMain.on("printPDF", () => {
    mainWindow.webContents.printToPDF({}).then(data => {
      fs.writeFile('/Users/Thomas/test.pdf', data, (error) => {
      if (error) throw error
      console.log('Write PDF successfully.')
    })
    });
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
