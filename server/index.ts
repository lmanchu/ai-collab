import { Server } from '@hocuspocus/server';
import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import * as Y from 'yjs';

// Directory to store .track files
const DATA_DIR = process.env.TANDEM_DATA_DIR || './data';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getTrackFilePath(documentName: string): string {
  // Sanitize document name for file system
  const safeName = documentName.replace(/[^a-zA-Z0-9-_]/g, '_');
  return path.join(DATA_DIR, `${safeName}.track`);
}

interface TrackFileData {
  version: '1.0';
  schema: 'tandem-track-v1';
  documentId: string;
  title?: string;
  updatedAt: string;
  createdAt?: string;
  changes: unknown[];
  yDocState: number[];
}

interface DocumentInfo {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  changesCount: number;
}

// ==================== REST API ====================

const app = express();
app.use(cors());
app.use(express.json());

// List all documents
app.get('/api/documents', (_req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.track'));
    const documents: DocumentInfo[] = files.map(file => {
      const filePath = path.join(DATA_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as TrackFileData;
      return {
        id: data.documentId,
        title: data.title || data.documentId,
        createdAt: data.createdAt || data.updatedAt,
        updatedAt: data.updatedAt,
        changesCount: data.changes?.length || 0,
      };
    });
    res.json(documents);
  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// Create new document
app.post('/api/documents', (req, res) => {
  try {
    const { title } = req.body;
    const id = title?.replace(/[^a-zA-Z0-9-_]/g, '_') || `doc-${Date.now()}`;
    const trackFilePath = getTrackFilePath(id);

    if (fs.existsSync(trackFilePath)) {
      return res.status(409).json({ error: 'Document already exists' });
    }

    const now = new Date().toISOString();
    const trackData: TrackFileData = {
      version: '1.0',
      schema: 'tandem-track-v1',
      documentId: id,
      title: title || id,
      createdAt: now,
      updatedAt: now,
      changes: [],
      yDocState: [],
    };

    fs.writeFileSync(trackFilePath, JSON.stringify(trackData, null, 2));
    console.log(`Document created: ${id}`);

    res.status(201).json({
      id,
      title: trackData.title,
      createdAt: now,
      updatedAt: now,
      changesCount: 0,
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Get document info
app.get('/api/documents/:id', (req, res) => {
  try {
    const trackFilePath = getTrackFilePath(req.params.id);

    if (!fs.existsSync(trackFilePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const data = JSON.parse(fs.readFileSync(trackFilePath, 'utf-8')) as TrackFileData;
    res.json({
      id: data.documentId,
      title: data.title || data.documentId,
      createdAt: data.createdAt || data.updatedAt,
      updatedAt: data.updatedAt,
      changesCount: data.changes?.length || 0,
    });
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

// Update document title
app.patch('/api/documents/:id', (req, res) => {
  try {
    const trackFilePath = getTrackFilePath(req.params.id);

    if (!fs.existsSync(trackFilePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const data = JSON.parse(fs.readFileSync(trackFilePath, 'utf-8')) as TrackFileData;
    if (req.body.title) {
      data.title = req.body.title;
    }
    data.updatedAt = new Date().toISOString();

    fs.writeFileSync(trackFilePath, JSON.stringify(data, null, 2));
    res.json({
      id: data.documentId,
      title: data.title,
      updatedAt: data.updatedAt,
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
app.delete('/api/documents/:id', (req, res) => {
  try {
    const trackFilePath = getTrackFilePath(req.params.id);

    if (!fs.existsSync(trackFilePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    fs.unlinkSync(trackFilePath);
    console.log(`Document deleted: ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Start REST API server
const API_PORT = 3001;
app.listen(API_PORT, () => {
  console.log(`REST API server running at http://localhost:${API_PORT}`);
});

// ==================== Hocuspocus WebSocket Server ====================

const server = new Server({
  port: 1234,

  async onConnect({ documentName }) {
    console.log(`Client connected to document: ${documentName}`);
  },

  async onDisconnect({ documentName }) {
    console.log(`Client disconnected from document: ${documentName}`);
  },

  async onLoadDocument({ document, documentName }) {
    const trackFilePath = getTrackFilePath(documentName);

    if (fs.existsSync(trackFilePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(trackFilePath, 'utf-8')) as TrackFileData;
        console.log(`Loading document from: ${trackFilePath}`);

        // Apply saved Yjs state
        if (data.yDocState && data.yDocState.length > 0) {
          const state = new Uint8Array(data.yDocState);
          Y.applyUpdate(document, state);
        }

        // If there are saved changes, ensure they're in the Yjs array
        if (data.changes && data.changes.length > 0) {
          const ychanges = document.getArray('trackChanges');
          if (ychanges.length === 0) {
            ychanges.push(data.changes);
          }
        }
      } catch (error) {
        console.error(`Error loading track file: ${trackFilePath}`, error);
      }
    } else {
      console.log(`No existing track file for: ${documentName}`);
    }

    return document;
  },

  async onStoreDocument({ document, documentName }) {
    const trackFilePath = getTrackFilePath(documentName);

    try {
      // Get track changes from Yjs
      const ychanges = document.getArray('trackChanges');
      const changes = ychanges.toArray();

      // Encode Yjs document state
      const state = Y.encodeStateAsUpdate(document);

      // Load existing data to preserve title and createdAt
      let existingData: Partial<TrackFileData> = {};
      if (fs.existsSync(trackFilePath)) {
        try {
          existingData = JSON.parse(fs.readFileSync(trackFilePath, 'utf-8'));
        } catch {
          // ignore
        }
      }

      const trackData: TrackFileData = {
        version: '1.0',
        schema: 'tandem-track-v1',
        documentId: documentName,
        title: existingData.title || documentName,
        createdAt: existingData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        changes,
        yDocState: Array.from(state),
      };

      fs.writeFileSync(trackFilePath, JSON.stringify(trackData, null, 2));
      console.log(`Document stored: ${trackFilePath} (${changes.length} changes)`);
    } catch (error) {
      console.error(`Error storing track file: ${trackFilePath}`, error);
    }
  },
});

server.listen();
console.log('Hocuspocus server is running on port 1234');
console.log(`Track files will be stored in: ${path.resolve(DATA_DIR)}`);
