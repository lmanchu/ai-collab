# AI-Native Collaboration Platform - Product Requirements Document

**Project Code**: AI-Collab
**Version**: v0.1 (MVP)
**Date**: 2025-12-05
**Owner**: Lman
**Status**: 🚧 Weekend Side Project

---

## 🎯 Vision

**The first workspace designed for humans and AI to work together.**

在 AI 時代，協作不再只是「人與人」，而是「人 + AI 團隊」。現有工具（Google Docs、Notion、Obsidian）都是為人類設計，無法原生支援 AI 協作。我們要打造第一個 AI-Native 的協作平台。

**Tagline**: "Dropbox for Human-AI Teams"

---

## 🧠 Core Insight

### 現狀問題

**人機協作的真實場景**（以 Lman + Iris 為例）：
```
Lman: 幫我寫 IrisGo PRD 的技術架構
Iris (Claude Code):
  [Read PRD.md] → [Edit PRD.md] → [Commit]
Lman: [看 diff] 覺得資料庫選擇不對
  → 批註：「為何用 PostgreSQL 不用 SQLite？」
Iris: [讀取批註] → [修改] → [Commit]
同事 Jeffrey: [看到變更]
  → 批註：「記憶體限制考慮了嗎？」
Iris: [整合所有批註] → [最終修改]
```

**現有工具的痛點**：
| 工具 | 痛點 |
|------|------|
| **Google Docs** | ❌ AI 無法直接編輯（需複雜 API）<br>❌ 不是 Markdown<br>❌ 無法標記「AI 改的」 |
| **Obsidian** | ❌ 太複雜（vault、link、plugin）<br>❌ 無批註功能<br>❌ 同事看不到即時變更 |
| **Git** | ❌ 非技術人員不會用<br>❌ 看不懂 commit history |

### 核心假設

1. **人機協作是未來常態**：2025 年後，所有知識工作將變成「人+AI」模式
2. **Simple > Feature-rich**：工具要比 Obsidian 更簡單（像 Dropbox）
3. **CLI = First-class Citizen**：AI（如 Claude Code）透過 CLI 操作，與 UI 平等

---

## 🎨 Product Principles

### 1. AI-First（不只是 AI-Friendly）

**差異**：
- AI-Friendly = 「AI 也可以用」
- AI-First = 「為 AI 協作優化」

**具體實踐**：
- ✅ 每個 AI 修改自動標記（誰、何時、為何）
- ✅ AI commit message 自動生成（語義化）
- ✅ UI 清楚區分：人改的 vs AI 改的
- ✅ 可以一鍵「撤銷所有 AI 修改」

### 2. Simpler than Obsidian

**Obsidian 的複雜性**：Vault、Wikilinks、Backlinks、Graph、Plugins

**我們的簡單性**：
- 檔案 + 資料夾（就這樣）
- Markdown（純文字）
- 協作（人+AI）
- 版本（時間軸）

→ **像 Dropbox 一樣簡單**

### 3. CLI-Native

**不是**：UI 為主，CLI 為輔
**而是**：CLI 和 UI 平等

**設計**：
- ✅ Claude Code 透過 CLI 編輯
- ✅ 人類透過 UI 審核、批註
- ✅ 兩者即時同步
- ✅ 版本控制自動處理

---

## 🚀 MVP Scope（Week 1 - Weekend Side Project）

### ✅ Must Have

#### 1. Web UI（Simple & Beautiful）

**功能**：
- 📁 **檔案列表**（類 Dropbox）
  - 檔案/資料夾樹狀結構
  - 新增/刪除/重新命名
  - 只支援 `.md` 檔案

- ✏️ **Markdown 編輯器**
  - 即時預覽（split view）
  - 語法高亮
  - 儲存時自動 commit

- 🕐 **時間軸（版本歷史）**
  - 列出所有 commits
  - 區分人類 👤 vs AI 🤖
  - 顯示：時間、作者、訊息、檔案
  - 操作：View diff / Revert

- 💬 **批註面板**（Phase 2）
  - 在特定行添加批註
  - AI 可讀取批註

**設計風格**：
- Clean、Modern、Minimal
- 參考：Linear、Dropbox、GitHub

