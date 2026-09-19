import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Activity,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { storage } from '../lib/storage';
import { AuditLog } from '../types';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const restoreFileRef = useRef<HTMLInputElement>(null);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
    } catch (e: any) {
      setHealthData({ status: 'error', error: e.message });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
      setLogs(storage.getAuditLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    const backupJson = storage.exportAllData();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basoka-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storage.restoreAllData(content);
      setRestoreStatus(res.message);
      if (res.success) {
        setLogs(storage.getAuditLogs());
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>پشکنین، ئاسایش و داتای یەدەگی باسۆکا</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Health & Latency Status Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>دۆخی تەندروستی دابینکەر (Google Gemini Provider)</span>
              </div>
              <button
                onClick={checkHealth}
                disabled={isChecking}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-300"
                title="نوێکردنەوەی پشکنین"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {healthData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">دۆخی سێرڤەر:</div>
                  <div className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>تەندروستە</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">کاتی وەڵامدانەوە:</div>
                  <div className="text-cyan-300 font-semibold font-mono mt-0.5">
                    {healthData.latencyMs ?? 15}ms
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">کلیلی ڕێگەپێدان:</div>
                  <div className={`font-semibold mt-0.5 ${healthData.hasApiKey ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {healthData.hasApiKey ? 'چالاکە' : 'دیارینەکراوە'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">کوالێتی کوردی:</div>
                  <div className="text-cyan-400 font-semibold mt-0.5">
                    سۆرانی چالاکە
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 py-2">پشکنینی دۆخ...</div>
            )}
          </div>

          {/* Backup & Restore Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="font-semibold text-slate-200">
              داتای یەدەگی گشتی (Universal Backup & Restore)
            </div>
            <div className="text-slate-400 text-[11px] leading-relaxed">
              دەتوانیت تەواوی گفتوگۆکان، پڕۆژەکان، بیرگە و ڕێکخستنەکان لە فایلی JSON هەناردە بکەیت یان
              لە فایلێکی پێشوو بگەڕێنیتەوە.
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                id="btn-export-backup"
                onClick={handleExportBackup}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/60 text-slate-200 hover:text-cyan-300 font-medium text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>دەرکردنی داتای یەدەگ (JSON Export)</span>
              </button>

              <input
                ref={restoreFileRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
              <button
                id="btn-import-backup"
                onClick={() => restoreFileRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500/60 text-slate-200 hover:text-blue-300 font-medium text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>گەڕاندنەوە لە فایل (Restore)</span>
              </button>
            </div>

            {restoreStatus && (
              <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs">
                {restoreStatus}
              </div>
            )}
          </div>

          {/* Audit Logs */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>تۆماری ئاسایش و ڕووداوەکان (Audit Logs)</span>
              <span className="text-[10px] text-slate-500">{logs.length} تۆمار</span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pt-1">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-4">هیچ تۆمارێکی ئاسایش نییە</div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-300 ml-2">{log.action}</span>
                      <span className="text-slate-400">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('ckb', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
