import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Task } from '../types';
import { DEFAULT_COVERS } from '../App';

interface HomeProps {
  tasks: Task[];
  categories: Array<{ name: string; color: string; border: string; text: string; bg: string }>;
  onTaskClick: (task: Task) => void;
}

const getRecentTaskIds = (): string[] => {
  try {
    const data = localStorage.getItem('recent_tasks');
    if (data) return JSON.parse(data);
  } catch (_) {
    // ignore invalid local storage
  }
  return [];
};

const Home: React.FC<HomeProps> = ({ tasks, categories, onTaskClick }) => {
  const [recentTaskIds, setRecentTaskIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    setRecentTaskIds(getRecentTaskIds());
    const handleStorageChange = () => setRecentTaskIds(getRecentTaskIds());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const recentTasks = useMemo(() => {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    return recentTaskIds.map(id => taskMap.get(id)).filter(Boolean) as Task[];
  }, [recentTaskIds, tasks]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [recentTasks]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const stats = useMemo(() => {
    const done = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const todo = tasks.filter(t => t.status === 'ToDo').length;
    return { done, inProgress, todo };
  }, [tasks]);

  const myTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'Done')
      .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())
      .slice(0, 8);
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks
      .filter(t => t.status === 'Done')
      .sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime())
      .slice(0, 10);
  }, [tasks]);

  const getCategoryIcon = (catName: string) => {
    switch (catName) {
      case 'Personal': return 'person';
      case 'Learning': return 'school';
      case 'Health': return 'health_and_safety';
      case 'Urgent': return 'notification_important';
      case 'Design': return 'brush';
      case 'Product': return 'inventory_2';
      default: return 'task';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-2xl p-8 mb-8 animate-slide-up" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c, #f59e0b)' }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-6 -right-20 w-56 h-56 bg-white/5 rounded-full"></div>
        <div className="absolute top-4 right-32 w-16 h-16 bg-white/10 rounded-full"></div>

        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium mb-1">{dateStr}</p>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">{greeting} 👋</h2>
          <p className="text-orange-100/80 text-sm max-w-md">
            You have <span className="text-white font-bold">{stats.todo} tasks</span> to complete and <span className="text-white font-bold">{stats.inProgress} in progress</span>.
          </p>
        </div>
      </div>

      {recentTasks.length > 0 && (
        <section className="mb-10 animate-slide-up stagger-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[16px] text-orange-500">history</span>
            Recently Viewed
          </h3>
          <div className="relative group">
            {showLeftArrow && (
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
            )}
            {showRightArrow && (
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            )}
            <div ref={scrollRef} onScroll={checkScroll} className="flex gap-4 overflow-x-auto pt-2 pb-4 px-1 -mx-1 custom-scrollbar snap-x snap-mandatory hide-scrollbar-on-mobile w-full scroll-smooth">
              {recentTasks.map(task => {
                const displayCover = task.cover || DEFAULT_COVERS[task.category] || DEFAULT_COVERS.DEFAULT;
                const category = categories.find(c => c.name === task.category);
                const endDateLabel = task.endDateStr || task.dateStr;
                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="snap-start flex-shrink-0 w-40 h-40 rounded-2xl border border-slate-200 overflow-hidden relative cursor-pointer group hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 transition-all bg-white hover:-translate-y-1"
                  >
                    <div className="h-1/3 relative">
                      <img
                        src={displayCover}
                        alt="Task cover"
                        className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                        style={{ objectPosition: `center ${task.coverPosition ?? 50}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/12 via-transparent to-transparent" />
                    </div>
                    <div className="absolute left-3 top-1/3 -translate-y-1/2 flex items-center justify-center">
                      <span className={`material-symbols-outlined text-[20px] drop-shadow-sm ${category?.text || 'text-slate-500'}`}>
                        {getCategoryIcon(task.category)}
                      </span>
                    </div>
                    <div className="h-2/3 bg-white px-3 pb-2 pt-6 flex flex-col">
                      <h4 className="text-[14px] leading-tight font-bold text-slate-800 line-clamp-2 mb-auto">{task.title || 'Untitled Task'}</h4>
                      <div className="mt-2 flex items-center gap-1.5 text-slate-400">
                        <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px]">event_upcoming</span>
                        </span>
                        <span className="text-[11px] font-medium truncate">{endDateLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="mb-10 animate-slide-up stagger-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-blue-500">task_alt</span>
            My Tasks
          </h3>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{myTasks.length} active</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {myTasks.length === 0 ? (
            <div className="col-span-full rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No active tasks.</div>
          ) : myTasks.map((task) => {
            const cat = categories.find(c => c.name === task.category);
            return (
              <button
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-orange-200 hover:bg-orange-50/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-semibold text-slate-900 truncate">{task.title}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${task.status === 'In Progress' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>{task.status}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{task.description || 'No summary'}</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                  <span className={`inline-flex items-center gap-1 ${cat?.text || 'text-slate-500'}`}>
                    <span className="material-symbols-outlined text-[13px]">label</span>
                    {task.category}
                  </span>
                  <span>•</span>
                  <span>{task.dateStr}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="animate-slide-up stagger-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
            Completed
          </h3>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{stats.done} done</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50/70">
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px]">title</span>
              Title
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px]">category</span>
              Category
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px]">calendar_today</span>
              Date
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px]">flag</span>
              Priority
            </span>
          </div>
          {completedTasks.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">No completed tasks yet.</div>
          ) : completedTasks.map(task => {
            const category = categories.find(c => c.name === task.category);
            return (
              <button
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="w-full grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 text-sm text-slate-700 border-b border-slate-100 last:border-b-0 hover:bg-orange-50/30 transition-colors text-left cursor-pointer items-center"
              >
                <span className="truncate font-semibold text-slate-800">{task.title}</span>
                <span className="inline-flex items-center">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${category?.bg || 'bg-slate-100'} ${category?.text || 'text-slate-600'}`}>
                    {task.category}
                  </span>
                </span>
                <span className="inline-flex items-center text-[11px] font-medium text-slate-500">
                  <span className="truncate">{task.dateStr}{task.endDateStr ? ` - ${task.endDateStr}` : ''}</span>
                </span>
                <span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${task.priority === 'High'
                      ? 'bg-red-50 text-red-600'
                      : task.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                    {task.priority || 'Low'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <style>{`
        .hide-scrollbar-on-mobile::-webkit-scrollbar { display: none; }
        .hide-scrollbar-on-mobile { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Home;
