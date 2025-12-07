import { useState, useEffect, useCallback, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { Search, Replace, X, ChevronUp, ChevronDown, CaseSensitive } from 'lucide-react';

interface SearchReplaceProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchReplace({ editor, isOpen, onClose }: SearchReplaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<{ from: number; to: number }[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isOpen]);

  // Find all matches
  const findMatches = useCallback(() => {
    if (!editor || !searchTerm) {
      setMatches([]);
      setCurrentIndex(0);
      return;
    }

    const doc = editor.state.doc;
    const text = doc.textContent;
    const searchText = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    const docText = caseSensitive ? text : text.toLowerCase();

    const foundMatches: { from: number; to: number }[] = [];
    let pos = 0;
    let index = docText.indexOf(searchText, pos);

    while (index !== -1) {
      // Convert text position to doc position
      let docPos = 0;
      let textPos = 0;
      doc.descendants((node, nodePos) => {
        if (textPos <= index && node.isText) {
          const nodeText = node.text || '';
          if (textPos + nodeText.length > index) {
            docPos = nodePos + (index - textPos);
          }
          textPos += nodeText.length;
        }
        return true;
      });

      foundMatches.push({
        from: docPos,
        to: docPos + searchTerm.length,
      });

      pos = index + 1;
      index = docText.indexOf(searchText, pos);
    }

    setMatches(foundMatches);
    if (foundMatches.length > 0 && currentIndex >= foundMatches.length) {
      setCurrentIndex(0);
    }
  }, [editor, searchTerm, caseSensitive, currentIndex]);

  // Update matches when search term changes
  useEffect(() => {
    findMatches();
  }, [findMatches]);

  // Highlight current match
  useEffect(() => {
    if (!editor || matches.length === 0) return;

    const match = matches[currentIndex];
    if (match) {
      editor.commands.setTextSelection({ from: match.from, to: match.to });
      // Scroll to selection
      const { view } = editor;
      const coords = view.coordsAtPos(match.from);
      const editorRect = view.dom.getBoundingClientRect();
      if (coords.top < editorRect.top || coords.bottom > editorRect.bottom) {
        view.dom.scrollTo({
          top: coords.top - editorRect.top + view.dom.scrollTop - 100,
          behavior: 'smooth',
        });
      }
    }
  }, [editor, matches, currentIndex]);

  const goToNext = () => {
    if (matches.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % matches.length);
  };

  const goToPrevious = () => {
    if (matches.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const replaceOne = () => {
    if (!editor || matches.length === 0) return;
    const match = matches[currentIndex];
    if (match) {
      editor.chain().focus().setTextSelection(match).insertContent(replaceTerm).run();
      findMatches();
    }
  };

  const replaceAll = () => {
    if (!editor || matches.length === 0) return;

    // Replace from end to start to maintain positions
    const sortedMatches = [...matches].sort((a, b) => b.from - a.from);

    editor.chain().focus();
    sortedMatches.forEach((match) => {
      editor.chain().setTextSelection(match).insertContent(replaceTerm).run();
    });

    findMatches();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        goToPrevious();
      } else {
        goToNext();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-4 z-50 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-gray-200 dark:border-zinc-700 p-3 w-80">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜尋..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-zinc-800 rounded-md border border-transparent focus:border-purple-500 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`p-1.5 rounded-md transition-colors ${
            caseSensitive
              ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
              : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500'
          }`}
          title="區分大小寫"
        >
          <CaseSensitive className="w-4 h-4" />
        </button>
        <button
          onClick={goToPrevious}
          disabled={matches.length === 0}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md disabled:opacity-50"
          title="上一個 (Shift+Enter)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={goToNext}
          disabled={matches.length === 0}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md disabled:opacity-50"
          title="下一個 (Enter)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
        {matches.length > 0 ? (
          <span>{currentIndex + 1} / {matches.length} 個結果</span>
        ) : searchTerm ? (
          <span>找不到結果</span>
        ) : (
          <span>輸入搜尋文字</span>
        )}
      </div>

      <button
        onClick={() => setShowReplace(!showReplace)}
        className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 mb-2"
      >
        <Replace className="w-3 h-3" />
        {showReplace ? '隱藏取代' : '顯示取代'}
      </button>

      {showReplace && (
        <div className="space-y-2">
          <div className="relative">
            <Replace className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="取代為..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-zinc-800 rounded-md border border-transparent focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={replaceOne}
              disabled={matches.length === 0}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-md disabled:opacity-50"
            >
              取代
            </button>
            <button
              onClick={replaceAll}
              disabled={matches.length === 0}
              className="flex-1 px-3 py-1.5 text-xs bg-purple-600 text-white hover:bg-purple-700 rounded-md disabled:opacity-50"
            >
              全部取代
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
