import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Sliders,
  Sparkles,
  FolderKanban,
  Brain,
  FileCode,
  Columns3,
  ShieldCheck,
  Calculator,
  Globe,
  CheckCircle2,
  Workflow as WorkflowIcon,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onOpenProjects: () => void;
  onOpenMemory: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenModelCompare: () => void;
  onOpenSettings: () => void;
  onOpenDiagnostics: () => void;
  onOpenWorkflows: () => void;
  onSelectModel: (modelId: string) => void;
  onQuickTool: (toolName: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onOpenProjects,
  onOpenMemory,
  onOpenKnowledgeBase,
  onOpenModelCompare,
  onOpenSettings,
  onOpenDiagnostics,
  onOpenWorkflows,
  onSelectModel,
  onQuickTool,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'new-chat',
      title: 'دەستپێکردنی گفتوگۆی نوێ',
      subtitle: 'فەزایەکی نوێ بۆ گفتوگۆ لەگەڵ باسۆکا',
      icon: Plus,
      action: () => {
        onNewChat();
        onClose();
      },
      category: 'گشتی',
    },
    {
      id: 'projects',
      title: 'بەڕێوەبردنی پڕۆژەکان',
      subtitle: 'ڕێکخستنی فایل، ڕێنمایی و فەزای جیاواز',
      icon: FolderKanban,
      action: () => {
        onOpenProjects();
        onClose();
      },
      category: 'فەزای کار',
    },
    {
      id: 'memory',
      title: 'بیرگەی ژیر و بەردەوام',
      subtitle: 'بینین و سڕینەوەی ئەو زانیارییانەی باسۆکا فێریان بووە',
      icon: Brain,
      action: () => {
        onOpenMemory();
        onClose();
      },
      category: 'فەزای کار',
    },
    {
      id: 'files',
      title: 'بنکەی فایل و زانیاری (RAG)',
      subtitle: 'بەرزکردنەوەی PDF، بەڵگەنامە و گەڕانی زیرەک',
      icon: FileCode,
      action: () => {
        onOpenKnowledgeBase();
        onClose();
      },
      category: 'فەزای کار',
    },
    {
      id: 'compare',
      title: 'بەراوردی مۆدێلەکان (Model Compare)',
      subtitle: 'تاقیکردنەوەی هاوکاتی وەڵام لە نێوان چەند مۆدێلێکدا',
      icon: Columns3,
      action: () => {
        onOpenModelCompare();
        onClose();
      },
      category: 'مۆدێلەکان',
    },
    {
      id: 'workflows',
      title: 'کارپێکردنە خۆکارەکان (Workflows)',
      subtitle: 'دروستکردنی زنجیرە فەرمان و ڕێڕەوی کار',
      icon: WorkflowIcon,
      action: () => {
        onOpenWorkflows();
        onClose();
      },
      category: 'ئامرازەکان',
    },
    {
      id: 'diagnostics',
      title: 'پشکنین، ئاسایش و داتای یەدەگ',
      subtitle: 'دۆخی سێرڤەر، لۆگەکان، هەناردە و گەڕاندنەوەی داتا',
      icon: ShieldCheck,
      action: () => {
        onOpenDiagnostics();
        onClose();
      },
      category: 'سیستەم',
    },
    {
      id: 'settings',
      title: 'ڕێکخستنەکانی سەرۆک',
      subtitle: 'سڵاوی سەرۆک، دەنگ، کوالێتی و خاسیەتەکان',
      icon: Sliders,
      action: () => {
        onOpenSettings();
        onClose();
      },
      category: 'سیستەم',
    },
    {
      id: 'tool-calc',
      title: 'ئامرازی ژمێرەری پارێزراو',
      subtitle: 'شیکارکردنی دەستبەجێی هاوکێشەی بیرکاری',
      icon: Calculator,
      action: () => {
        onQuickTool('calculator');
        onClose();
      },
      category: 'ئامرازەکان',
    },
    {
      id: 'tool-kurdish',
      title: 'پشکنینی زمانی کوردیی سۆرانی',
      subtitle: 'پاکتاوکردنی ڕێزمانی و پیتە نادروستەکان',
      icon: CheckCircle2,
      action: () => {
        onQuickTool('kurdish_refine');
        onClose();
      },
      category: 'ئامرازەکان',
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" dir="rtl">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Palette Body */}
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="relative p-3 border-b border-slate-800 flex items-center">
          <Search className="w-5 h-5 text-cyan-400 mr-2 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="فەرمانێک یان بەشێک بنووسە بۆ گەڕان..."
            className="w-full bg-transparent px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              هیچ فەرمانێک بەپێی گەڕانەکەت نەدۆزرایەوە
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 font-medium">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>دۆخی فەرمانی خێرای باسۆکا</span>
          <span className="font-mono text-[10px]">Escape بۆ داخستن</span>
        </div>
      </div>
    </div>
  );
};
