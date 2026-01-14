import React, { useState, useMemo } from 'react';
import { Task } from '../types';

interface TimelineProps {
  tasks: Task[];
  categories: Array<{ name: string; color: string; border: string; text: string; bg: string }>;
  onTaskClick: (task: Task) => void;
  onCreateNew: () => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

type ViewMode = 'Day' | 'Month';

const Timeline: React.FC<TimelineProps> = ({ tasks, categories, onTaskClick, onCreateNew, selectedCategory, onCategorySelect }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('Day');

  const handleCategoryClick = (category: string) => {
    onCategorySelect(category);
  };

  const filteredTasks = useMemo(() => {
    if (selectedCategory === 'All Categories') return tasks;
    return tasks.filter(t => t.category === selectedCategory);
  }, [tasks, selectedCategory]);

  // Group by Date for display based on ViewMode
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};

    // Sort tasks by date first to ensure internal order
    const sortedTasks = [...filteredTasks].sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());

    sortedTasks.forEach(task => {
      const date = new Date(task.dateStr);
      let key = task.dateStr; // Default Day format

      if (viewMode === 'Month') {
        const monthStr = date.toLocaleDateString('en-US', { month: 'long' });
        const yearStr = date.getFullYear();
        // Format: "January, 2026"
        key = `${monthStr}, ${yearStr}`;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(task);
    });
    return groups;
  }, [filteredTasks, viewMode]);

  // Ensure groups are sorted chronologically
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedTasks).sort((a, b) => {
      // Parse key back to date for sorting
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
  }, [groupedTasks]);

  const getCategoryStyles = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    return cat || { color: 'bg-slate-400', border: 'border-slate-200', text: 'text-slate-700', bg: 'bg-slate-50' };
  };

  const getIconForCategory = (catName: string) => {
    switch (catName) {
      case 'Personal': return 'image';
      case 'Learning': return 'auto_stories';
      case 'Health': return 'medical_services';
      case 'Urgent': return 'priority_high';
      case 'Design': return 'palette';
      case 'Product': return 'rocket_launch';
      default: return 'task';
    }
  };

  // Only show first 5 categories to fit UI, or use scroll
  const displayCategories = categories.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Timeline View</h2>
          <p className="text-slate-500 font-medium mt-1">Your personal productivity roadmap</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-orange-100/40 p-1 rounded-xl backdrop-blur-sm">
            {(['Day', 'Month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === mode
                  ? 'bg-white/80 shadow-sm text-primary ring-1 ring-orange-100'
                  : 'text-slate-500 hover:text-primary hover:bg-white/30'
                  }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 bg-white/60 hover:bg-white text-orange-600 border border-orange-200/60 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm hover:shadow-md hover:text-orange-500"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Task
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        <button
          onClick={() => handleCategoryClick('All Categories')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-sm transition-all ${selectedCategory === 'All Categories' ? 'bg-[#E04F00] text-white shadow-orange-500/20' : 'bg-white/60 backdrop-blur-sm text-slate-600 border border-slate-200/60 hover:bg-orange-50/50 hover:border-orange-200/60'}`}
        >
          {/* Dot for All Categories: White when active for contrast against orange */}
          <span className={`w-2.5 h-2.5 rounded-full ${selectedCategory === 'All Categories' ? 'bg-white' : 'bg-slate-900'}`}></span>
          All Categories
        </button>
        {displayCategories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap shadow-sm ${selectedCategory === cat.name ? 'text-white shadow-orange-500/30 border border-transparent' : 'bg-white/60 backdrop-blur-sm hover:bg-orange-50/50 border border-slate-200/60 text-slate-600'}`}
            style={selectedCategory === cat.name ? { backgroundColor: '#E04F00' } : {}}
          >
            <span className={`material-symbols-outlined text-[16px] ${selectedCategory === cat.name ? 'text-white' : cat.text}`}>{getIconForCategory(cat.name)}</span> {cat.name}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="space-y-10">

          {sortedGroupKeys.map((dateStr) => {
            const tasksForDay = groupedTasks[dateStr];
            const dateParts = dateStr.split(',');
            const mainDate = dateParts[0];
            const year = dateParts.length > 1 ? dateParts[1] : '';

            return (
              <section key={dateStr} className="relative z-10">
                <div className="flex items-center mb-5">
                  <div className="relative flex items-center">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900">{mainDate}{year && ','}</span>
                      {year && <span className="text-xl font-black text-primary">{year}</span>}
                    </div>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-orange-200/50 to-transparent ml-6"></div>
                </div>

                <div className="space-y-4">
                  {tasksForDay.map(task => {
                    const styles = getCategoryStyles(task.category);
                    // Lighten border for glass effect
                    const borderColor = styles.border.replace('border-', 'border-opacity-50 ');

                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`bg-white/60 backdrop-blur-md border ${borderColor} ${styles.border} rounded-2xl shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:border-primary/30 transition-all duration-300 group relative cursor-pointer overflow-hidden`}
                      >

                        <div className="p-5 pr-12">
                          {/* Top Row: Date & Priority */}
                          <div className="flex items-center gap-2 mb-3 text-[11px] font-bold whitespace-nowrap">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                              <span>
                                {task.dateStr}
                                {task.endDateStr && ` - ${task.endDateStr}`}
                              </span>
                            </span>

                            <span className="text-slate-300">•</span>

                            {/* Priority Badge - Borderless */}
                            <span className={`uppercase tracking-wide 
                                    ${task.priority === 'High' ? 'text-red-600' :
                                task.priority === 'Medium' ? 'text-orange-600' :
                                  'text-slate-500'}`}>
                              {task.priority || 'Low'}
                            </span>
                          </div>

                          {/* Title & Category Icon */}
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
                              {task.title}
                            </h3>
                          </div>

                          {/* Description */}
                          <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">
                            {task.description}
                          </p>
                        </div>

                        {/* Top Right Status Icon */}
                        {task.status === 'Done' && (
                          <div className="absolute top-4 right-4">
                            <span className="material-symbols-outlined text-green-400 text-2xl">check_circle</span>
                          </div>
                        )}

                        {/* Bottom Right Category Icon */}
                        <div className={`absolute bottom-4 right-4 h-8 w-8 rounded-lg ${styles.bg} flex items-center justify-center ${styles.text} border ${styles.border} transition-transform group-hover:scale-105 shadow-sm bg-opacity-80`}>
                          <span className="material-symbols-outlined text-[18px]">{getIconForCategory(task.category)}</span>
                        </div>

                        {/* In Progress Bar */}
                        {task.status === 'In Progress' && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50/50 rounded-b-2xl overflow-hidden">
                            <div className={`h-full w-2/3 ${styles.color} opacity-80`}></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )
          })}

        </div>
      </div>
    </div>
  );
};

export default Timeline;