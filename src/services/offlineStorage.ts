// IndexedDB-based offline storage for documents

const DB_NAME = 'tandem-offline';
const DB_VERSION = 1;
const DOCS_STORE = 'documents';
const PENDING_STORE = 'pending-changes';

interface OfflineDocument {
  id: string;
  title: string;
  content: string; // HTML content
  updatedAt: number;
  syncedAt?: number;
}

interface PendingChange {
  id: string;
  documentId: string;
  type: 'create' | 'update' | 'delete';
  data?: unknown;
  timestamp: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Documents store
        if (!db.objectStoreNames.contains(DOCS_STORE)) {
          const docsStore = db.createObjectStore(DOCS_STORE, { keyPath: 'id' });
          docsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Pending changes store (for sync queue)
        if (!db.objectStoreNames.contains(PENDING_STORE)) {
          const pendingStore = db.createObjectStore(PENDING_STORE, { keyPath: 'id' });
          pendingStore.createIndex('documentId', 'documentId', { unique: false });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  // Document operations
  async saveDocument(doc: OfflineDocument): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readwrite');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.put(doc);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDocument(id: string): Promise<OfflineDocument | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readonly');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDocuments(): Promise<OfflineDocument[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readonly');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDocument(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readwrite');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Pending changes operations (sync queue)
  async addPendingChange(change: Omit<PendingChange, 'id'>): Promise<void> {
    const db = await this.init();
    const pendingChange: PendingChange = {
      ...change,
      id: `${change.documentId}-${change.timestamp}`,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE], 'readwrite');
      const store = transaction.objectStore(PENDING_STORE);
      const request = store.put(pendingChange);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingChanges(): Promise<PendingChange[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE], 'readonly');
      const store = transaction.objectStore(PENDING_STORE);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearPendingChange(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE], 'readwrite');
      const store = transaction.objectStore(PENDING_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllPendingChanges(): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE], 'readwrite');
      const store = transaction.objectStore(PENDING_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Check if there are unsync'd changes
  async hasPendingChanges(): Promise<boolean> {
    const changes = await this.getPendingChanges();
    return changes.length > 0;
  }

  // Get pending change count
  async getPendingChangeCount(): Promise<number> {
    const changes = await this.getPendingChanges();
    return changes.length;
  }
}

export const offlineStorage = new OfflineStorage();
export type { OfflineDocument, PendingChange };
