'use client';

import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  className?: string;
}

export default function FileUpload({ onUpload, className }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      onUpload(acceptedFiles);
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors',
        isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400',
        className
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
      <p className="text-sm text-gray-500 text-center">
        {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
      </p>
    </div>
  );
}
