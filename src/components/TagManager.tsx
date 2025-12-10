import { useState, useEffect, useRef } from 'react';
import { Tag, Plus, X, Check, Palette } from 'lucide-react';

interface DocumentTag {
  id: string;
  name: string;
  color: string;
}

interface TagManagerProps {
  documentId: string;
  onTagsChange?: (tags: DocumentTag[]) => void;
  compact?: boolean;
}

// Predefined tag colors
const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

// Storage key
const TAGS_STORAGE_KEY = 'tandem-document-tags';
const ALL_TAGS_KEY = 'tandem-all-tags';

// Get all tags from localStorage
function getAllTags(): DocumentTag[] {
  try {
    const stored = localStorage.getItem(ALL_TAGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save all tags to localStorage
function saveAllTags(tags: DocumentTag[]): void {
  localStorage.setItem(ALL_TAGS_KEY, JSON.stringify(tags));
}

// Get tags for a specific document
function getDocumentTags(documentId: string): string[] {
  try {
    const stored = localStorage.getItem(TAGS_STORAGE_KEY);
    const mapping: Record<string, string[]> = stored ? JSON.parse(stored) : {};
    return mapping[documentId] || [];
  } catch {
    return [];
  }
}

// Save tags for a specific document
function saveDocumentTags(documentId: string, tagIds: string[]): void {
  try {
    const stored = localStorage.getItem(TAGS_STORAGE_KEY);
    const mapping: Record<string, string[]> = stored ? JSON.parse(stored) : {};
    mapping[documentId] = tagIds;
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(mapping));
  } catch (error) {
    console.error('Failed to save document tags:', error);
  }
}

export function TagManager({ documentId, onTagsChange, compact = false }: TagManagerProps) {
  const [allTags, setAllTags] = useState<DocumentTag[]>([]);
  const [documentTagIds, setDocumentTagIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load tags on mount
  useEffect(() => {
    setAllTags(getAllTags());
    setDocumentTagIds(getDocumentTags(documentId));
  }, [documentId]);

  // Notify parent of tag changes
  useEffect(() => {
    if (onTagsChange) {
      const tags = allTags.filter(t => documentTagIds.includes(t.id));
      onTagsChange(tags);
    }
  }, [documentTagIds, allTags, onTagsChange]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const toggleTag = (tagId: string) => {
    const newTagIds = documentTagIds.includes(tagId)
      ? documentTagIds.filter(id => id !== tagId)
      : [...documentTagIds, tagId];

    setDocumentTagIds(newTagIds);
    saveDocumentTags(documentId, newTagIds);
  };

  const createTag = () => {
    if (!newTagName.trim()) return;

    const newTag: DocumentTag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
    };

    const updatedTags = [...allTags, newTag];
    setAllTags(updatedTags);
    saveAllTags(updatedTags);

    // Auto-assign to current document
    const newTagIds = [...documentTagIds, newTag.id];
    setDocumentTagIds(newTagIds);
    saveDocumentTags(documentId, newTagIds);

    setNewTagName('');
    setIsCreating(false);
  };

  const deleteTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Remove from all tags
    const updatedTags = allTags.filter(t => t.id !== tagId);
    setAllTags(updatedTags);
    saveAllTags(updatedTags);

    // Remove from document
    const newTagIds = documentTagIds.filter(id => id !== tagId);
    setDocumentTagIds(newTagIds);
    saveDocumentTags(documentId, newTagIds);
  };

  const documentTags = allTags.filter(t => documentTagIds.includes(t.id));

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {documentTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
            }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
      >
        <Tag className="w-3.5 h-3.5" />
        {documentTags.length > 0 ? (
          <span>{documentTags.length} 標籤</span>
        ) : (
          <span>新增標籤</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Current tags */}
          {documentTags.length > 0 && (
            <div className="p-2 border-b border-gray-200 dark:border-zinc-700">
              <div className="flex flex-wrap gap-1">
                {documentTags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTag(tag.id);
                      }}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All tags list */}
          <div className="max-h-48 overflow-y-auto">
            {allTags.filter(t => !documentTagIds.includes(t.id)).map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </span>
                <button
                  onClick={(e) => deleteTag(tag.id, e)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>

          {/* Create new tag */}
          {isCreating ? (
            <div className="p-2 border-t border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createTag();
                    if (e.key === 'Escape') setIsCreating(false);
                  }}
                  placeholder="標籤名稱..."
                  className="flex-1 px-2 py-1 text-sm bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={createTag}
                  disabled={!newTagName.trim()}
                  className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-gray-400 mr-1" />
                {TAG_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      newTagColor === color ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-t border-gray-200 dark:border-zinc-700"
            >
              <Plus className="w-4 h-4" />
              建立新標籤
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Export utility functions for use elsewhere
export { getAllTags, getDocumentTags, saveDocumentTags };
export type { DocumentTag };

export default TagManager;
