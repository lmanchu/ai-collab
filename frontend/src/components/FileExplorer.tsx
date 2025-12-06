import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import type { FileNode } from "@/lib/api"
import { FileIcon, FolderIcon, FolderOpenIcon, FilePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"

interface FileTreeItemProps {
    node: FileNode;
    level: number;
    onSelect: (path: string) => void;
    selectedPath?: string;
}

function FileTreeItem({ node, level, onSelect, selectedPath }: FileTreeItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isFolder = node.type === "folder";
    const isSelected = node.path === selectedPath;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder) {
            setIsOpen(!isOpen);
        } else {
            onSelect(node.path);
        }
    };

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-2 py-1 px-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground select-none",
                    isSelected && "bg-accent/50 text-accent-foreground font-medium"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={handleClick}
            >
                {isFolder ? (
                    isOpen ? <FolderOpenIcon className="h-4 w-4 text-primary" /> : <FolderIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{node.name}</span>
            </div>
            {isFolder && isOpen && node.children && (
                <div>
                    {node.children.map(child => (
                        <FileTreeItem
                            key={child.path}
                            node={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedPath={selectedPath}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export function FileExplorer() {
    const { files, loadFiles, loadFile, currentFile, createFile } = useAppStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newFileName, setNewFileName] = useState("");

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleSelect = (path: string) => {
        loadFile(path);
    };

    const handleCreateFile = async () => {
        if (!newFileName.trim()) return;

        const fileName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;
        const defaultContent = `# ${newFileName}\n\n`;
        await createFile(fileName, defaultContent);

        setNewFileName("");
        setIsDialogOpen(false);
    };

    return (
        <div className="flex h-full flex-col border-r bg-muted/10">
            <div className="flex h-12 items-center justify-between border-b px-4 bg-background">
                <h2 className="text-sm font-semibold tracking-tight">Files</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <FilePlus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New File</DialogTitle>
                            <DialogDescription>
                                Enter a name for your new markdown file.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            placeholder="my-document.md"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleCreateFile();
                                }
                            }}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateFile} disabled={!newFileName.trim()}>
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <ScrollArea className="flex-1">
                <div className="py-2">
                    {files.map(node => (
                        <FileTreeItem
                            key={node.path}
                            node={node}
                            level={0}
                            onSelect={handleSelect}
                            selectedPath={currentFile?.path}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
