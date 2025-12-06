# Tandem Desktop - Electron App

桌面版 Tandem，使用 Electron 打包成 macOS、Windows、Linux 應用程式。

## 🚀 開發模式

### 啟動開發環境

```bash
# 安裝所有依賴（backend + frontend + electron）
npm install

# 啟動開發模式（同時啟動 backend、frontend、electron）
npm run dev
```

開發模式會：
1. 啟動 backend server (port 3000)
2. 啟動 frontend Vite dev server (port 5173)
3. 啟動 Electron app 視窗

### 單獨啟動各部分

```bash
# 只啟動 backend
npm run dev:backend

# 只啟動 frontend
npm run dev:frontend

# 只啟動 Electron（需要 backend 和 frontend 已在運行）
npm run dev:electron
```

## 📦 打包應用程式

### 打包為可執行檔

```bash
# 只打包不壓縮（測試用）
npm run pack

# 完整打包（產生安裝檔）
npm run dist

# 只打包 macOS 版本
npm run dist:mac

# 只打包 Windows 版本（在 Mac 上需要 wine）
npm run dist:win

# 同時打包 macOS 和 Windows
npm run dist:all
```

### 打包輸出

打包後的檔案會在 `dist-electron/` 目錄：

**macOS**:
- `Tandem-1.0.0.dmg` - 安裝包
- `Tandem-1.0.0-mac.zip` - 壓縮檔

**Windows**:
- `Tandem Setup 1.0.0.exe` - 安裝程式
- `Tandem 1.0.0.exe` - 便攜版（免安裝）

## 🎨 自訂應用程式

### 修改應用程式資訊

編輯 `package.json`:

```json
{
  "name": "tandem-desktop",
  "version": "1.0.0",
  "description": "你的描述",
  "author": "你的名字"
}
```

### 修改視窗大小

編輯 `electron/main.js` 中的 `createWindow()` 函數：

```javascript
mainWindow = new BrowserWindow({
  width: 1400,    // 寬度
  height: 900,    // 高度
  minWidth: 1000, // 最小寬度
  minHeight: 600  // 最小高度
});
```

### 添加應用程式圖示

1. 準備 1024x1024 的 PNG 圖示
2. 轉換為不同格式：
   - macOS: `icon.icns`
   - Windows: `icon.ico`
3. 放到 `electron/assets/` 目錄
4. 重新打包

詳見 `electron/assets/README.md`

## 🔧 技術架構

```
Tandem Desktop App
├── Electron Main Process
│   ├── 啟動 Node.js backend server
│   ├── 建立應用程式視窗
│   └── 處理系統選單和快捷鍵
│
├── Backend (Hono API)
│   ├── Git-backed file storage
│   └── REST API endpoints
│
└── Frontend (React + Vite)
    └── UI components
```

## 📋 系統需求

### 開發環境
- Node.js 20+
- npm 10+
- macOS / Windows / Linux

### 使用者系統需求
- **macOS**: macOS 10.13 (High Sierra) 或更新
- **Windows**: Windows 10 或更新
- **Linux**: 大部分主流發行版

## 🎯 使用方式

安裝後：

1. **macOS**: 從 Applications 資料夾啟動 Tandem
2. **Windows**: 從開始選單或桌面圖示啟動
3. 應用程式會自動：
   - 啟動 backend server
   - 載入 UI 介面
   - 連接到本地 Git workspace

不需要手動啟動任何服務或開啟瀏覽器！

## 🐛 問題排除

### Electron 無法啟動

```bash
# 清理並重新安裝
rm -rf node_modules package-lock.json
npm install
```

### Backend 啟動失敗

檢查 port 3000 是否被占用：

```bash
lsof -ti:3000 | xargs kill -9
```

### 打包失敗

確保已安裝所有依賴：

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

## 📝 License

MIT
