'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils'; // Assuming utils exists, otherwise standard shadcn cn utility

interface FileUploadProps {
    onUploadSuccess: (data: any) => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selected = acceptedFiles[0];
        if (selected) {
            if (selected.type !== 'application/pdf') {
                setError('Only PDF files are allowed');
                return;
            }
            setFile(selected);
            setError(null);
            setSuccess(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1
    });

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/import/pdf', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload file');

            const data = await response.json();
            setSuccess(true);
            onUploadSuccess(data.transactions);

            // Reset after delay
            setTimeout(() => {
                setFile(null);
                setSuccess(false);
            }, 3000);

        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <AnimatePresence>
                {!file ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div
                            {...getRootProps()}
                            className={cn(
                                "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200",
                                isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50",
                                error && "border-red-300 bg-red-50"
                            )}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        PDF Bank Statements only (max 10MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                        {error && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1 justify-center">
                                <AlertCircle className="h-3 w-3" /> {error}
                            </p>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border rounded-xl p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFile(null)}
                                    disabled={isUploading || success}
                                >
                                    Change
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleUpload}
                                    disabled={isUploading || success}
                                    className={cn(success && "bg-green-600 hover:bg-green-700")}
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : success ? (
                                        <><CheckCircle className="h-4 w-4 mr-2" /> Parsed</>
                                    ) : (
                                        <><ArrowRight className="h-4 w-4 mr-2" /> Process</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
