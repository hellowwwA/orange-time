import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import TaskEditor from './components/TaskEditor';
import Tooltip from './components/Tooltip';
import Snowfall from './components/Snowfall';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { ViewState, Task } from './types';
import { getCurrentUser, logout, User } from './utils/auth'; // Import auth utilities

// Global Categories Configuration
export const CATEGORIES = [
  // Personal updated to Hermes Orange (#f37021)
  { name: 'Personal', color: 'bg-[#f37021]', border: 'border-[#f37021]/30', text: 'text-[#f37021]', bg: 'bg-[#f37021]/10' },
  { name: 'Learning', color: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-700', bg: 'bg-blue-50' },
  { name: 'Health', color: 'bg-green-500', border: 'border-green-200', text: 'text-green-700', bg: 'bg-green-50' },
  { name: 'Urgent', color: 'bg-red-500', border: 'border-red-200', text: 'text-red-700', bg: 'bg-red-50' },
  { name: 'Design', color: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-700', bg: 'bg-purple-50' },
  { name: 'Product', color: 'bg-indigo-500', border: 'border-indigo-200', text: 'text-indigo-700', bg: 'bg-indigo-50' },
];

// Mock Data Generator
const generateMockTasks = (): Task[] => {
  const cats = ['Personal', 'Learning', 'Health', 'Urgent'];
  const tasks: Task[] = [];
  const baseDate = new Date();

  // Generate current tasks
  cats.forEach((cat, catIndex) => {
    for (let i = 0; i < 3; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + (i * 3));

      const hour = 9 + i;
      const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      const endTimeStr = `${hour + 1 > 12 ? hour + 1 - 12 : hour + 1}:00 ${hour + 1 >= 12 ? 'PM' : 'AM'}`;

      tasks.push({
        id: `${cat}-${i}`,
        title: `${cat} Task ${i + 1}: ${['Review', 'Analyze', 'Create'][i % 3]} ${['Reports', 'Design', 'Code'][i % 3]}`,
        category: cat as any,
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        endDateStr: new Date(date.getTime() + (2 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        startTime: timeStr,
        endTime: endTimeStr,
        description: `This is a generated description for ${cat} task number ${i + 1}.`,
        status: i % 3 === 0 ? 'Done' : i % 3 === 1 ? 'In Progress' : 'ToDo',
        priority: i % 3 === 0 ? 'High' : 'Medium',
        content: `Detailed notes for ${cat} Task ${i + 1}.\n\nEnsure the following steps are completed:\n- Initial assessment\n- Execution phase\n- Review and finalize`
      });
    }
  });

  // Mock June 2026 Data
  tasks.push(
    {
      id: 'june-26-1',
      title: 'Summer Product Launch v2.0',
      category: 'Product',
      dateStr: 'Jun 05, 2026',
      description: 'Official release of the new mobile application including new AI features.',
      status: 'ToDo',
      priority: 'High',
      content: 'Launch Checklist:\n1. App Store Submission\n2. Press Release\n3. Social Media Campaign'
    },
    {
      id: 'june-26-2',
      title: 'Advanced UX Workshop',
      category: 'Design',
      dateStr: 'Jun 12, 2026',
      description: 'Attending the 3-day workshop on micro-interactions and accessibility.',
      status: 'ToDo',
      priority: 'Medium',
      content: 'Bring portfolio for review.'
    },
    {
      id: 'june-26-3',
      title: 'Annual Health Checkup',
      category: 'Health',
      dateStr: 'Jun 15, 2026',
      description: 'Full body checkup at City Medical Center.',
      status: 'ToDo',
      priority: 'High',
      content: 'Fasting required for 12 hours.'
    },
    {
      id: 'june-26-4',
      title: 'Rust Programming Masterclass',
      category: 'Learning',
      dateStr: 'Jun 20, 2026',
      description: 'Start of the 4-week intensive Rust systems programming course.',
      status: 'In Progress',
      priority: 'Medium',
      content: 'Module 1: Ownership and Borrowing'
    },
    {
      id: 'june-26-5',
      title: 'Server Migration',
      category: 'Urgent',
      dateStr: 'Jun 28, 2026',
      description: 'Migrating legacy database to the new cloud cluster.',
      status: 'ToDo',
      priority: 'High',
      content: 'Ensure backup is completed before starting.'
    }
  );

  // Sort by Date Ascending
  return tasks.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
};

/**
 * Main App Component - Protected by authentication
 */
const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [previousView, setPreviousView] = useState<ViewState>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const [timelineCategory, setTimelineCategory] = useState('All Categories');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSnowing, setIsSnowing] = useState(false);

  // User Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load User Data
  useEffect(() => {
    getCurrentUser().then(userData => {
      setUser(userData);
    }).catch(err => console.error('Failed to load user:', err));
  }, []);

  // Close User Menu on Outside Click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      // Manually clear cookie on frontend as a fallback
      document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = '/login'; // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
      // Optional: Show error notification
    }
  };

  // Scroll management
  const mainRef = useRef<HTMLElement>(null);
  const scrollPositionRef = useRef(0);

  // Load tasks from API
  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          setTasks(generateMockTasks());
        }
        setIsDataLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load tasks:', err);
        setTasks(generateMockTasks()); // Fallback
        setIsDataLoaded(true);
      });
  }, []);

  // Save tasks to API
  useEffect(() => {
    if (isDataLoaded) {
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasks)
      }).catch(err => console.error('Failed to save tasks:', err));
    }
  }, [tasks, isDataLoaded]);

  // Handle Scroll Restoration
  useLayoutEffect(() => {
    if (mainRef.current) {
      if (currentView === 'editor') {
        // Entering editor: reset scroll to top
        mainRef.current.scrollTop = 0;
      } else {
        // Returning to previous view: restore scroll
        mainRef.current.scrollTop = scrollPositionRef.current;
      }
    }
  }, [currentView]);

  const handleTaskClick = (task: Task) => {
    if (mainRef.current) {
      scrollPositionRef.current = mainRef.current.scrollTop;
    }
    setEditingTask(task);
    setPreviousView(currentView);
    setCurrentView('editor');
    setShowMoreMenu(false);
  };

  const handleDeleteTask = () => {
    if (!editingTask) return;
    setTasks(prev => prev.filter(t => t.id !== editingTask.id));
    setCurrentView(previousView);
    setShowMoreMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time update handler
  const handleTaskUpdate = (updatedTask: Task) => {
    setEditingTask(updatedTask); // Keep editor in sync
    setTasks(prev => {
      const exists = prev.find(t => t.id === updatedTask.id);
      let newTasks;
      if (exists) {
        newTasks = prev.map(t => t.id === updatedTask.id ? updatedTask : t);
      } else {
        newTasks = [...prev, updatedTask];
      }
      // Keep sorted when updating
      return newTasks.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
    });
  };

  const handleCreateNew = () => {
    if (mainRef.current) {
      scrollPositionRef.current = mainRef.current.scrollTop;
    }
    const newTask: Task = {
      id: `new-${Date.now()}`,
      title: 'Untitled Task',
      category: 'Personal',
      dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: '',
      status: 'ToDo',
      content: ''
    };
    setEditingTask(newTask);
    setPreviousView(currentView);
    setCurrentView('editor');
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans text-slate-800 bg-white relative selection:bg-orange-300 selection:text-orange-900">
      {isSnowing && <Snowfall />}

      {/* Sticky Header - Glass Effect */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-orange-100/40 shadow-[0_4px_30px_-10px_rgba(249,115,22,0.08)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 relative">

            {/* Left: Branding & Back Button */}
            <div className="flex items-center gap-4 absolute left-0">
              {currentView === 'editor' && (
                <button
                  onClick={() => setCurrentView(previousView)}
                  className="p-1 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-orange-50/50"
                  aria-label="Go back"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
              )}

              <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setCurrentView('dashboard')}>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-500 ${currentView === 'editor' ? 'text-primary' : 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-12'}`}>
                  <span className={`material-symbols-outlined text-xl ${currentView === 'editor' ? 'text-inherit' : 'text-white'}`}>nutrition</span>
                </div>
                <h1 className={`text-sm font-black tracking-tight uppercase ${currentView === 'editor' ? 'text-primary' : 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 bg-clip-text text-transparent'}`}>orange time</h1>
              </div>
            </div>

            {/* Center: Search Box (Visible only on Dashboard/Timeline) */}
            {currentView !== 'editor' && (
              <div className="flex-1 max-w-xl mx-auto px-4">
                <div className="relative group w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200/60 bg-white/40 hover:bg-white/70 focus:bg-white/80 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-slate-800 placeholder-slate-400 shadow-sm backdrop-blur-sm"
                    placeholder="Search tasks, categories, or dates..."
                  />
                </div>
              </div>
            )}

            {/* Right: Navigation & Actions */}
            <div className="flex items-center gap-2 absolute right-0">
              {currentView !== 'editor' ? (
                <nav className="flex items-center gap-1 bg-white/30 backdrop-blur-md border border-white/50 p-1 rounded-xl shadow-sm">
                  <Tooltip content={isSnowing ? "Stop Snow" : "Let it Snow"}>
                    <button
                      onClick={() => setIsSnowing(!isSnowing)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${isSnowing ? 'bg-blue-50/80 text-blue-500 shadow-sm' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50/50'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">ac_unit</span>
                    </button>
                  </Tooltip>

                  <div className="w-px h-6 bg-slate-200/50 mx-1"></div>

                  <Tooltip content="Dashboard">
                    <button
                      onClick={() => setCurrentView('dashboard')}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-orange-100/80 text-orange-600 shadow-inner' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50/50'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Timeline">
                    <button
                      onClick={() => setCurrentView('timeline')}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${currentView === 'timeline' ? 'bg-orange-100/80 text-orange-600 shadow-inner' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50/50'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    </button>
                  </Tooltip>
                </nav>
              ) : (
                /* Editor specific actions */
                <div className="flex items-center gap-2">
                  {/* Save Button */}
                  <button
                    onClick={() => setCurrentView(previousView)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30 transition-all mr-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Save
                  </button>

                  <button className="text-slate-400 hover:text-primary p-2 transition-colors rounded-md hover:bg-orange-50/50">
                    <span className="material-symbols-outlined text-[20px]">star</span>
                  </button>
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="text-slate-400 hover:text-primary p-2 transition-colors rounded-md hover:bg-orange-50/50"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>
                    {showMoreMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 animate-fade-in origin-top-right">
                        <button
                          onClick={handleDeleteTask}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Delete Task
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Avatar & Logout - Only Show if User is Logged In */}
              {user && (
                <div className="relative ml-2" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center justify-center transition-all rounded-full hover:ring-2 hover:ring-orange-200"
                    title={user.username}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-8 h-8 rounded-full border border-orange-100 shadow-sm object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm border border-orange-200">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fade-in origin-top-right">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        {currentView === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            categories={CATEGORIES}
          />
        )}
        {currentView === 'timeline' && (
          <Timeline
            tasks={tasks}
            categories={CATEGORIES}
            onTaskClick={handleTaskClick}
            onCreateNew={handleCreateNew}
            selectedCategory={timelineCategory}
            onCategorySelect={setTimelineCategory}
          />
        )}
        {currentView === 'editor' && (
          <TaskEditor
            task={editingTask}
            categories={CATEGORIES}
            onUpdate={handleTaskUpdate}
            onClose={() => setCurrentView(previousView)}
          />
        )}
      </main>


    </div>
  );
};

/**
 * App Component with Routing
 */
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timeline"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;