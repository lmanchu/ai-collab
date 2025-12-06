# Changelog

All notable changes to Tandem will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-06

### Added
- **Open Folder Workspace Feature** - Obsidian-like folder selection for workspace
  - Added "File → Open Folder" menu (Cmd+O) with native folder picker dialog
  - Workspace path persistence using electron-store across app restarts
  - Workspace indicator in header showing current folder with folder icon
  - Backend API endpoints: GET/POST `/api/workspace` for dynamic workspace management
  - IPC event `workspace:changed` for frontend auto-refresh on workspace switch

### Fixed
- Fixed electron-store ESM import error by converting to dynamic import()
- Fixed EADDRINUSE port 3000 conflict in dev mode by preventing duplicate backend startup
- Fixed CORS to support Electron file:// protocol for desktop app
- Fixed window title bar overlap issue by using default title bar style

### Changed
- Backend now supports dynamic Git workspace switching via API
- Frontend auto-refreshes file list when workspace changes
- Dev mode no longer starts duplicate backend server (handled by npm run dev:backend)

## [1.0.0] - 2025-12-05

### Added
- **Desktop App (Electron)** - Native macOS/Windows/Linux desktop application
  - Built-in backend server bundled with desktop app
  - Vite frontend with hot reload in development
  - Automatic backend startup in production mode

- **Web UI (React + shadcn/ui)**
  - File Explorer with folder tree navigation
  - Markdown Editor (CodeMirror 6)
  - Timeline view showing commit history
  - File creation with [+] button and dialog
  - Diff viewer for version comparison

- **Backend API (Hono + Node.js)**
  - RESTful API for file operations (GET/POST/DELETE)
  - Git-based version control with automatic commits
  - Commit history with human/AI author attribution
  - Sync API for push/pull operations

- **CLI Tool (Bun)**
  - `tandem init` - Initialize workspace
  - `tandem list` - List all files
  - `tandem read <file>` - Read file content
  - `tandem write <file> <content>` - Write file with AI attribution

- **Git Integration**
  - Automatic commit on every save
  - Author attribution (👤 Human vs 🤖 AI)
  - Full commit history with diffs
  - GitHub sync support

### Documentation
- Initial README.md with project overview
- PRD (Product Requirements Document)
- API documentation
- Electron setup guide

---

## Future Plans

See [ROADMAP.md](ROADMAP.md) for upcoming features and the transition to hybrid CRDT+Git architecture.
