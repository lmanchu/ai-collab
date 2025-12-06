# Tandem Roadmap

This document outlines the future development plans for Tandem, focusing on evolving from a Git-based collaboration tool to a hybrid CRDT+Git architecture for real-time conflict-free collaboration.

---

## Current Architecture (v1.1.0)

```
┌─────────────────────────────────────┐
│         Web UI / Desktop App        │
│     (React + Electron + shadcn)     │
└─────────────────────────────────────┘
                  ↕ HTTP API
┌─────────────────────────────────────┐
│        Backend (Hono + Node.js)     │
│      - File CRUD operations         │
│      - Commit tracking              │
└─────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────┐
│         Git Version Control         │
│    - Auto-commit on save            │
│    - Human/AI attribution           │
│    - Manual conflict resolution     │
└─────────────────────────────────────┘
```

### Current Limitations
- ❌ Merge conflicts when multiple users edit simultaneously
- ❌ No real-time collaboration
- ❌ Manual pull/push required for sync
- ❌ Complex conflict resolution UX

---

## Target Architecture (v2.0.0) - Hybrid CRDT + Git

Based on CodiMD/HackMD's proven approach, we will adopt a **hybrid architecture** that combines the best of both worlds:

```
┌─────────────────────────────────────┐
│         Web UI / Desktop App        │
│     (React + Electron + shadcn)     │
└─────────────────────────────────────┘
                  ↕ WebSocket (Socket.io)
┌─────────────────────────────────────┐
│    Real-Time Collaboration Layer    │
│         (Yjs CRDT + Socket.io)      │
│  - Conflict-free merging            │
│  - Real-time sync                   │
│  - Offline support                  │
└─────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────┐
│      Snapshot & Version Control     │
│         (Git + Periodic Commits)    │
│  - Long-term history                │
│  - Cross-device sync                │
│  - Backup & recovery                │
└─────────────────────────────────────┘
```

### Benefits of Hybrid Approach
- ✅ **Real-time collaboration** - Multiple users can edit simultaneously without conflicts
- ✅ **Offline-first** - Continue editing offline, auto-sync when reconnected
- ✅ **Version history** - Git preserves full history via periodic snapshots
- ✅ **Cross-device sync** - Leverage Git for long-term persistence
- ✅ **Proven technology** - Same approach used by HackMD, Google Docs

---

## Implementation Phases

### Phase 1: Foundation (v1.x) - ✅ COMPLETED
**Timeline**: Dec 2025
**Status**: Shipped in v1.1.0

- [x] Desktop app with Electron
- [x] Web UI with file explorer, markdown editor, timeline
- [x] Git-based version control
- [x] Human/AI attribution
- [x] Open Folder workspace feature
- [x] File creation UI
- [x] Basic CRUD operations

---

### Phase 2: Real-Time Collaboration (v2.0.0) - 🎯 NEXT
**Timeline**: Q1 2026
**Goal**: Add real-time conflict-free editing

