import React, { useState } from 'react';
import {
  X,
  Workflow as WorkflowIcon,
  Play,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';
import { Workflow } from '../types';

interface WorkflowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflows: Workflow[];
  onRunWorkflow: (workflow: Workflow) => void;
}

export const WorkflowsModal: React.FC<WorkflowsModalProps> = ({
  isOpen,
  onClose,
  workflows,
  onRunWorkflow,
}) => {
  const [runningId, setRunningId] = useState<string | null>(null);
  const [completedId, setCompletedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRun = (wf: Workflow) => {
    setRunningId(wf.id);
    setCompletedId(null);
    setTimeout(() => {
      onRunWorkflow(wf);
      setRunningId(null);
      setCompletedId(wf.id);
      setTimeout(() => setCompletedId(null), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <WorkflowIcon className="w-4 h-4 text-cyan-400" />
            <span>کارپێکردنە خۆکارەکان و زنجیرەی فەرمان (Workflows)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Workflows */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {workflows.map((wf) => {
            const isRunning = runningId === wf.id;
            const isSuccess = completedId === wf.id;

            return (
              <div
                key={wf.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-200 text-sm">{wf.name}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{wf.description}</div>
                  </div>
                  <button
                    onClick={() => handleRun(wf)}
                    disabled={isRunning}
                    className={`px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                      isSuccess
                        ? 'bg-emerald-600 text-white'
                        : isRunning
                        ? 'bg-cyan-800 text-cyan-200 cursor-wait'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:opacity-95'
                    }`}
                  >
                    {isSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تەواوبوو!</span>
                      </>
                    ) : isRunning ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>جێبەجێدەکرێت...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>دەستپێکردن</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Workflow Nodes Chain */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/80">
                  {wf.nodes.map((node, index) => (
                    <React.Fragment key={node.id}>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-cyan-300">
                        {node.title}
                      </span>
                      {index < wf.nodes.length - 1 && (
                        <span className="text-slate-600 text-xs">←</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
