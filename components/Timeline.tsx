import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { DEFAULT_COVERS } from '../App';

interface TimelineProps {
  tasks: Task[];
  categories: Array<{ name: string; color: string; border: string; text: string; bg: string }>;
  onTaskClick: (task: Task) => void;
  readonly?: boolean;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

type ViewMode = 'Day' | 'Month';

const Timeline: React.FC<TimelineProps> = ({ tasks, categories, onTaskClick, readonly = false, selectedCategory, onCategorySelect }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('Day');

  const handleCategoryClick = (category: string) => {
    onCategorySelect(category);
  };

  const filteredTasks = useMemo(() => {
    if (selectedCategory === 'All Categories') return tasks;
    if (selectedCategory === 'Favorites') return tasks.filter(t => t.favorite);
    return tasks.filter(t => t.category === selectedCategory);
  }, [tasks, selectedCategory]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());

    sortedTasks.forEach(task => {
      const date = new Date(task.dateStr);
      let key = task.dateStr;
      if (viewMode === 'Month') {
        key = `${date.toLocaleDateString('en-US', { month: 'long' })}, ${date.getFullYear()}`;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });
    return groups;
  }, [filteredTasks, viewMode]);

  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedTasks).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [groupedTasks]);

  const getCategoryStyles = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    return cat || { color: 'bg-slate-400', border: 'border-slate-200', text: 'text-slate-700', bg: 'bg-slate-50' };
  };

  const getIconForCategory = (catName: string) => {
    switch (catName) {
      case 'Personal': return 'person';
      case 'Learning': return 'school';
      case 'Health': return 'health_and_safety';
      case 'Urgent': return 'notification_important';
      case 'Gaming': return 'sports_esports';
      case 'Product': return 'inventory_2';
      default: return 'task';
    }
  };

  const displayCategories = categories.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ─── Page Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-slide-up">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Timeline View</h2>
          <p className="text-slate-400 font-medium mt-1">Your personal productivity roadmap</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100/80 p-1 rounded-xl">
            {(['Day', 'Month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === mode
                  ? 'bg-white shadow-sm text-primary ring-1 ring-orange-100'
                  : 'text-slate-400 hover:text-primary hover:bg-white/50'
                  }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Category Filters ─── */}
      <div className="flex gap-2.5 mb-10 overflow-x-auto pb-3 scrollbar-hide animate-slide-up stagger-1">
        <button
          onClick={() => handleCategoryClick('All Categories')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === 'All Categories'
            ? 'bg-primary text-white shadow-md shadow-orange-500/20'
            : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-orange-50 hover:text-primary hover:border-orange-200'}`}
        >
          <span className={`material-symbols-outlined text-[16px] ${selectedCategory === 'All Categories' ? 'text-white' : 'text-primary'}`}>apps</span>
          All Categories
        </button>
        <button
          onClick={() => handleCategoryClick('Favorites')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${selectedCategory === 'Favorites'
            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
            : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'}`}
        >
          <span className={`material-symbols-outlined text-[16px] ${selectedCategory === 'Favorites' ? 'text-white' : 'text-amber-500'}`}>grade</span>
          Favorites
        </button>
        {displayCategories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat.name
              ? 'bg-primary text-white shadow-md shadow-orange-500/20'
              : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-orange-50 hover:text-primary hover:border-orange-200'}`}
          >
            <span className={`material-symbols-outlined text-[16px] ${selectedCategory === cat.name ? 'text-white' : cat.text}`}>{getIconForCategory(cat.name)}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* ─── Timeline Content ─── */}
      <div className="relative">
        {/* Timeline vertical line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gradient-to-b from-orange-200 via-orange-100 to-transparent hidden md:block"></div>

        <div className="space-y-10">
          {sortedGroupKeys.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-orange-300">event_available</span>
              </div>
              <h3 className="text-lg font-bold text-slate-400 mb-1">No tasks found</h3>
              <p className="text-sm text-slate-300 mb-4">Create a new task to get started</p>
              {!readonly && (
                <p className="text-xs font-medium text-slate-400">Use the floating + button to create your first task</p>
              )}
            </div>
          ) : (
            sortedGroupKeys.map((dateStr, groupIdx) => {
              const tasksForDay = groupedTasks[dateStr];
              const dateParts = dateStr.split(',');
              const mainDate = dateParts[0];
              const year = dateParts.length > 1 ? dateParts[1] : '';

              return (
                <section key={dateStr} className={`relative z-10 animate-slide-up stagger-${Math.min(groupIdx + 1, 6)}`}>
                  {/* Date header with timeline dot */}
                  <div className="flex items-center mb-5 md:pl-8">
                    {/* Timeline dot */}
                    <div className="absolute left-0 w-6 h-6 rounded-full bg-white border-[3px] border-orange-300 hidden md:flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900">{mainDate}{year && ','}</span>
                      {year && <span className="text-xl font-black text-primary">{year}</span>}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-orange-200/50 to-transparent ml-5"></div>
                  </div>

                  {/* Task cards */}
                  <div className="space-y-3 md:pl-8">
                    {tasksForDay.map(task => {
                      const styles = getCategoryStyles(task.category);

                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className={`bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-soft hover:shadow-glow hover:border-orange-200/60 transition-all duration-300 group relative cursor-pointer overflow-hidden hover-lift`}
                        >
                          {/* Left category accent bar */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.color} rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                          {/* Cover Image Background */}
                          {(() => {
                            const displayCover = task.cover || DEFAULT_COVERS[task.category] || DEFAULT_COVERS['DEFAULT'];
                            if (!displayCover) return null;
                            return (
                              <div className="absolute inset-0 z-0">
                                <img
                                  src={displayCover}
                                  className="w-full h-full object-cover opacity-25 transition-all duration-700 group-hover:scale-105 group-hover:opacity-30"
                                  alt="cover"
                                  style={{ objectPosition: `center ${task.coverPosition || 50}%` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-white/40" />
                              </div>
                            );
                          })()}

                          <div className="p-5 pr-14 relative z-10">
                            {/* Top Row: Date & Priority */}
                            <div className="flex items-center gap-2 mb-3 text-[11px] font-bold whitespace-nowrap">
                              <span className="flex items-center gap-1.5 text-slate-400">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                <span>
                                  {task.dateStr}
                                  {task.endDateStr && ` - ${task.endDateStr}`}
                                </span>
                              </span>
                              <span className="text-slate-200">•</span>
                              <span className={`uppercase tracking-wider px-2 py-0.5 rounded-md text-[10px]
                                ${task.priority === 'High' ? 'text-red-600 bg-red-50' :
                                  task.priority === 'Medium' ? 'text-orange-600 bg-orange-50' :
                                    'text-slate-500 bg-slate-50'}`}>
                                {task.priority || 'Low'}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight mb-1.5">
                              {task.title}
                            </h3>

                            {/* Description */}
                            {task.description && (
                              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Status Icon - Top Right */}
                          {task.status === 'Done' && (
                            <div className="absolute top-4 right-4 z-10">
                              <span className="material-symbols-outlined text-emerald-400 text-2xl">check_circle</span>
                            </div>
                          )}

                          {/* Category Icon - Bottom Right */}
                          <div className={`absolute bottom-4 right-4 h-9 w-9 rounded-xl ${styles.bg} flex items-center justify-center ${styles.text} border ${styles.border} transition-all group-hover:scale-110 shadow-sm z-10`}>
                            <span className="material-symbols-outlined text-[18px]">{getIconForCategory(task.category)}</span>
                          </div>

                          {/* Progress Bar */}
                          {task.status === 'In Progress' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50 rounded-b-2xl overflow-hidden">
                              <div className={`h-full w-2/3 ${styles.color} opacity-70 rounded-full`}></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
