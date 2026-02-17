import React from 'react';
import { Task } from '../types';
import MarkdownWithToc from './MarkdownWithToc';

interface TaskViewProps {
  task: Task | null;
  canEdit?: boolean;
  onEdit?: () => void;
}

const TaskView: React.FC<TaskViewProps> = ({ task, canEdit = false, onEdit }) => {
  if (!task) {
    return (
      <div className="w-full max-w-[90%] mx-auto px-6 py-10 bg-white min-h-[calc(100vh-80px)] shadow-soft my-6 rounded-2xl border border-slate-100">
        <p className="text-slate-500 text-sm">No task selected.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[90%] mx-auto px-6 py-8 bg-white min-h-[calc(100vh-80px)] shadow-soft my-6 rounded-2xl border border-slate-100 animate-slide-up relative text-sm">
      <header className="mb-6">
        <div className="relative flex items-start justify-between gap-4 p-4 rounded-2xl border border-orange-100/70 bg-gradient-to-br from-orange-50 via-white to-amber-50/40 shadow-[0_8px_24px_-18px_rgba(249,115,22,0.45)] overflow-hidden">
          {task.cover && (
            <>
              <img
                src={task.cover}
                alt="Task cover"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: `center ${task.coverPosition ?? 50}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/55 via-slate-900/40 to-slate-900/15" />
            </>
          )}
          <div className="relative z-10">
            <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${task.cover ? 'text-orange-200' : 'text-orange-400'}`}>Task Detail</p>
            <h2 className={`text-4xl font-black tracking-tight break-words ${task.cover ? 'text-white' : 'text-slate-900'}`}>{task.title}</h2>
          </div>
          {canEdit && (
            <button
              onClick={onEdit}
              className={`relative z-10 shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${task.cover ? 'bg-white/90 hover:bg-white text-slate-800 shadow-slate-900/10' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/25'}`}
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit Task
            </button>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-2xl border border-orange-100/80 bg-gradient-to-br from-orange-50 via-white to-orange-50/30 px-4 py-3 shadow-[0_8px_20px_-16px_rgba(249,115,22,0.4)] transition-all hover:shadow-[0_10px_24px_-14px_rgba(249,115,22,0.45)]">
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-orange-400">category</span>
            Category
          </p>
          <p className="text-slate-800 font-semibold">{task.category}</p>
          <p className="text-xs text-slate-500 mt-1">Task classification</p>
        </div>
        <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/20 px-4 py-3 shadow-[0_8px_20px_-16px_rgba(59,130,246,0.35)] transition-all hover:shadow-[0_10px_24px_-14px_rgba(59,130,246,0.4)]">
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-blue-400">calendar_today</span>
            Date
          </p>
          <p className="text-slate-800 font-semibold">
            {task.dateStr}
            {task.endDateStr ? ` - ${task.endDateStr}` : ''}
          </p>
          <p className="text-xs text-slate-500 mt-1">Planned timeline</p>
        </div>
        <div className="rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/20 px-4 py-3 shadow-[0_8px_20px_-16px_rgba(16,185,129,0.35)] transition-all hover:shadow-[0_10px_24px_-14px_rgba(16,185,129,0.4)]">
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
            Status
          </p>
          <p className="text-slate-800 font-semibold">{task.status}</p>
          <p className="text-xs text-slate-500 mt-1">Current progress</p>
        </div>
        <div className="rounded-2xl border border-red-100/80 bg-gradient-to-br from-red-50/70 via-white to-red-50/20 px-4 py-3 shadow-[0_8px_20px_-16px_rgba(239,68,68,0.35)] transition-all hover:shadow-[0_10px_24px_-14px_rgba(239,68,68,0.4)]">
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-red-400">flag</span>
            Priority
          </p>
          <p className="text-slate-800 font-semibold">{task.priority || 'Low'}</p>
          <p className="text-xs text-slate-500 mt-1">Urgency level</p>
        </div>
      </section>

      {task.description && (
        <section className="mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Summary</h3>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 leading-relaxed shadow-[0_6px_18px_-16px_rgba(15,23,42,0.4)]">
            {task.description}
          </div>
        </section>
      )}

      {task.content && (
        <section>
          <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Content</h3>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
            <MarkdownWithToc content={task.content} editorId="task-view-preview" minHeightClassName="min-h-[300px]" />
          </div>
        </section>
      )}
    </div>
  );
};

export default TaskView;
