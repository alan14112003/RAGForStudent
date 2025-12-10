'use client';

import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddSourceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpload: (file: File) => Promise<void>;
    uploading: boolean;
}

export default function AddSourceModal({ open, onOpenChange, onUpload, uploading }: AddSourceModalProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (isValidFile(file)) {
                setSelectedFile(file);
            }
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (isValidFile(file)) {
                setSelectedFile(file);
            }
        }
    }, []);

    const isValidFile = (file: File) => {
        const validExtensions = ['.pdf', '.txt', '.doc', '.docx'];
        const fileName = file.name.toLowerCase();
        return validExtensions.some(ext => fileName.endsWith(ext));
    };

    const handleSubmit = async () => {
        if (selectedFile) {
            await onUpload(selectedFile);
            setSelectedFile(null);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            setSelectedFile(null);
            onOpenChange(false);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const getFileIcon = (fileName: string) => {
        if (fileName.endsWith('.pdf')) {
            return <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600"><FileText size={20} /></div>;
        }
        return <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"><FileText size={20} /></div>;
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl w-full max-w-full">
                <DialogHeader>
                    <DialogTitle>Add Source</DialogTitle>
                </DialogHeader>

                <div className="py-4 w-full max-w-full overflow-hidden">
                    {!selectedFile ? (
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                                dragActive
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.txt,.doc,.docx"
                                onChange={handleFileSelect}
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className={cn(
                                    "h-14 w-14 rounded-full flex items-center justify-center transition-colors",
                                    dragActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                    <Upload size={24} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">
                                        {dragActive ? "Drop your file here" : "Drag & drop your file here"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        or click to browse
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Supports PDF, TXT, DOC, DOCX
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="border rounded-xl p-4 w-full max-w-full overflow-hidden">
                            <div className="flex items-center gap-3">
                                {getFileIcon(selectedFile.name)}
                                <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                                    <p className="font-medium text-sm truncate max-w-full">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                {!uploading && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={removeFile}
                                    >
                                        <X size={16} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedFile || uploading}
                        className="gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                Upload
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
