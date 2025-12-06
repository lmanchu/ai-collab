/**
 * Tandem Desktop - Electron Main Process
 * Integrates backend server and frontend UI into a single desktop app
 */

const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess;
let currentWorkspacePath = null;

// Backend server port
const BACKEND_PORT = 3000;
const FRONTEND_PORT = 5173;

// Determine if running in development mode
const isDev = process.env.NODE_ENV === 'development';

// Store path for persisting workspace
const Store = require('electron-store');
const store = new Store();

/**
 * Open folder dialog and set workspace
 */
async function openFolder() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Workspace Folder',
    buttonLabel: 'Open Workspace'
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    console.log(`Selected workspace: ${folderPath}`);

    // Save to store
    store.set('lastWorkspacePath', folderPath);
    currentWorkspacePath = folderPath;

    // Notify backend to change workspace
    await setBackendWorkspace(folderPath);

    // Notify frontend to refresh
    if (mainWindow) {
      mainWindow.webContents.send('workspace:changed', folderPath);
    }

    return folderPath;
  }

  return null;
}

/**
 * Set backend workspace via HTTP API
 */
async function setBackendWorkspace(workspacePath) {
  try {
    const response = await fetch(`http://localhost:${BACKEND_PORT}/api/workspace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: workspacePath })
    });

    if (response.ok) {
      console.log(`Backend workspace set to: ${workspacePath}`);
    } else {
      console.error('Failed to set backend workspace');
    }
  } catch (error) {
    console.error('Error setting backend workspace:', error);
  }
}

/**
 * Start backend server
 */
function startBackend(workspacePath = null) {
  console.log('Starting Tandem backend server...');

  // In production, backend is in Resources/backend
  // In development, backend is in ../backend
  const backendPath = isDev
    ? path.join(__dirname, '../backend')
    : path.join(process.resourcesPath, 'backend');

  console.log(`Backend path: ${backendPath}`);

  // Set workspace path (either passed in or from store)
  const workspace = workspacePath || store.get('lastWorkspacePath');
  if (workspace) {
    console.log(`Using workspace: ${workspace}`);
    currentWorkspacePath = workspace;
  }

  backendProcess = spawn('node', ['src/index.js'], {
    cwd: backendPath,
    env: {
      ...process.env,
      PORT: BACKEND_PORT,
      REPO_PATH: workspace || path.join(backendPath, 'workspace')
    }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data.toString().trim()}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

/**
 * Create main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'default', // Use default title bar so users can drag the window
    title: 'Tandem - Work in tandem with AI',
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Disable for local file loading
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load frontend
  if (isDev) {
    // Development: Load from Vite dev server
    mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from Resources/frontend/dist
    const indexPath = path.join(process.resourcesPath, 'frontend/dist/index.html');
    console.log(`Loading frontend from: ${indexPath}`);
    mainWindow.loadFile(indexPath);

    // Open DevTools in production for debugging
    mainWindow.webContents.openDevTools();
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Send workspace path to frontend when ready
  mainWindow.webContents.on('did-finish-load', () => {
    if (currentWorkspacePath) {
      mainWindow.webContents.send('workspace:changed', currentWorkspacePath);
    }
  });
}

/**
 * Create application menu
 */
function createMenu() {
  const template = [
    {
      label: 'Tandem',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            await openFolder();
          }
        },
        { type: 'separator' },
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu:new-file');
          }
        },
        { type: 'separator' },
        {
          label: 'Sync to All',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu:sync');
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/lmanchu/tandem');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * IPC Handlers
 */
ipcMain.handle('workspace:get', () => {
  return currentWorkspacePath;
});

ipcMain.handle('workspace:open', async () => {
  return await openFolder();
});

/**
 * App lifecycle
 */
app.whenReady().then(() => {
  // Start backend server
  startBackend();

  // Wait a bit for backend to start
  setTimeout(() => {
    createWindow();
    createMenu();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Kill backend process
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