#### 2. CLI Tool

**命令列表**：
```bash
# 基本操作
collab init                    # 初始化專案
collab list                    # 列出所有檔案
collab read <file>             # 讀取檔案內容
collab write <file> <content>  # 寫入檔案（自動 commit）
collab status                  # 查看狀態

# 協作操作
collab history <file>          # 查看版本歷史
collab diff <commit1> <commit2> # 比較版本
collab revert <commit>         # 還原到特定版本

# 批註（Phase 2）
collab comment <file> <line> <text>  # 新增批註
collab comments <file>               # 列出所有批註
```

**AI 標記**：
- 所有透過 CLI 的操作自動標記為 `author: ai`
- Commit message 自動生成（基於變更內容）

#### 3. Git Backend

**功能**：
- 每次儲存自動 commit
- Commit metadata 包含：
  ```json
  {
    "commit": "a1b2c3d",
    "author": "claude-code" | "lman",
    "type": "ai" | "human",
    "timestamp": "2025-12-05T20:30:00Z",
    "message": "Updated technical architecture",
    "files_changed": ["PRD.md"]
  }
  ```
- 支援 branch（main only for MVP）
- 自動 merge（simple fast-forward）

#### 4. Authentication

**MVP**：
- Email + Password（Clerk）
- 不做 OAuth（Google/GitHub）
- 不做 team/permissions（先 personal use）

### 🚫 Out of Scope（Phase 2）

- ❌ Email 邀請（先用 share link）
- ❌ 即時協作（先 5 分鐘同步）
- ❌ 複雜權限（先 public/private）
- ❌ 批註功能（先專注版本控制）
- ❌ Mobile app
- ❌ Obsidian plugin（獨立產品）

---

## 🏗️ Technical Architecture

### Tech Stack

**Frontend** (Veda 負責):
- Framework: React 19 + Vite
- UI Library: shadcn/ui + Tailwind CSS
- State: Zustand
- Routing: React Router
- Editor: CodeMirror 6（Markdown mode）

**Backend** (Iris 負責):
- Runtime: Bun
- Framework: Hono
- Git: simple-git
- Auth: Clerk
- Database: SQLite（metadata only）

**CLI Tool** (Iris 負責):
- Language: Node.js / Bun
- CLI Framework: Commander.js
- HTTP Client: fetch

**Deployment**:
- Frontend: Vercel
- Backend: Vercel Serverless Functions
- Git Storage: GitHub / Self-hosted Gitea

### System Architecture

```
┌─────────────────────────────────────┐
│      Web UI (React + shadcn)        │  ← Veda
│  - 檔案列表                          │
│  - Markdown 編輯器                   │
│  - 時間軸（版本歷史）                 │
└─────────────────────────────────────┘
              ↕ (REST API)
┌─────────────────────────────────────┐
│    Backend API (Hono + Bun)         │  ← Iris
│  - /api/files (CRUD)                │
│  - /api/commits (history)           │
│  - /api/auth (Clerk)                │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│      Git Service (simple-git)       │  ← Iris
│  - Auto commit on save              │
│  - Metadata tagging (human/AI)      │
│  - History & diff                   │
└─────────────────────────────────────┘
              ↕ (HTTP API)
┌─────────────────────────────────────┐
│         CLI Tool (Bun)              │  ← Iris
│  - collab read/write/list           │
│  - Auto tag as AI commit            │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│       Claude Code / AI Tools        │
└─────────────────────────────────────┘
```

### API Specification

#### Files API

```typescript
// GET /api/files
Response: File[]

// GET /api/files/:path
Response: { content: string, metadata: FileMetadata }

// POST /api/files/:path
Body: { content: string, author: "ai" | "human" }
Response: { commit: string }

// DELETE /api/files/:path
Response: { success: boolean }
```

#### Commits API

```typescript
// GET /api/commits?file=<path>
Response: Commit[]

// GET /api/commits/:sha
Response: { commit: Commit, diff: string }

// POST /api/commits/:sha/revert
Response: { success: boolean }
```

---

## 👥 Team & Responsibilities

