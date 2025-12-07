import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modKey = isMac ? '⌘' : 'Ctrl';

const shortcuts = [
  {
    category: '文字格式',
    items: [
      { keys: `${modKey}+B`, description: '粗體' },
      { keys: `${modKey}+I`, description: '斜體' },
      { keys: `${modKey}+U`, description: '底線' },
      { keys: `${modKey}+Shift+X`, description: '刪除線' },
      { keys: `${modKey}+E`, description: '行內程式碼' },
    ],
  },
  {
    category: '段落格式',
    items: [
      { keys: `${modKey}+Alt+1`, description: '標題 1' },
      { keys: `${modKey}+Alt+2`, description: '標題 2' },
      { keys: `${modKey}+Alt+3`, description: '標題 3' },
      { keys: `${modKey}+Shift+7`, description: '有序列表' },
      { keys: `${modKey}+Shift+8`, description: '無序列表' },
      { keys: `${modKey}+Shift+9`, description: '引用區塊' },
      { keys: `${modKey}+Alt+C`, description: '程式碼區塊' },
    ],
  },
  {
    category: '表格操作',
    items: [
      { keys: 'Tab', description: '跳到下一個儲存格' },
      { keys: 'Shift+Tab', description: '跳到上一個儲存格' },
      { keys: 'Enter', description: '在儲存格內換行' },
    ],
  },
  {
    category: '編輯操作',
    items: [
      { keys: `${modKey}+Z`, description: '復原' },
      { keys: `${modKey}+Shift+Z`, description: '重做' },
      { keys: `${modKey}+A`, description: '全選' },
      { keys: `${modKey}+F`, description: '搜尋' },
    ],
  },
  {
    category: '連結與媒體',
    items: [
      { keys: `${modKey}+K`, description: '插入連結' },
      { keys: `${modKey}+V`, description: '貼上（支援圖片）' },
    ],
  },
];

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">鍵盤快捷鍵</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div
                      key={item.keys}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item.description}
                      </span>
                      <div className="flex gap-1">
                        {item.keys.split('+').map((key, i) => (
                          <kbd
                            key={i}
                            className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
          <p className="text-xs text-gray-500 dark:text-zinc-400 text-center">
            按 <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-zinc-800 rounded">Esc</kbd> 關閉此視窗
          </p>
        </div>
      </div>
    </div>
  );
}
