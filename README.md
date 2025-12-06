# Tandem

> The first workspace designed for humans and AI to work together.

**Tagline**: "Work in tandem with AI"

---

## 🎯 Vision

In the AI era, collaboration is no longer just "human-to-human" but "human + AI teams". Existing tools (Google Docs, Notion, Obsidian) are designed for humans and don't natively support AI collaboration.

We're building the first **AI-Native** collaboration platform:
- Humans edit Markdown via **Web UI**
- AI (like Claude Code) edits via **CLI**
- Full **Git version control**
- Clear attribution of changes (👤 Human vs 🤖 AI)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│      Web UI (React + shadcn)        │
│  - File Explorer                    │
│  - Markdown Editor                  │
│  - Timeline (Version History)       │
└─────────────────────────────────────┘
              ↕ (REST API)
┌─────────────────────────────────────┐
│    Backend API (Hono + Bun)         │
│  - /api/files (CRUD)                │
│  - /api/commits (history)           │
│  - /api/auth (Clerk)                │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│      Git Service (simple-git)       │
│  - Auto commit on save              │
│  - Metadata tagging (human/AI)      │
│  - History & diff                   │
└─────────────────────────────────────┘
              ↕ (HTTP API)
┌─────────────────────────────────────┐
│         CLI Tool (Bun)              │
│  - tandem read/write/list           │
│  - Auto tag as AI commit            │
└─────────────────────────────────────┘
```

---

## 📦 Project Structure

```
tandem/
├── frontend/          # React + shadcn/ui (Veda)
├── backend/           # Hono + Bun (Iris)
├── cli/               # CLI tool (Iris)
├── docs/              # Documentation
│   ├── PRD.md
│   └── API.md
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ / Bun
- Git

### Frontend (Web UI)
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Backend (API)
```bash
cd backend
bun install
bun run dev
# API running on http://localhost:3000
```

### CLI Tool
```bash
cd cli
bun install
bun link

# Usage
tandem init
tandem list
tandem read <file>
tandem write <file> <content>
```

---

## 🎨 Features

### v1.1.0 (Current) - ✅ Shipped
- ✅ **Desktop App** - Native Electron app for macOS/Windows/Linux
- ✅ **Open Folder Workspace** - Obsidian-like folder selection (Cmd+O)
- ✅ **Web UI** - File Explorer + Markdown Editor + Timeline
- ✅ **File Creation** - [+] button with dialog
- ✅ **CLI Tool** - `tandem read/write/list` commands
- ✅ **Git Version Control** - Auto-commit on save
- ✅ **AI Attribution** - Distinguish 👤 Human vs 🤖 AI commits
- ✅ **Diff Viewer** - Compare versions
- ✅ **Workspace Persistence** - Remember last opened folder

### v2.0.0 (Next) - 🎯 Planned
**Real-Time Conflict-Free Collaboration** (Hybrid CRDT + Git Architecture)
- ⏳ **Yjs CRDT Integration** - Conflict-free collaborative editing
- ⏳ **WebSocket Sync** - Real-time updates via Socket.io
- ⏳ **Multi-user Editing** - Multiple users edit simultaneously
- ⏳ **Offline Support** - Continue editing offline, auto-sync on reconnect
- ⏳ **Git Snapshots** - Periodic commits for version history
- ⏳ **Cursor Tracking** - See other users' cursors
- ⏳ **User Presence** - Show who's online

### v2.1.0 and Beyond
- Email invitation system
- Inline comments & annotations
- Permission management (read/write/admin)
- Obsidian plugin
- VS Code extension
- Mobile app (iOS/Android)
- AI co-editing features

See [ROADMAP.md](ROADMAP.md) for detailed timeline and architecture plans.

---

## 👥 Team

- **Veda** (Antigravity): Frontend (React + shadcn/ui)
- **Iris** (Claude Code): Backend (Hono + Bun) + CLI

---

## 📚 Documentation

- [ROADMAP](ROADMAP.md) - Product roadmap and hybrid CRDT+Git architecture plan
- [CHANGELOG](CHANGELOG.md) - Version history and release notes
- [PRD](docs/PRD.md) - Product Requirements Document
- [API Docs](API-DOCS.md) - API Specification
- [Handoff](HANDOFF.md) - Veda-Iris Handoff Document
- [Electron Setup](ELECTRON-README.md) - Desktop App Guide

---

## 🛠️ Tech Stack

**Frontend**:
- React 19 + Vite
- shadcn/ui + Tailwind CSS
- CodeMirror 6
- Zustand

**Backend**:
- Node.js
- Hono
- simple-git

**Desktop App**:
- Electron 28
- Built-in backend server
- macOS / Windows / Linux support

**Deployment**:
- Desktop app (DMG / Portable)

---

## 📄 License

MIT

---

## 🔄 Current Status

**Version**: v1.1.0 (Shipped)
**Next Milestone**: v2.0.0 - Real-Time Collaboration with CRDT
**Development**: Active - See [ROADMAP.md](ROADMAP.md) for details

### Recent Updates
- ✅ Open Folder workspace feature
- ✅ Workspace persistence across sessions
- ✅ Desktop app improvements
- 🎯 Planning hybrid CRDT+Git architecture (inspired by CodiMD/HackMD)

---

*Last Updated: 2025-12-06*
