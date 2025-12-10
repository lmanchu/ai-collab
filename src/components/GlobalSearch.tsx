import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, FileText, Loader2, ArrowRight } from 'lucide-react';
import { getAuthHeaders } from './PasswordGate';

interface SearchResult {
  documentId: string;
  documentTitle: string;
  matches: {
    text: string;
    context: string;
    position: number;
  }[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (documentId: string) => void;
  apiUrl?: string;
}

export function GlobalSearch({
  isOpen,
  onClose,
  onSelectDocument,
  apiUrl = '',
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `${apiUrl}/api/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [apiUrl]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalResults = results.reduce((acc, r) => acc + r.matches.length, 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(totalResults, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(totalResults, 1)) % Math.max(totalResults, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Find and select the document at selectedIndex
      let currentIndex = 0;
      for (const result of results) {
        for (let i = 0; i < result.matches.length; i++) {
          if (currentIndex === selectedIndex) {
            onSelectDocument(result.documentId);
            onClose();
            return;
          }
          currentIndex++;
        }
      }
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-700">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
          <Search className="w-5 h-5 text-gray-400 dark:text-zinc-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜尋所有文件內容..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none text-lg"
          />
          {isSearching && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
          )}
          {query && !isSearching && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length > 0 && query.length < 2 && (
            <div className="p-4 text-center text-gray-500 dark:text-zinc-400 text-sm">
              請輸入至少 2 個字元
            </div>
          )}

          {query.length >= 2 && !isSearching && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-zinc-600" />
              <p className="text-gray-500 dark:text-zinc-400">找不到符合的結果</p>
              <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">
                嘗試其他關鍵字
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {(() => {
                let globalIndex = 0;
                return results.map((result) => (
                  <div key={result.documentId} className="mb-2">
                    {/* Document Title */}
                    <div className="px-4 py-1 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.documentTitle}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500">
                        {result.matches.length} 個符合
                      </span>
                    </div>

                    {/* Matches */}
                    {result.matches.map((match, matchIndex) => {
                      const currentGlobalIndex = globalIndex++;
                      const isSelected = currentGlobalIndex === selectedIndex;

                      return (
                        <button
                          key={matchIndex}
                          onClick={() => {
                            onSelectDocument(result.documentId);
                            onClose();
                          }}
                          className={`w-full text-left px-4 py-2 mx-0 flex items-start gap-3 transition-colors ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/30'
                              : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-zinc-300 line-clamp-2">
                              {highlightMatch(match.context, query)}
                            </p>
                          </div>
                          <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            isSelected ? 'text-blue-500' : 'text-gray-300 dark:text-zinc-600'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-700 rounded border border-gray-300 dark:border-zinc-600 text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-700 rounded border border-gray-300 dark:border-zinc-600 text-[10px]">↓</kbd>
              瀏覽
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-700 rounded border border-gray-300 dark:border-zinc-600 text-[10px]">Enter</kbd>
              開啟
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-700 rounded border border-gray-300 dark:border-zinc-600 text-[10px]">Esc</kbd>
              關閉
            </span>
          </div>
          <span>Cmd+Shift+F 全文搜尋</span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
