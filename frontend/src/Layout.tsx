import { FileExplorer } from "@/components/FileExplorer"
import { MarkdownEditor } from "@/components/MarkdownEditor"
import { Timeline } from "@/components/Timeline"
import { Button } from "@/components/ui/button"
import { RefreshCw, ArrowUp, Folder } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

// Type for Electron API (injected via preload)
declare global {
    interface Window {
        electron?: {
            onWorkspaceChanged?: (callback: (path: string) => void) => void;
            getWorkspace?: () => Promise<string>;
            openWorkspace?: () => Promise<string | null>;
        };
    }
}

function SyncButton() {
    const refreshData = useAppStore(state => state.refreshData)
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncStatus, setSyncStatus] = useState<{ ahead: number; isSynced: boolean } | null>(null)
    const [syncMessage, setSyncMessage] = useState<string | null>(null)

    // Load sync status on mount and periodically
    useEffect(() => {
        const loadStatus = async () => {
            try {
                const status = await api.getSyncStatus()
                setSyncStatus({ ahead: status.ahead, isSynced: status.isSynced })
            } catch (e) {
                console.error("Failed to load sync status:", e)
            }
        }

        loadStatus()
        const interval = setInterval(loadStatus, 30000) // Check every 30s
        return () => clearInterval(interval)
    }, [])

    const handleSync = async () => {
        setIsSyncing(true)
        setSyncMessage(null)

        try {
            // Push to GitHub
            const pushResult = await api.push()

            if (pushResult.success) {
                setSyncMessage("✅ Synced! All MAGI members can now see your changes")

                // Refresh local data
                await refreshData()

                // Update sync status
                const status = await api.getSyncStatus()
                setSyncStatus({ ahead: status.ahead, isSynced: status.isSynced })
            } else {
                setSyncMessage(`❌ Sync failed: ${pushResult.error}`)
            }
        } catch (e: any) {
            setSyncMessage(`❌ Sync failed: ${e.message}`)
        } finally {
            setIsSyncing(false)
            // Clear message after 3 seconds
            setTimeout(() => setSyncMessage(null), 3000)
        }
    }

    return (
        <div className="flex items-center gap-2">
            {syncStatus && syncStatus.ahead > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowUp className="h-3 w-3" />
                    {syncStatus.ahead} ahead
                </span>
            )}
            {syncMessage && (
                <span className="text-xs">{syncMessage}</span>
            )}
            <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="gap-2"
            >
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                Sync to All
            </Button>
        </div>
    )
}

function WorkspaceIndicator() {
    const workspacePath = useAppStore(state => state.workspacePath)
    const setWorkspacePath = useAppStore(state => state.setWorkspacePath)
    const loadWorkspace = useAppStore(state => state.loadWorkspace)
    const refreshData = useAppStore(state => state.refreshData)

    useEffect(() => {
        // Load initial workspace from backend
        loadWorkspace()

        // Listen to workspace changes from Electron
        if (window.electron?.onWorkspaceChanged) {
            window.electron.onWorkspaceChanged(async (path: string) => {
                console.log('[Workspace] Changed to:', path)
                setWorkspacePath(path)
                // Refresh files when workspace changes
                await refreshData()
            })
        }
    }, [])

    // Format path to show only folder name
    const folderName = workspacePath ? workspacePath.split('/').pop() || workspacePath : 'No workspace'

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Folder className="h-4 w-4" />
            <span className="max-w-[200px] truncate" title={workspacePath || ''}>
                {folderName}
            </span>
        </div>
    )
}

export function AppLayout() {
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            {/* Header */}
            <header className="flex h-14 items-center justify-between border-b px-6">
                <div className="flex items-center gap-4">
                    <span className="text-primary text-xl tracking-tight font-semibold">Tandem</span>
                    <WorkspaceIndicator />
                </div>
                <div className="flex items-center gap-2">
                    <SyncButton />
                </div>
            </header>

            {/* Main Content - 3 Column Grid */}
            <main className="grid flex-1 grid-cols-[250px_1fr_300px]">
                <aside className="h-full">
                    <FileExplorer />
                </aside>
                <section className="h-full min-w-0">
                    <MarkdownEditor />
                </section>
                <aside className="h-full">
                    <Timeline />
                </aside>
            </main>
        </div>
    )
}