### Veda (Antigravity - UI/Frontend)
**負責**：
- ✅ Web UI 完整實作
- ✅ React components（檔案列表、編輯器、時間軸）
- ✅ shadcn/ui 整合
- ✅ CodeMirror 編輯器設定
- ✅ 前端 routing & state management
- ✅ 與 Backend API 整合

**交付物**：
- `frontend/` 資料夾（完整 React app）
- Vercel 部署設定

### Iris (Claude Code - Backend/System)
**負責**：
- ✅ Backend API（Hono + Bun）
- ✅ Git service（simple-git wrapper）
- ✅ CLI Tool（完整實作）
- ✅ Authentication（Clerk 整合）
- ✅ Database schema（SQLite）
- ✅ API 文檔

**交付物**：
- `backend/` 資料夾（Hono API）
- `cli/` 資料夾（CLI tool）
- API 文檔（OpenAPI spec）

### 協作機制
- **交接文件**：`VEDA-IRIS-HANDOFF.md`（記錄 API contract）
- **溝通方式**：Lman 作為中介（prompt 傳遞 + 截圖回報）

---

## 📊 Success Metrics（MVP）

### Technical Metrics
- ✅ CLI tool 可以完整 read/write/commit
- ✅ Web UI 可以顯示檔案、編輯、看歷史
- ✅ Git commits 正確標記 human/AI
- ✅ 部署成功（可公開訪問）

### User Validation
- ✅ Lman + Iris 實際使用 1 週
- ✅ 邀請 3 個 Claude Code 用戶測試
- ✅ 收集回饋：哪裡好用？哪裡痛？

### Timeline
- **Day 1-2（週末）**：
  - Iris: Backend API + CLI tool basic（50%）
  - Veda: UI mockup + 檔案列表（30%）
- **Day 3-4（下週）**：
  - Iris: Git service + Auth（80%）
  - Veda: 編輯器 + 時間軸（70%）
- **Day 5-7**：
  - 整合測試 + bug fix
  - 部署 + 文檔

---

## 🎯 Go-to-Market Strategy（Post-MVP）

### Target Users

**Tier 1 (Early Adopters)**：
- Claude Code 用戶（~100K）
- AI-native startups
- 開發者 + PM 混合團隊

**Tier 2 (Growth)**：
- 內容創作者（AI 輔助寫作）
- 研究團隊（人+AI 協作）
- 任何需要「AI 協助但要版本控制」的團隊

### Pricing（暫定）
- **Free**: 1 個 workspace，5 個檔案
- **Pro**: $10/月，無限 workspace & 檔案
- **Team**: $20/月/人，協作功能

---

## 🚧 Future Roadmap

### Phase 2（1 個月後）
- ✅ Email 邀請系統
- ✅ 批註功能（inline comments）
- ✅ 即時協作（WebSocket）
- ✅ 權限管理（read/write）

### Phase 3（3 個月後）
- ✅ Obsidian plugin（雙向同步）
- ✅ VS Code extension
- ✅ Mobile app（React Native）
- ✅ Self-hosted option（Docker）

### Phase 4（6 個月後）
- ✅ AI Agent marketplace（第三方 AI 整合）
- ✅ Workflow automation（類 Zapier）
- ✅ Team analytics（誰貢獻最多）

---

## 📝 Open Questions

1. **商業模式**：Freemium 足夠嗎？還是要做 Enterprise？
2. **Self-hosted**：是否提供 Docker image？
3. **Git provider**：用 GitHub 還是自建 Gitea？
4. **AI 認證**：CLI tool 如何知道是 AI 在用？（API key？）

---

## 📚 References

- [Obsidian Git Plugin](https://github.com/denolehov/obsidian-git)
- [Peerdraft](https://github.com/peerdraft/obsidian-plugin)
- [Linear Design](https://linear.app)
- [GitHub UI](https://github.com)

---

**Next Steps**:
1. ✅ 建立 GitHub repo
2. ✅ 初始化 monorepo 結構（frontend / backend / cli）
3. ✅ Veda 開始 UI mockup
4. ✅ Iris 開始 Backend API

---

*PRD Version: 0.1*
*Last Updated: 2025-12-05 by Iris*
