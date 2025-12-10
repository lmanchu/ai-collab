import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { offlineStorage } from '../services/offlineStorage';

interface OfflineIndicatorProps {
  pendingChangesCount?: number;
  onSync?: () => void;
  isSyncing?: boolean;
}

export function OfflineIndicator({
  pendingChangesCount = 0,
  onSync,
  isSyncing = false,
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);
  const [localPendingCount, setLocalPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending count on mount
    loadPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setLocalPendingCount(pendingChangesCount);
  }, [pendingChangesCount]);

  const loadPendingCount = async () => {
    try {
      const count = await offlineStorage.getPendingChangeCount();
      setLocalPendingCount(count);
    } catch (error) {
      console.error('Failed to load pending count:', error);
    }
  };

  const effectivePendingCount = pendingChangesCount || localPendingCount;

  // Only show when offline or has pending changes
  if (isOnline && effectivePendingCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          !isOnline
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : effectivePendingCount > 0
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>離線模式</span>
          </>
        ) : effectivePendingCount > 0 ? (
          <>
            <CloudOff className="w-4 h-4" />
            <span>{effectivePendingCount} 個待同步</span>
          </>
        ) : (
          <>
            <Cloud className="w-4 h-4" />
            <span>已同步</span>
          </>
        )}
      </button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center gap-2 mb-3">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-white">已連線</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="font-medium text-gray-900 dark:text-white">離線</span>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {!isOnline && (
              <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>您的變更將自動儲存在本地，並在恢復連線後同步。</span>
              </div>
            )}

            {effectivePendingCount > 0 && (
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-900 rounded-md">
                <span>待同步的變更</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {effectivePendingCount}
                </span>
              </div>
            )}

            {isOnline && effectivePendingCount > 0 && onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? '同步中...' : '立即同步'}
              </button>
            )}

            {effectivePendingCount === 0 && isOnline && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-green-700 dark:text-green-400">
                <Cloud className="w-4 h-4" />
                <span>所有變更已同步</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tandem 會自動在本地儲存您的文件，即使在離線時也能繼續編輯。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfflineIndicator;
