const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    title: '停车场中控系统',
    icon: path.join(__dirname, '../public/icon.png'),
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const menuTemplate = [
    {
      label: '系统',
      submenu: [
        {
          label: '锁定屏幕',
          accelerator: 'Ctrl+L',
          click: () => {
            mainWindow.webContents.send('lock-screen');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '操作',
      submenu: [
        {
          label: '开闸',
          accelerator: 'Ctrl+O',
          click: () => {
            mainWindow.webContents.send('open-gate');
          }
        },
        {
          label: '关闸',
          accelerator: 'Ctrl+C',
          click: () => {
            mainWindow.webContents.send('close-gate');
          }
        },
        { type: 'separator' },
        {
          label: '抓拍',
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.send('capture');
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '全屏切换',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        {
          label: '刷新',
          accelerator: 'Ctrl+R',
          click: () => {
            mainWindow.webContents.reload();
          }
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            mainWindow.webContents.send('show-about');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5199');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

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

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
