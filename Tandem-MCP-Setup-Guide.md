# Tandem MCP 設定指南

> **目標受眾**: IrisGo 團隊成員
> **用途**: 設定 Tandem MCP 連接到 tandem.irisgo.xyz
> **更新時間**: 2025-12-15
> **MCP 版本**: v1.8.4

---

## 📋 前置需求

在開始設定前，請確認你有：

1. ✅ **Claude Code** 或 **Claude Desktop** 已安裝
2. ✅ **Tandem 存取密碼**（向 Lman 索取）
3. ✅ **網路連線**（能存取 tandem.irisgo.xyz）

---

## 🔧 設定步驟

### 步驟 1: 安裝 Tandem MCP Server

Tandem MCP 是一個讓 Claude 能夠讀取和編輯 Tandem 文檔的工具。

#### 選項 A: 使用 npx（推薦，無需安裝）

```json
{
  "mcpServers": {
    "tandem": {
      "command": "npx",
      "args": [
        "-y",
        "@tandem-hq/mcp-server-tandem",
        "--base-url",
        "https://tandem.irisgo.xyz",
        "--password",
        "YOUR_PASSWORD_HERE"
      ]
    }
  }
}
```

#### 選項 B: 全域安裝（如果你想要更快的啟動速度）

```bash
# 1. 安裝 Tandem MCP Server
npm install -g @tandem-hq/mcp-server-tandem

# 2. 配置 Claude
# 將以下內容加入 MCP 設定檔
```

```json
{
  "mcpServers": {
    "tandem": {
      "command": "mcp-server-tandem",
      "args": [
        "--base-url",
        "https://tandem.irisgo.xyz",
        "--password",
        "YOUR_PASSWORD_HERE"
      ]
    }
  }
}
```

---

### 步驟 2: 設定 MCP 配置檔

#### For Claude Code（CLI 版本）

配置檔位置：`~/.config/claude-code/mcp_settings.json`

```bash
# 建立目錄（如果不存在）
mkdir -p ~/.config/claude-code

# 編輯配置檔
nano ~/.config/claude-code/mcp_settings.json
```

貼上以下內容（**記得替換密碼**）：

```json
{
  "mcpServers": {
    "tandem": {
      "command": "npx",
      "args": [
        "-y",
        "@tandem-hq/mcp-server-tandem",
        "--base-url",
        "https://tandem.irisgo.xyz",
        "--password",
        "YOUR_PASSWORD_HERE"
      ]
    }
  }
}
```

#### For Claude Desktop（桌面版）

配置檔位置：`~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）

```bash
# 編輯配置檔
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

使用相同的 JSON 配置。

---

### 步驟 3: 重啟 Claude

設定完成後，重啟 Claude：

**Claude Code**:
```bash
# 退出當前 session
exit

# 重新啟動
claude
```

**Claude Desktop**:
- 完全退出應用程式（Cmd+Q）
- 重新開啟

---

### 步驟 4: 驗證設定

啟動 Claude 後，測試 Tandem MCP 是否正常運作：

```
你：列出 Tandem 上的所有文件

Claude：[應該會顯示 tandem.irisgo.xyz 上的文件列表]
```

如果成功，你會看到類似以下的回應：

```
📄 Tandem 文件列表：
1. IrisGo Product PRD
2. Helix Data Network PRD
3. Mnemosyne PRD
...
```

---

## 🔑 Tandem 密碼取得

**選項 1: 向 Lman 索取**
- Slack: @Lman
- Email: jeffrey@irisgo.ai

**選項 2: 從團隊密碼管理器取得**
- 如果團隊有使用 1Password / Bitwarden 等
- 搜尋 "Tandem IrisGo"

**選項 3: 從環境變數取得**（如果你有 server 存取權）
```bash
# 在 IrisGo server 上
echo $TANDEM_PASSWORD
```

---

## 🎯 Tandem MCP 功能說明

設定完成後，Claude 可以執行以下操作：

