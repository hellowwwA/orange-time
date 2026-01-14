import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { StatCardProps, Task } from '../types';

interface DashboardProps {
  tasks: Task[];
  categories: Array<{ name: string; color: string; border: string; text: string; bg: string }>;
}

const COLORS = ['#f97316', '#e2e8f0'];

const Dashboard: React.FC<DashboardProps> = ({ tasks, categories }) => {

  // 1. Calculate Status Counts for Pie Chart and Stats
  const statusCounts = useMemo(() => {
    const counts = {
      done: 0,
      inProgress: 0,
      todo: 0,
      total: tasks.length
    };
    tasks.forEach(t => {
      if (t.status === 'Done') counts.done++;
      else if (t.status === 'In Progress') counts.inProgress++;
      else counts.todo++;
    });
    return counts;
  }, [tasks]);

  // Pie Chart Data
  const pieData = [
    { name: 'Done', value: statusCounts.done },
    { name: 'Remaining', value: statusCounts.total - statusCounts.done },
  ];

  // Percentage for the center of the pie chart
  const completionPercentage = statusCounts.total > 0
    ? Math.round((statusCounts.done / statusCounts.total) * 100)
    : 0;

  // 2. Calculate Category Distribution
  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const count = tasks.filter(t => t.category === cat.name).length;
      const percent = statusCounts.total > 0 ? (count / statusCounts.total) * 100 : 0;
      return {
        name: cat.name,
        tasks: count,
        percent: percent,
        // Map the tailwind color classes to the bar color. 
        // Using a safe default or mapping based on the 'bg-' class provided in global config
        color: cat.color.replace('bg-', 'bg-') // essentially keeping the bg class passed in
      };
    }).sort((a, b) => b.tasks - a.tasks); // Sort by most tasks
  }, [tasks, categories, statusCounts.total]);

  // 3. Dynamic Stats Cards
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
      colorClass: 'text-orange-400 border-l-orange-400',
      subtext: 'Currently active',
      subtextIcon: 'person'
    },
    {
      title: 'Completed',
      value: statusCounts.done.toString().padStart(2, '0'),
      icon: 'check_circle',
      colorClass: 'text-orange-300 border-l-orange-300',
      subtext: `${completionPercentage}% completion rate`,
      subtextIcon: 'verified'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">
          <span>Tasks</span>
          <span className="text-slate-300">/</span>
          <span className="text-primary">Status Dashboard</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Status Overview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Circular Chart Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-10">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Overall Completion</h3>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-bold text-slate-900 leading-none">{completionPercentage}%</span>
              <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Goal: 100%</p>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              <span className="text-[11px] font-medium text-slate-500">Done ({statusCounts.done})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              <span className="text-[11px] font-medium text-slate-500">Remaining ({statusCounts.total - statusCounts.done})</span>
            </div>
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Distribution by Category</h3>
            <button className="text-xs text-primary font-bold hover:underline">Export Data</button>
          </div>
          <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-900">{cat.name}</span>
                  <span className="text-slate-500">{cat.tasks} tasks</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${cat.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 ${stat.colorClass.split(' ')[1]}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">{stat.title}</p>
                <h4 className="text-3xl font-extrabold text-slate-900">{stat.value}</h4>
              </div>
              <span className={`material-symbols-outlined ${stat.colorClass.split(' ')[0]}`}>{stat.icon}</span>
            </div>
            <p className={`text-[10px] font-medium mt-4 flex items-center gap-1 ${stat.title === 'Completed' ? 'text-primary font-bold' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-[12px]">{stat.subtextIcon}</span>
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;