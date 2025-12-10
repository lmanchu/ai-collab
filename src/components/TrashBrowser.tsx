import { useState, useEffect, useCallback } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle, FileText, Clock } from 'lucide-react';
import { getAuthHeaders } from './PasswordGate';

interface TrashedDocument {
  id: string;
  title: string;
  deletedAt: string;
  createdAt: string;
}

interface TrashBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onRestored?: () => void;
  apiUrl?: string;
}

export function TrashBrowser({
  isOpen,
  onClose,
  onRestored,
  apiUrl = '',
}: TrashBrowserProps) {
  const [documents, setDocuments] = useState<TrashedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchTrash = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/trash`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Failed to fetch trash:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (isOpen) {
      fetchTrash();
      setSelectedIds([]);
    }
  }, [isOpen, fetchTrash]);

  const handleRestore = async (docId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/trash/${docId}/restore`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        setSelectedIds((prev) => prev.filter((id) => id !== docId));
        onRestored?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to restore document');
      }
    } catch (error) {
      console.error('Failed to restore document:', error);
    }
  };

  const handlePermanentDelete = async (docId: string) => {
    if (!confirm('確定要永久刪除這個文件嗎？此操作無法復原。')) return;

    try {
      const response = await fetch(`${apiUrl}/api/trash/${docId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        setSelectedIds((prev) => prev.filter((id) => id !== docId));
      }
    } catch (error) {
      console.error('Failed to permanently delete document:', error);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('確定要清空垃圾桶嗎？所有文件將被永久刪除，此操作無法復原。')) return;

    try {
      const response = await fetch(`${apiUrl}/api/trash`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setDocuments([]);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Failed to empty trash:', error);
    }
  };

  const handleRestoreSelected = async () => {
    for (const docId of selectedIds) {
      await handleRestore(docId);
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`確定要永久刪除選取的 ${selectedIds.length} 個文件嗎？此操作無法復原。`)) return;

    for (const docId of selectedIds) {
      try {
        await fetch(`${apiUrl}/api/trash/${docId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }

    setDocuments((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
    setSelectedIds([]);
  };

  const toggleSelect = (docId: string) => {
    setSelectedIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '剛才';
    if (diffMins < 60) return `${diffMins} 分鐘前`;
    if (diffHours < 24) return `${diffHours} 小時前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-TW');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-zinc-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              垃圾桶
            </h2>
            {documents.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full">
                {documents.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Actions Bar */}
        {documents.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 ? (
                <>
                  <button
                    onClick={handleRestoreSelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    還原 ({selectedIds.length})
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    永久刪除
                  </button>
                </>
              ) : (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  選取文件以進行批次操作
                </span>
              )}
            </div>
            <button
              onClick={handleEmptyTrash}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              清空垃圾桶
            </button>
          </div>
        )}

        {/* Document List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
              載入中...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center">
              <Trash2 className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
              <p className="text-zinc-500 dark:text-zinc-400">垃圾桶是空的</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                刪除的文件會在這裡顯示
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                    selectedIds.includes(doc.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(doc.id)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedIds.includes(doc.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-400'
                      }`}
                    >
                      {selectedIds.includes(doc.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                        </svg>
                      )}
                    </button>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        <span className="font-medium text-zinc-900 dark:text-white truncate">
                          {doc.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <Clock className="w-3 h-3" />
                        <span>刪除於 {formatDate(doc.deletedAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRestore(doc.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="還原"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="永久刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            垃圾桶中的文件可以隨時還原
          </p>
        </div>
      </div>
    </div>
  );
}
