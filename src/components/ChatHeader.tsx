import React from 'react';
import {
  Menu,
  Plus,
  Command,
  FolderKanban,
  Brain,
  FileCode,
  Sliders,
  Sparkles,
  ShieldCheck,
  Columns3,
} from 'lucide-react';

interface ChatHeaderProps {
  onToggleDrawer: () => void;
  onNewChat: () => void;
  onOpenCommandPalette: () => void;
  onOpenProjects: () => void;
  onOpenMemory: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenModelCompare: () => void;
  onOpenSettings: () => void;
  onOpenDiagnostics: () => void;
  hasActiveProject?: boolean;
  activeProjectName?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onToggleDrawer,
  onNewChat,
  onOpenCommandPalette,
  onOpenProjects,
  onOpenMemory,
  onOpenKnowledgeBase,
  onOpenModelCompare,
  onOpenSettings,
  onOpenDiagnostics,
  hasActiveProject,
  activeProjectName,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
      {/* Right side: Drawer toggle + Brand */}
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-history-drawer"
          onClick={onToggleDrawer}
          className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="مێژووی گفتوگۆکان"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          id="btn-new-chat-header"
          onClick={onNewChat}
          className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
          title="دەستپێکردنی گفتوگۆی نوێ"
        >
          <Plus className="w-4 h-4" />
          <span>گفتوگۆی نوێ</span>
        </button>

        <div className="flex items-center gap-2 pr-1">
          <span className="font-extrabold text-base tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            basoka ai
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" title="سیستەم چالاکە" />
          {hasActiveProject && (
            <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/40 text-[11px] text-cyan-300">
              {activeProjectName}
            </span>
          )}
        </div>
      </div>

      {/* Left side: Command Palette button & Progressive Disclosure Menus */}
      <div className="flex items-center gap-1.5">
        {/* Command Palette Button */}
        <button
          id="btn-open-cmd-palette"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700 transition-all text-xs shadow-sm"
          title="فەرمانە خێراکان (⌘K)"
        >
          <Command className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline font-medium">فەرمانەکان</span>
          <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Projects icon button */}
        <button
          id="btn-header-projects"
          onClick={onOpenProjects}
          className="p-2 rounded-xl border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          title="پڕۆژەکان"
        >
          <FolderKanban className="w-4 h-4" />
        </button>

        {/* Memory icon button */}
        <button
          id="btn-header-memory"
          onClick={onOpenMemory}
          className="p-2 rounded-xl border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          title="بیرگەی پارێزراوی سەرۆک"
        >
          <Brain className="w-4 h-4" />
        </button>

        {/* Files / Knowledge base icon button */}
        <button
          id="btn-header-files"
          onClick={onOpenKnowledgeBase}
          className="p-2 rounded-xl border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          title="بنکەی فایل و زانیاری (RAG)"
        >
          <FileCode className="w-4 h-4" />
        </button>

        {/* Model Compare icon button */}
        <button
          id="btn-header-compare"
          onClick={onOpenModelCompare}
          className="p-2 rounded-xl border border-slate-800/80 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors hidden sm:block"
          title="بەراوردی مۆدێلەکان"
        >
          <Columns3 className="w-4 h-4" />
        </button>

        {/* Diagnostics & Security */}
        <button
          id="btn-header-diagnostics"
          onClick={onOpenDiagnostics}
          className="p-2 rounded-xl border border-slate-800/80 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
          title="پشکنین، ئاسایش و داتای یەدەگ"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* Settings button */}
        <button
          id="btn-header-settings"
          onClick={onOpenSettings}
          className="p-2 rounded-xl border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          title="ڕێکخستنەکان"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
