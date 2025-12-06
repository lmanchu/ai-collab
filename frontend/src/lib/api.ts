import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const API_BASE = "http://localhost:3000/api"
// In a real app, we'd get this from Clerk
const MOCK_TOKEN = "test-token-veda"

const headers = {
    "Authorization": `Bearer ${MOCK_TOKEN}`,
    "Content-Type": "application/json"
}

export interface FileNode {
    path: string;
    name: string;
    type: "file" | "folder";
    children?: FileNode[];
    isOpen?: boolean;
}

export interface Commit {
    sha: string;
    author: string;
    type: "ai" | "human";
    message: string;
    timestamp: string;
    filesChanged?: string[];
}

export interface SyncStatus {
    branch: string;
    tracking: string | null;
    ahead: number;
    behind: number;
    isSynced: boolean;
    hasRemote: boolean;
    error?: string;
}

export const api = {
    async getFiles(): Promise<FileNode[]> {
        const res = await fetch(`${API_BASE}/files`, { headers });
        if (!res.ok) throw new Error("Failed to fetch files");
        const data = await res.json();
        return pathsToTree(data.files);
    },

    async getFileContent(path: string): Promise<string> {
        const res = await fetch(`${API_BASE}/files/${encodeURIComponent(path)}`, { headers });
        if (!res.ok) throw new Error("Failed to fetch file content");
        const data = await res.json();
        return data.content;
    },

    async saveFile(path: string, content: string): Promise<void> {
        const res = await fetch(`${API_BASE}/files/${encodeURIComponent(path)}`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                content,
                author: "human", // Veda UI acts as human (Lman)
                message: "Update via Tandem UI"
            })
        });
        if (!res.ok) throw new Error("Failed to save file");
    },

    async createFile(path: string, content: string = ""): Promise<void> {
        const url = `${API_BASE}/files/${encodeURIComponent(path)}`;
        console.log('[createFile API] Request URL:', url);

        const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
                content,
                author: "human",
                message: "Create new file via Tandem UI"
            })
        });

        console.log('[createFile API] Response status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[createFile API] Error response:', errorText);
            throw new Error(`Failed to create file: ${res.status} ${errorText}`);
        }
    },

    async getCommits(path?: string): Promise<Commit[]> {
        const url = path
            ? `${API_BASE}/commits?file=${encodeURIComponent(path)}`
            : `${API_BASE}/commits`;

        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error("Failed to fetch commits");
        const data = await res.json();
        return data.commits;
    },

    // Sync API
    async getSyncStatus(): Promise<SyncStatus> {
        const res = await fetch(`${API_BASE}/sync/status`, { headers });
        if (!res.ok) throw new Error("Failed to fetch sync status");
        return res.json();
    },

    async push(): Promise<{ success: boolean; message?: string; error?: string }> {
        const res = await fetch(`${API_BASE}/sync/push`, {
            method: "POST",
            headers
        });
        if (!res.ok) throw new Error("Failed to push");
        return res.json();
    },

    async pull(): Promise<{ success: boolean; message?: string; error?: string }> {
        const res = await fetch(`${API_BASE}/sync/pull`, {
            method: "POST",
            headers
        });
        if (!res.ok) throw new Error("Failed to pull");
        return res.json();
    },

    // Workspace API
    async getWorkspace(): Promise<{ path: string }> {
        const res = await fetch(`${API_BASE}/workspace`, { headers });
        if (!res.ok) throw new Error("Failed to fetch workspace");
        return res.json();
    },

    async setWorkspace(path: string): Promise<{ success: boolean; path: string }> {
        const res = await fetch(`${API_BASE}/workspace`, {
            method: "POST",
            headers,
            body: JSON.stringify({ path })
        });
        if (!res.ok) throw new Error("Failed to set workspace");
        return res.json();
    }
}

function pathsToTree(files: any[]): FileNode[] {
    const root: FileNode[] = [];
    const nodesByPath = new Map<string, FileNode>();

    // 1. Create all nodes
    files.forEach(f => {
        nodesByPath.set(f.path, { ...f, children: f.type === 'folder' ? [] : undefined });
    });

    // 2. Build tree
    files.forEach(f => {
        const node = nodesByPath.get(f.path)!;
        const parts = f.path.split('/');

        if (parts.length === 1) {
            root.push(node);
        } else {
            const parentPath = parts.slice(0, -1).join('/');
            const parent = nodesByPath.get(parentPath);
            if (parent && parent.children) {
                parent.children.push(node);
            } else {
                // If parent missing, add to root as fallback
                root.push(node);
            }
        }
    });

    return root;
}
