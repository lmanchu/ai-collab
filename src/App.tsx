import { useState } from 'react';
import { TandemEditor } from './components/TandemEditor';
import { FileBrowser } from './components/FileBrowser';
import { createAuthor } from './types/track';
import { FileText } from 'lucide-react';

// Create a default human author
const currentUser = createAuthor('human', 'Leo', {
  email: 'leo@example.com',
});

function App() {
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Tandem <span className="text-gray-400 font-light">3.0</span>
          </h1>
          {currentDocumentId && (
            <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
              / {currentDocumentId}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium tracking-wide hidden sm:block">
          Human + AI Collaboration
        </span>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Browser Sidebar */}
        <FileBrowser
          currentDocumentId={currentDocumentId}
          onDocumentSelect={setCurrentDocumentId}
        />

        {/* Editor Area */}
        <main className="flex-1 overflow-hidden p-4">
          {currentDocumentId ? (
            <TandemEditor
              key={currentDocumentId}
              documentId={currentDocumentId}
              author={currentUser}
              onContentChange={(content) => {
                console.log('Content changed:', content.substring(0, 100));
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                <h2 className="text-xl font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                  選擇或建立文件
                </h2>
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  從左側選擇一個文件開始編輯，或點擊 + 建立新文件
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="h-8 flex items-center justify-center text-[10px] text-gray-400 dark:text-zinc-600 uppercase tracking-widest font-medium border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        Tandem 3.0
      </footer>
    </div>
  );
}

export default App;