#### 2.1 - CRDT Integration
- [ ] Integrate **Yjs** for CRDT-based collaborative editing
- [ ] Replace CodeMirror with **Yjs + CodeMirror binding**
- [ ] Add **y-socket.io** for WebSocket communication
- [ ] Implement awareness (show other users' cursors)

**Tech Stack**:
- `yjs` - CRDT implementation
- `y-codemirror.next` - CodeMirror 6 binding
- `y-socket.io` - Socket.io provider
- `socket.io` - WebSocket server

#### 2.2 - Backend WebSocket Server
- [ ] Add Socket.io server to backend
- [ ] Implement Yjs document sync
- [ ] Add Redis for distributed sync (optional, for scalability)
- [ ] Session management for multi-user editing

**References**:
- [@hackmd/y-socketio-redis](https://www.npmjs.com/package/@hackmd/y-socketio-redis)
- [Yjs Documentation](https://docs.yjs.dev/)

#### 2.3 - Git Snapshot System
- [ ] Auto-commit Yjs document snapshots every N minutes
- [ ] On-demand manual snapshot with commit message
- [ ] Preserve human/AI attribution in snapshots
- [ ] Conflict-free merge on Git pull

**Strategy**:
- Snapshot interval: 5 minutes or on significant changes
- Git commits store serialized Yjs document state
- Version history browsing from Git commits

---

### Phase 3: Enhanced Collaboration (v2.1.0)
**Timeline**: Q2 2026
**Goal**: Multi-user features and permissions

- [ ] **User presence** - Show who's online
- [ ] **Cursor tracking** - See other users' cursors in real-time
- [ ] **Comments & annotations** - Inline comments on specific lines
- [ ] **Email invitations** - Invite collaborators via email
- [ ] **Permission management** - Read/write/admin roles
- [ ] **Conflict resolution UI** - For Git-level conflicts (rare)

---

### Phase 4: Cross-Platform Sync (v2.2.0)
**Timeline**: Q3 2026
**Goal**: Mobile app and plugin ecosystem

- [ ] **Mobile app** (iOS/Android) - React Native + Yjs
- [ ] **Obsidian plugin** - Integrate with Obsidian
- [ ] **VS Code extension** - Edit Tandem files in VS Code
- [ ] **Browser extension** - Quick capture to Tandem

---

### Phase 5: AI-Native Features (v3.0.0)
**Timeline**: Q4 2026
**Goal**: Deep AI integration

- [ ] **AI co-editing** - AI can edit with CRDT (no conflicts!)
- [ ] **Suggested edits** - AI proposes changes, human accepts/rejects
- [ ] **AI presence** - Show when AI is "thinking" or editing
- [ ] **Command palette** - Ask AI to perform edits
- [ ] **Version explanation** - AI explains what changed in each commit

---

## Technical Research

### CRDT vs Operational Transformation (OT)

After researching CodiMD and industry practices, we chose **CRDT (specifically Yjs)** because:

| Feature | CRDT (Yjs) | OT (ShareDB) |
|---------|------------|--------------|
| **Architecture** | Decentralized (P2P possible) | Centralized (requires server) |
| **Offline support** | Excellent (built-in) | Limited (needs server) |
| **Complexity** | Moderate | High (transform functions) |
| **Industry adoption** | Growing (Figma, Notion, HackMD) | Established (Google Docs) |
| **Conflict resolution** | Automatic (commutative) | Requires careful implementation |

### Why Yjs?
- **Proven in production** - Used by HackMD, Figma, Notion
- **Rich ecosystem** - Bindings for CodeMirror, Monaco, ProseMirror
- **Offline-first** - Works without server, syncs on reconnect
- **Small footprint** - Efficient CRDT algorithm
- **Active community** - Well-maintained and documented

### References
- [Yjs Documentation](https://docs.yjs.dev/)
- [CodiMD GitHub](https://github.com/hackmdio/codimd)
- [Building Real-Time Collaboration](https://www.tiny.cloud/blog/real-time-collaboration-ot-vs-crdt/)
- [Yjs Architecture Deep Dive](https://blog.kevinjahns.de/are-crdts-suitable-for-shared-editing/)

---

## Success Metrics

### v2.0.0 Goals
- **Zero merge conflicts** for concurrent editing
- **< 100ms latency** for real-time sync
- **Offline editing** works seamlessly
- **Git snapshots** preserve full history
- **100% backward compatible** with v1.x files

### Long-term Vision
- **10,000+ active users** across desktop/mobile/web
- **Plugin ecosystem** with Obsidian, VS Code, etc.
- **AI co-editing** becomes primary use case
- **Open source community** contributes features

---

## Contributing

We welcome contributions! Areas where you can help:

1. **Phase 2 Implementation** - Yjs integration, WebSocket server
2. **UI/UX Design** - Cursor tracking, presence indicators
3. **Testing** - Real-time collaboration edge cases
4. **Documentation** - API docs, tutorials, examples

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**Last Updated**: 2025-12-06
**Status**: Active development on Phase 2
