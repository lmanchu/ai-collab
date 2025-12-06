# Tandem - MAGI Team Handoff

## 最新更新 (2025-12-06 08:00)

### 🆕 新功能需求：Sync to All 按鈕

**From:** Lman
**Priority:** High
**Status:** 待 Veda 實作 UI，Iris 將提供 Backend API 支援

**需求說明**：
在 UI 上增加「Sync to All」按鈕，讓 MAGI 團隊成員（Lucy、Veda、Exia 等）能即時看到最新變更。

**功能設計**：
1. **同步狀態顯示**：顯示本地領先/落後遠端多少 commits
2. **一鍵同步**：點擊按鈕執行 Git push，將變更推送到 GitHub
3. **進度提示**：顯示同步進度和結果
4. **錯誤處理**：如果 push 失敗，顯示錯誤訊息

**Backend API** (Iris 會補上)：
- `GET /api/sync/status` - 檢查同步狀態
- `POST /api/sync/push` - 推送到 GitHub
- `POST /api/sync/pull` - 從 GitHub 拉取更新

**UI 設計建議**：
- 在頁面右上角放置「🔄 Sync to All」按鈕
- 按鈕旁顯示狀態：「↑3 commits ahead」或「✅ Synced」
- 點擊後顯示 loading 狀態
- 完成後顯示成功訊息：「✅ Synced! All MAGI members can now see your changes」

---

### 📢 Veda (Antigravity) - Frontend 開發可以開始了！

**From:** Iris (Backend 開發)
**To:** Veda (Frontend/UI 開發)
**Status:** Backend MVP 完成 ✅

---

## Backend 已完成

Backend API 已經完成開發和測試，現在可以開始前端開發了！

### 🎯 給 Veda 的重點資訊

1. **API 文件位置**: `/API-DOCS.md`
   - 完整的 REST API 文件
   - 包含所有端點、請求/回應格式
   - 有範例和錯誤處理說明

2. **Backend 服務資訊**:
   - Base URL: `http://localhost:3000`
   - Framework: Hono (輕量級 Node.js 框架)
   - CORS 已設定，允許 `http://localhost:5173` (Vite 預設 port)

3. **核心功能**:
   - ✅ Files API - 建立、讀取、更新、刪除檔案
   - ✅ Commits API - Git 歷史、diff、revert
   - ✅ AI/人類標記系統 (🤖 vs 👤)
   - ✅ 自動 Git commit 與 metadata

4. **Frontend 目錄**: `/frontend/`
   - 目前是空的，等待 Veda 初始化
   - 建議使用 Vite + React (或你偏好的框架)

---

## 測試資料

Backend 已經有測試資料，你可以直接使用：

```bash
# 查看現有檔案
curl http://localhost:3000/api/files

# 讀取測試檔案
curl http://localhost:3000/api/files/test.md

# 查看 commit 歷史
curl http://localhost:3000/api/commits
```

---

## Frontend 需求 (參考 PRD)

根據 `/docs/Tandem-PRD.md`，Frontend 需要實作：

### Phase 1 - 基礎介面
- [ ] 檔案列表顯示
- [ ] Markdown 編輯器
- [ ] 即時儲存功能
- [ ] 顯示 AI/人類標記
- [ ] **🆕 Sync to All 按鈕** (優先實作)

### Phase 2 - Git 整合
- [ ] Commit 歷史時間軸
- [ ] Diff 視覺化
- [ ] Revert 功能
- [ ] 同步狀態顯示 (與 Sync 按鈕整合)

### Phase 3 - 協作功能
- [ ] Pull 更新功能 (從其他 MAGI 成員拉取)
- [ ] 多人即時協作 (未來功能)

---

## 啟動 Backend

Backend 目前正在運行，如果需要重新啟動：

```bash
cd ~/Dropbox/PKM-Vault/3-Development/Projects/tandem/backend
npm run dev
```

伺服器會在 `http://localhost:3000` 啟動。

---

## 技術棧建議

**Veda 可以自由選擇，以下是建議**：

- **Framework**: React + Vite (快速開發)
- **UI Library**: Tailwind CSS 或 shadcn/ui
- **Markdown Editor**:
  - CodeMirror 6 (強大、可擴展)
  - 或 react-markdown + textarea
- **HTTP Client**: fetch API 或 axios
- **State Management**: React Context 或 Zustand (如需要)

---

## 注意事項

1. **CORS 已設定**，frontend 可以直接呼叫 API
2. **Port**: Frontend 建議使用 5173 (Vite 預設) 或 3000
3. **測試時**，Backend 必須在運行狀態
4. **資料儲存**: Backend 使用 Git，所有變更都有版本控制

---

## 問題或需求

如果需要 Backend 新增功能或修改 API，可以：
1. 更新這個 HANDOFF.md 檔案
2. 或直接在專案中新增 TODO 或 issue

---

**Ready to go! 🚀**

Iris 已完成 Backend 部分，現在輪到 Veda 打造漂亮的 UI 了！
