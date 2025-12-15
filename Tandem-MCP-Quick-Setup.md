# Tandem MCP 快速設定（2 分鐘版本）

> 給同事的快速設定指南
> **版本**: v1.8.4 (2025-12-15)

---

## 🚀 3 步驟完成設定

### 步驟 1: 建立配置檔

```bash
# 建立目錄
mkdir -p ~/.config/claude-code

# 建立配置檔
nano ~/.config/claude-code/mcp_settings.json
```

### 步驟 2: 貼上以下內容

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

**🔑 重要**: 將 `YOUR_PASSWORD_HERE` 替換成實際密碼

### 步驟 3: 重啟 Claude

```bash
# 退出
exit

# 重新啟動
claude
```

---

## 🔑 密碼在哪裡？

向 **Lman** 索取：
- Slack: @Lman
- Email: jeffrey@irisgo.ai

---

## ✅ 測試是否成功

在 Claude 中輸入：

```
列出 Tandem 上的所有文件
```

如果看到文件列表 = 成功！🎉

---

## 🆕 新功能亮點

**v1.8.4 - 拼音 ID**: 中文標題自動轉拼音
- `測試/產品企劃書` → `ceshi-chanpinqihuashu`

**v1.7.0 - 大檔案同步**: 直接從本地檔案同步
```
你：把 /path/to/large-file.md 同步到 Tandem
```

**v1.6.0 - 專案同步**: 一次同步整個資料夾
```
你：同步 ~/Projects/Hermes 資料夾到 Tandem，專案名稱叫 Hermes
```

---

## 📚 完整文檔

詳細設定與故障排除：
`/1-Projects/IrisGo/Product/Tandem-MCP-Setup-Guide.md`

---

**需要協助**？Slack #engineering 或找 @Lman