### 1️⃣ 列出所有文件
```
你：顯示 Tandem 上的文件清單
```

### 2️⃣ 讀取文件內容
```
你：讀取「IrisGo Product PRD」文件
```

### 3️⃣ 編輯文件
```
你：更新「Roadmap」文件，新增 Q1 2026 的計畫
```

### 4️⃣ 建立新文件
```
你：在 Tandem 建立一個新文件「客戶回饋摘要」
```

### 5️⃣ 刪除文件
```
你：刪除「測試文件」
```

### 6️⃣ 同步專案資料夾 (v1.6.0 新增)
```
你：把 ~/Dropbox/PKM-Vault/2-Areas/Side-Projects/Hermes/ 資料夾同步到 Tandem，專案名稱叫 "Hermes"
```

這會將資料夾內所有 .md 檔案同步到 Tandem，文件會以 `Hermes/檔名` 格式命名。

### 7️⃣ 列出專案文件 (v1.6.0 新增)
```
你：列出 Tandem 上 Hermes 專案的所有文件
```

### 8️⃣ 同步大型本地檔案 (v1.7.0 新增)
```
你：把這個大型 markdown 檔案同步到 Tandem: /Users/lman/PKM/large-document.md
```

使用 `tandem_write_from_file` 直接從本地檔案系統讀取，繞過訊息大小限制。

### 9️⃣ 提交修改建議 (v1.7.0 新增)
```
你：把我的修改以 Track Changes 建議的方式提交到 Tandem 文件
```

使用 `tandem_suggest_changes` 將本地變更以追蹤修訂的形式提交，讓其他人可以審核後再合併。

---

## 🆕 版本更新記錄

### v1.8.4 - 拼音文件 ID

中文標題現在會自動轉換為拼音 ID，更易讀：

| 標題 | Document ID |
|------|-------------|
| `測試/產品企劃書` | `ceshi-chanpinqihuashu` |
| `Hermes/技術架構` | `Hermes-jishujiagou` |

- ID 保持 URL 和檔案系統相容（純 ASCII）
- 原始中文標題保留在 `title` 欄位供顯示

### v1.8.0-1.8.3 - Bug 修復

- **v1.8.3**: 連結顯示修復、Y.js 元素排序、內容覆蓋保護
- **v1.8.2**: 內容重複 bug 修復（Y.js CRDT 合併問題）
- **v1.8.1**: 表格渲染修復（`<thead>`/`<tbody>` 處理）
- **v1.8.0**: 巢狀列表渲染修復

### v1.7.0 - 大檔案同步

新增兩個 MCP 工具：

1. **`tandem_write_from_file`** - 直接從本地檔案同步
   - 繞過訊息大小限制
   - 適合大型 markdown 文件

2. **`tandem_suggest_changes`** - 以 Track Changes 提交
   - 變更以建議形式出現
   - 需要人工審核後合併

### v1.6.0 - 專案同步

專案級別的同步功能：

1. **一次同步整個資料夾** - 不需要逐一上傳文件
2. **維持資料夾結構** - 文件以 `專案名/檔名` 格式保存
3. **支援增量更新** - 已存在的文件會更新，新文件會建立

**使用範例**:
```
你：同步我的 Hermes 專案到 Tandem

Claude：我需要知道：
1. 專案資料夾路徑？
2. 專案名稱？

你：路徑是 ~/Projects/Hermes，專案名稱就叫 Hermes

Claude：✅ 同步完成！
- 建立: 3 個文件
- 更新: 2 個文件
- 失敗: 0 個文件
```

---

## 🛠️ 常見問題排除

### ❌ 問題 1: "Connection refused" 或 "Cannot connect to server"

**原因**: 無法連接到 tandem.irisgo.xyz

**解決方法**:
```bash
# 測試連線
curl https://tandem.irisgo.xyz

# 如果失敗，檢查：
# 1. VPN 是否開啟（如果需要）
# 2. 防火牆設定
# 3. 聯絡 Lman 確認 server 狀態
```

