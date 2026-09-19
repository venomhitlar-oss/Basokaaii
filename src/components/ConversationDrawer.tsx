import React, { useState } from 'react';
import {
  X,
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Download,
  Pin,
  Calendar,
} from 'lucide-react';
import { Conversation } from '../types';

interface ConversationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onExportConversation: (conv: Conversation) => void;
}

export const ConversationDrawer: React.FC<ConversationDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onExportConversation,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <aside className="relative w-80 max-w-[85vw] h-full bg-slate-900 border-l border-slate-800 shadow-2xl z-10 flex flex-col justify-between">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>مێژووی گفتوگۆکان</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action: New Chat & Search */}
        <div className="p-3 space-y-2 border-b border-slate-800/60">
          <button
            id="btn-drawer-new-chat"
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>دەستپێکردنی گفتوگۆی نوێ</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="گەڕان لە گفتوگۆکاندا..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/80"
            />
          </div>
        </div>

        {/* List of Conversations */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              هیچ گفتوگۆیەک نەدۆزرایەوە
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-800/60 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2 max-w-[200px] overflow-hidden">
                    <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div className="truncate">
                      <div className="truncate font-medium">{conv.title || 'گفتوگۆ'}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>
                          {new Date(conv.updatedAt).toLocaleDateString('ckb', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{conv.messages.length} پەیام</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Export & Delete */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportConversation(conv);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-700/60"
                      title="داگرتنی داتا"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700/60"
                      title="سڕینەوە"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
          سیستەمی کەسیی باسۆکا — basoka ai
        </div>
      </aside>
    </div>
  );
};
