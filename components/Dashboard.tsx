import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { StatCardProps, Task } from '../types';

interface DashboardProps {
  tasks: Task[];
  categories: Array<{ name: string; color: string; border: string; text: string; bg: string }>;
}

const COLORS = ['#f97316', '#e2e8f0'];

const Dashboard: React.FC<DashboardProps> = ({ tasks, categories }) => {

  // 1. Calculate Status Counts
  const statusCounts = useMemo(() => {
    const counts = { done: 0, inProgress: 0, todo: 0, total: tasks.length };
    tasks.forEach(t => {
      if (t.status === 'Done') counts.done++;
      else if (t.status === 'In Progress') counts.inProgress++;
      else counts.todo++;
    });
    return counts;
  }, [tasks]);

  const pieData = [
    { name: 'Done', value: statusCounts.done },
    { name: 'Remaining', value: statusCounts.total - statusCounts.done },
  ];

  const completionPercentage = statusCounts.total > 0
    ? Math.round((statusCounts.done / statusCounts.total) * 100)
    : 0;

  // 2. Category Distribution
  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const count = tasks.filter(t => t.category === cat.name).length;
      const percent = statusCounts.total > 0 ? (count / statusCounts.total) * 100 : 0;
      return { name: cat.name, tasks: count, percent, color: cat.color };
    }).sort((a, b) => b.tasks - a.tasks);
  }, [tasks, categories, statusCounts.total]);

  // 3. Stats Cards
  const stats: StatCardProps[] = [
    {
      title: 'Total Tasks',
      value: statusCounts.total.toString().padStart(2, '0'),
      icon: 'inventory_2',
      colorClass: 'text-slate-700 border-l-slate-700',
      subtext: 'Across all categories',
      subtextIcon: 'dataset'
    },
    {
      title: 'To Do',
      value: statusCounts.todo.toString().padStart(2, '0'),
      icon: 'list_alt',
      colorClass: 'text-orange-500 border-l-orange-500',
      subtext: 'Pending actions',
      subtextIcon: 'schedule'
    },
    {
      title: 'In Progress',
      value: statusCounts.inProgress.toString().padStart(2, '0'),
      icon: 'sync',
      colorClass: 'text-amber-500 border-l-amber-500',
      subtext: 'Currently active',
      subtextIcon: 'person'
    },
    {
      title: 'Completed',
      value: statusCounts.done.toString().padStart(2, '0'),
      icon: 'check_circle',
      colorClass: 'text-emerald-500 border-l-emerald-500',
      subtext: `${completionPercentage}% completion rate`,
      subtextIcon: 'verified'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ─── Breadcrumb ─── */}
      <div className="mb-4 animate-slide-up stagger-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">
          <span>Tasks</span>
          <span className="text-slate-300">/</span>
          <span className="text-primary">Status Dashboard</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Status Overview</h2>
      </div>


      {/* ─── Charts Section ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

        {/* Circular Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col items-center justify-center py-10 animate-slide-up stagger-2 hover-lift cursor-default">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Overall Completion</h3>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={82}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-black text-slate-900 leading-none animate-count-up">{completionPercentage}%</span>
              <p className="text-[10px] text-slate-400 uppercase font-bold mt-1.5 tracking-wider">Goal: 100%</p>
            </div>
          </div>
          <div className="mt-8 flex gap-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-orange-500/30"></div>
              <span className="text-[11px] font-semibold text-slate-500">Done ({statusCounts.done})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              <span className="text-[11px] font-semibold text-slate-500">Remaining ({statusCounts.total - statusCounts.done})</span>
            </div>
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-soft animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Distribution by Category</h3>
            <button className="text-xs text-primary font-bold hover:underline cursor-pointer transition-colors hover:text-primary-hover">Export Data</button>
          </div>
          <div className="space-y-5 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
            {categoryStats.map((cat, i) => (
              <div key={cat.name} className="group cursor-default">
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-slate-800 font-semibold group-hover:text-primary transition-colors">{cat.name}</span>
                  <span className="text-slate-400 group-hover:text-slate-600 transition-colors">{cat.tasks} tasks · {Math.round(cat.percent)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-1000 group-hover:opacity-80`}
                    style={{ width: `${cat.percent}%`, transitionDelay: `${i * 100}ms` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className={`relative bg-white p-6 rounded-2xl border border-slate-100 shadow-soft border-l-4 ${stat.colorClass.split(' ')[1]} hover-lift cursor-default overflow-hidden animate-slide-up stagger-${i + 3}`}
          >
            {/* Decorative background icon */}
            <div className="absolute -bottom-2 -right-2 opacity-[0.04]">
              <span className={`material-symbols-outlined text-7xl ${stat.colorClass.split(' ')[0]}`} style={{ fontSize: '80px' }}>{stat.icon}</span>
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{stat.title}</p>
                <h4 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.colorClass.split(' ')[0]} bg-opacity-10`}
                style={{ backgroundColor: stat.colorClass.includes('orange') ? '#fff7ed' : stat.colorClass.includes('amber') ? '#fffbeb' : stat.colorClass.includes('emerald') ? '#ecfdf5' : '#f1f5f9' }}>
                <span className={`material-symbols-outlined text-xl ${stat.colorClass.split(' ')[0]}`}>{stat.icon}</span>
              </div>
            </div>
            <p className={`relative z-10 text-[11px] font-medium mt-4 flex items-center gap-1.5 ${stat.title === 'Completed' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
              <span className="material-symbols-outlined text-[13px]">{stat.subtextIcon}</span>
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;