---

### ❌ 問題 2: "Authentication failed" 或 "Invalid password"

**原因**: 密碼錯誤

**解決方法**:
1. 確認密碼沒有多餘空格
2. 確認使用正確的密碼
3. 向 Lman 確認最新密碼

---

### ❌ 問題 3: "Command not found: npx"

**原因**: 未安裝 Node.js

**解決方法**:
```bash
# 安裝 Node.js（macOS）
brew install node

# 驗證安裝
node --version
npm --version
npx --version
```

---

### ❌ 問題 4: MCP Server 啟動很慢

**原因**: npx 每次都要下載套件

**解決方法**: 改用全域安裝（參考步驟 1 選項 B）

---

### ❌ 問題 5: Claude 沒有顯示 Tandem 工具

**原因**: MCP 配置檔格式錯誤或位置錯誤

**解決方法**:
```bash
# 驗證 JSON 格式
cat ~/.config/claude-code/mcp_settings.json | python3 -m json.tool

# 如果有錯誤，檢查：
# 1. 缺少逗號
# 2. 引號不匹配
# 3. 括號不匹配
```

---

## 🔒 安全注意事項

### ⚠️ 重要提醒

1. **不要將密碼 commit 進 Git**
   - MCP 配置檔可能包含密碼
   - 將 `mcp_settings.json` 加入 `.gitignore`

2. **不要公開分享配置檔**
   - 密碼應該是機密的
   - 只在安全的內部管道分享

3. **定期更換密碼**
   - 如果有人離職，記得更換密碼
   - 通知所有團隊成員更新配置

4. **使用環境變數（進階）**
   ```json
   {
     "mcpServers": {
       "tandem": {
         "command": "npx",
         "args": [
           "-y",
           "@tandem-hq/mcp-server-tandem",
           "--base-url",
           "https://tandem.irisgo.xyz",
           "--password"
         ],
         "env": {
           "TANDEM_PASSWORD": "YOUR_PASSWORD_HERE"
         }
       }
     }
   }
   ```

---

## 📚 相關資源

### Tandem 文檔
- **Web UI**: https://tandem.irisgo.xyz
- **GitHub**: https://github.com/tandem-hq/tandem
- **MCP Server**: https://github.com/tandem-hq/mcp-server-tandem

### IrisGo 內部文件
- **Tandem 使用指南**: `/1-Projects/IrisGo/Product/COLLABORATION.md`
- **MCP 整合說明**: （待建立）

---

## 🎓 快速參考卡

### 完整設定指令（一次性複製貼上）

```bash
# 1. 建立配置目錄
mkdir -p ~/.config/claude-code

# 2. 建立配置檔（使用你的密碼替換 YOUR_PASSWORD_HERE）
cat > ~/.config/claude-code/mcp_settings.json << 'EOF'
{
  "mcpServers": {
    "tandem": {
      "command": "npx",
      "args": [
        "-y",
        "@tandem-hq/mcp-server-tandem",
        "--base-url",
        "https://tandem.irisgo.xyz",
        "--password",
        "YOUR_PASSWORD_HERE"
      ]
    }
  }
}
EOF

# 3. 驗證 JSON 格式
cat ~/.config/claude-code/mcp_settings.json | python3 -m json.tool

# 4. 重啟 Claude Code
echo "✅ 設定完成！請重啟 Claude Code"
```

### 測試指令

```bash
# 測試 Tandem server 連線
curl -I https://tandem.irisgo.xyz

# 測試 MCP 配置檔
cat ~/.config/claude-code/mcp_settings.json | python3 -m json.tool

# 檢查 npx 是否可用
npx --version
```

---

## 💬 需要協助？

如果遇到問題，請聯絡：

- **Slack**: #engineering 頻道
- **Email**: jeffrey@irisgo.ai
- **直接找**: @Lman

---

**最後更新**: 2025-12-15
**維護者**: Lman
**版本**: v1.2 (對應 Tandem v1.8.4)
