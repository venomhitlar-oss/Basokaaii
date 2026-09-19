import React, { useState } from 'react';
import {
  X,
  Plus,
  FolderKanban,
  Check,
  Trash2,
  Edit2,
  FileCode,
} from 'lucide-react';
import { Project } from '../types';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId?: string;
  onSelectProject: (id: string | undefined) => void;
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [color, setColor] = useState('#06b6d4');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      color,
      fileIds: [],
    });

    setName('');
    setDescription('');
    setInstructions('');
    setIsCreating(false);
  };

  const colors = ['#06b6d4', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <FolderKanban className="w-4 h-4 text-cyan-400" />
            <span>پڕۆژەکان و فەزای کار</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
          {/* Active project badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-slate-200 font-medium">دۆخی چالاک:</div>
              <div className="text-[11px] text-cyan-300 font-semibold mt-0.5">
                {activeProjectId
                  ? projects.find((p) => p.id === activeProjectId)?.name || 'پڕۆژەی هەڵبژێردراو'
                  : 'فەزای گشتی (بێ پڕۆژە)'}
              </div>
            </div>
            {activeProjectId && (
              <button
                onClick={() => onSelectProject(undefined)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                گەڕانەوە بۆ گشتی
              </button>
            )}
          </div>

          {/* New Project Form Toggle */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>دروستکردنی پڕۆژەیەکی نوێ</span>
            </button>
          ) : (
            <form
              onSubmit={handleCreate}
              className="p-4 rounded-xl bg-slate-950 border border-cyan-800/50 space-y-3"
            >
              <div className="font-semibold text-cyan-300 text-xs">پڕۆژەی نوێ</div>
              <div>
                <label className="block text-slate-300 text-[11px] mb-1">ناوی پڕۆژە</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="بۆ نموونە: پەرەپێدانی سیستم یان توێژینەوە"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-[11px] mb-1">وەسف</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وەسفێکی کورت..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-[11px] mb-1">
                  ڕێنمایی تایبەت بە باسۆکا لەم پڕۆژەیەدا
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="بۆ نموونە: کۆدەکان هەمیشە بە TypeScript و بە شێوەیەکی کورت بنووسە..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-[11px] mb-1">ڕەنگی ناسێنەر</label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 text-xs"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-sm"
                >
                  زیادکردن
                </button>
              </div>
            </form>
          )}

          {/* Existing Projects List */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-400 text-[11px]">پڕۆژە بەردەستەکان:</div>
            {projects.map((proj) => {
              const isActive = proj.id === activeProjectId;
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    isActive
                      ? 'bg-cyan-950/70 border-cyan-500/80 shadow-sm'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full mt-1 shrink-0"
                      style={{ backgroundColor: proj.color || '#06b6d4' }}
                    />
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{proj.name}</span>
                        {isActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-900 text-cyan-300">
                            چالاکە
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{proj.description}</div>
                      {proj.instructions && (
                        <div className="text-[10px] text-slate-500 italic mt-1 max-w-[260px] truncate">
                          ڕێنمایی: {proj.instructions}
                        </div>
                      )}
                    </div>
                  </div>

                  {proj.id !== 'proj-default' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="سڕینەوەی پڕۆژە"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
