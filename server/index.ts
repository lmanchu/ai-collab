import { Server } from '@hocuspocus/server';
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
  updatedAt: string;
  changes: unknown[];
  yDocState: number[]; // Uint8Array as number array for JSON serialization
}

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
        if (data.yDocState) {
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

      const trackData: TrackFileData = {
        version: '1.0',
        schema: 'tandem-track-v1',
        documentId: documentName,
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
