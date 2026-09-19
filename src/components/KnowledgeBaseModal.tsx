import React, { useRef, useState } from 'react';
import {
  X,
  FileCode,
  Upload,
  Trash2,
  FileText,
  Search,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { FileItem } from '../types';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  onUploadFiles: (files: FileItem[]) => void;
  onDeleteFile: (id: string) => void;
  onAskAboutFile: (file: FileItem) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  files,
  onUploadFiles,
  onDeleteFile,
  onAskAboutFile,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    const newFiles: FileItem[] = [];

    Array.from(uploaded).forEach((f) => {
      const isText = f.type.startsWith('text/') || f.name.endsWith('.md') || f.name.endsWith('.txt');
      const reader = new FileReader();

      reader.onload = (event) => {
        const textContent = (event.target?.result as string) || '';
        const chunks = Math.max(1, Math.ceil(textContent.length / 500));

        newFiles.push({
          id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          name: f.name,
          size: f.size,
          mimeType: f.type || 'text/plain',
          type: f.name.endsWith('.pdf') ? 'pdf' : isText ? 'txt' : 'other',
          uploadedAt: new Date().toISOString(),
          fullText: textContent.slice(0, 15000), // preserve preview/search text
          contentSnippet: textContent.slice(0, 240),
          chunksCount: chunks,
          tags: ['بەڵگەنامە', 'زانیاری'],
        });

        if (newFiles.length === uploaded.length) {
          onUploadFiles(newFiles);
        }
      };

      if (isText) {
        reader.readAsText(f);
      } else {
        // Read metadata
        newFiles.push({
          id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          name: f.name,
          size: f.size,
          mimeType: f.type || 'application/octet-stream',
          type: f.name.endsWith('.pdf') ? 'pdf' : 'other',
          uploadedAt: new Date().toISOString(),
          contentSnippet: `فایلی دوانەیی: ${f.name}`,
          chunksCount: 1,
          tags: ['فایل'],
        });
        if (newFiles.length === uploaded.length) {
          onUploadFiles(newFiles);
        }
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>بنکەی زانیاری، بەڵگەنامە و سەرچاوەکان (RAG Engine)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            id="btn-upload-knowledge"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:opacity-95"
          >
            <Upload className="w-4 h-4" />
            <span>بەرزکردنەوەی بەڵگەنامە / فایل</span>
          </button>

          {/* Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="گەڕان لە فایلەکاندا..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              هیچ بەڵگەنامەیەک بەرزنەکراوەتەوە. دەتوانیت فایلی PDF، دەق یان کۆد زیاد بکەیت تاوەکو
              باسۆکا شیکارییان بکات.
            </div>
          ) : (
            filtered.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">{file.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{file.chunksCount || 1} بەش (Chunks) بۆ گەڕان</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAskAboutFile(file);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-800/60 hover:bg-cyan-900 text-cyan-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>پرسیارکردن</span>
                  </button>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="سڕینەوە"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
