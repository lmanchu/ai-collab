import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  RefreshCw,
  FolderOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DocumentInfo {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  changesCount: number;
}

interface FileBrowserProps {
  currentDocumentId: string | null;
  onDocumentSelect: (documentId: string) => void;
  apiUrl?: string;
}

export function FileBrowser({
  currentDocumentId,
  onDocumentSelect,
  apiUrl = 'http://localhost:3001',
}: FileBrowserProps) {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/documents`);
      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;

    try {
      const response = await fetch(`${apiUrl}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newDocTitle.trim() }),
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments((prev) => [newDoc, ...prev]);
        setNewDocTitle('');
        setIsCreating(false);
        onDocumentSelect(newDoc.id);
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('確定要刪除這個文件嗎？')) return;

    try {
      const response = await fetch(`${apiUrl}/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        if (currentDocumentId === docId) {
          onDocumentSelect('');
        }
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
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

  if (isCollapsed) {
    return (
      <div className="w-12 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          title="展開檔案瀏覽器"
        >
          <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
        <div className="mt-4 space-y-2">
          <button
            onClick={() => {
              setIsCollapsed(false);
              setIsCreating(true);
            }}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="新增文件"
          >
            <Plus className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            onClick={fetchDocuments}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="重新整理"
          >
            <RefreshCw className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <span className="font-medium text-zinc-800 dark:text-zinc-200">文件</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreating(true)}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
            title="新增文件"
          >
            <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            onClick={fetchDocuments}
            className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors ${
              isLoading ? 'animate-spin' : ''
            }`}
            title="重新整理"
          >
            <RefreshCw className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
            title="收合"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      {/* New Document Form */}
      {isCreating && (
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800">
          <input
            type="text"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            placeholder="文件名稱..."
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateDocument();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewDocTitle('');
              }
            }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateDocument}
              className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              建立
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewDocTitle('');
              }}
              className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 && !isLoading && (
          <div className="p-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>尚無文件</p>
            <p className="text-xs mt-1">點擊 + 建立新文件</p>
          </div>
        )}

        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onDocumentSelect(doc.id)}
            className={`p-3 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group ${
              currentDocumentId === doc.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-500'
                : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText
                  className={`w-4 h-4 flex-shrink-0 ${
                    currentDocumentId === doc.id
                      ? 'text-blue-500'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                />
                <span
                  className={`text-sm truncate ${
                    currentDocumentId === doc.id
                      ? 'text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {doc.title}
                </span>
              </div>
              <button
                onClick={(e) => handleDeleteDocument(doc.id, e)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                title="刪除"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-1 ml-6 text-xs text-zinc-400 dark:text-zinc-500">
              <Clock className="w-3 h-3" />
              <span>{formatDate(doc.updatedAt)}</span>
              {doc.changesCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded text-[10px]">
                  {doc.changesCount} 修改
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileBrowser;
