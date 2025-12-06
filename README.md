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

### MVP (Week 1)
- ✅ Web UI (File Explorer + Markdown Editor + Timeline)
- ✅ Electron Desktop App
- ✅ File Creation (with [+] button)
- ✅ CLI Tool (read/write/list)
- ✅ Git version control (auto commit)
- ✅ AI tagging (distinguish human vs AI commits)
- ✅ Diff viewer

### Phase 2
- Email invitation system
- Inline comments
- Real-time collaboration (WebSocket)
- Permission management

### Phase 3
- Obsidian plugin
- VS Code extension
- Mobile app
- Self-hosted option

---

## 👥 Team

- **Veda** (Antigravity): Frontend (React + shadcn/ui)
- **Iris** (Claude Code): Backend (Hono + Bun) + CLI

---

## 📚 Documentation

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

**Status**: 🚧 Weekend Side Project (MVP in progress)

*Last Updated: 2025-12-05*
