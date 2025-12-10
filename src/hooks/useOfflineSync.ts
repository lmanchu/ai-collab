import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineStorage, type OfflineDocument } from '../services/offlineStorage';

interface UseOfflineSyncOptions {
  documentId: string;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
  autoSaveInterval?: number; // ms
}

interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChangesCount: number;
  lastSyncedAt: Date | null;
  offlineDocument: OfflineDocument | null;
}

export function useOfflineSync({
  documentId,
  onSyncComplete,
  onSyncError,
  autoSaveInterval = 5000,
}: UseOfflineSyncOptions) {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingChangesCount: 0,
    lastSyncedAt: null,
    offlineDocument: null,
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      // Attempt to sync when coming back online
      syncPendingChanges();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline document on mount
  useEffect(() => {
    loadOfflineDocument();
    loadPendingChangesCount();
  }, [documentId]);

  const loadOfflineDocument = async () => {
    try {
      const doc = await offlineStorage.getDocument(documentId);
      setState(prev => ({ ...prev, offlineDocument: doc }));
    } catch (error) {
      console.error('Failed to load offline document:', error);
    }
  };

  const loadPendingChangesCount = async () => {
    try {
      const count = await offlineStorage.getPendingChangeCount();
      setState(prev => ({ ...prev, pendingChangesCount: count }));
    } catch (error) {
      console.error('Failed to get pending changes count:', error);
    }
  };

  // Save document to offline storage
  const saveOffline = useCallback(async (content: string, title: string) => {
    try {
      const doc: OfflineDocument = {
        id: documentId,
        title,
        content,
        updatedAt: Date.now(),
      };
      await offlineStorage.saveDocument(doc);
      setState(prev => ({ ...prev, offlineDocument: doc }));

      // If offline, queue the change for later sync
      if (!navigator.onLine) {
        await offlineStorage.addPendingChange({
          documentId,
          type: 'update',
          data: { content, title },
          timestamp: Date.now(),
        });
        await loadPendingChangesCount();
      }
    } catch (error) {
      console.error('Failed to save offline:', error);
    }
  }, [documentId]);

  // Debounced auto-save
  const scheduleAutoSave = useCallback((content: string, title: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveOffline(content, title);
    }, autoSaveInterval);
  }, [saveOffline, autoSaveInterval]);

  // Sync pending changes when online
  const syncPendingChanges = useCallback(async () => {
    if (!navigator.onLine) return;

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      const pendingChanges = await offlineStorage.getPendingChanges();

      for (const change of pendingChanges) {
        try {
          // Attempt to sync with server
          const response = await fetch(`/api/documents/${change.documentId}/content`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(change.data),
          });

          if (response.ok) {
            await offlineStorage.clearPendingChange(change.id);
          } else {
            console.warn('Failed to sync change:', change.id);
          }
        } catch (error) {
          console.error('Error syncing change:', error);
        }
      }

      await loadPendingChangesCount();
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date()
      }));
      onSyncComplete?.();
    } catch (error) {
      setState(prev => ({ ...prev, isSyncing: false }));
      onSyncError?.(error as Error);
    }
  }, [onSyncComplete, onSyncError]);

  // Clear local data
  const clearOfflineData = useCallback(async () => {
    try {
      await offlineStorage.deleteDocument(documentId);
      setState(prev => ({ ...prev, offlineDocument: null }));
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }, [documentId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    saveOffline,
    scheduleAutoSave,
    syncPendingChanges,
    clearOfflineData,
    loadOfflineDocument,
  };
}

export default useOfflineSync;
