import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Timeline from './components/Timeline';
import TaskEditor from './components/TaskEditor';
import TaskView from './components/TaskView';
import Tooltip from './components/Tooltip';
import Snowfall from './components/Snowfall';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { ViewState, Task } from './types';
import { disableGuestMode, getCurrentUser, isGuestMode, logout, User } from './utils/auth'; // Import auth utilities

// Global Categories Configuration
const CATEGORIES = [
  // Personal updated to Hermes Orange (#f37021)
  { name: 'Personal', color: 'bg-[#f37021]', border: 'border-[#f37021]/30', text: 'text-[#f37021]', bg: 'bg-[#f37021]/10' },
  { name: 'Learning', color: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-700', bg: 'bg-blue-50' },
  { name: 'Health', color: 'bg-green-500', border: 'border-green-200', text: 'text-green-700', bg: 'bg-green-50' },
  { name: 'Urgent', color: 'bg-red-500', border: 'border-red-200', text: 'text-red-700', bg: 'bg-red-50' },
  { name: 'Design', color: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-700', bg: 'bg-purple-50' },
  { name: 'Product', color: 'bg-indigo-500', border: 'border-indigo-200', text: 'text-indigo-700', bg: 'bg-indigo-50' },
];

export const DEFAULT_COVERS: Record<string, string> = {
  // Current category keys (must match Task.category exactly)
  'Personal': '/default-covers/mialu_2.jpg',
  'Learning': '/default-covers/mialu_4.jpg',
  'Health': '/default-covers/mialu_3.jpg',
  'Urgent': '/default-covers/mialu_1.jpg',
  'Design': '/default-covers/mialu_5.jpg',
  'Product': '/default-covers/mialu_6.jpg',

  // Backward compatibility for legacy category names
  'WORK': '/default-covers/mialu_1.jpg',
  'PERSONAL': '/default-covers/mialu_2.jpg',
  'HEALTH': '/default-covers/mialu_3.jpg',
  'LEARNING': '/default-covers/mialu_4.jpg',
  'FINANCE': '/default-covers/mialu_5.jpg',
  'DEFAULT': '/default-covers/mialu_6.jpg'
};

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
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [previousView, setPreviousView] = useState<ViewState>('home');
  const [viewerReturnView, setViewerReturnView] = useState<ViewState>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Floating Widget State
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);
  const isFirstFilterRenderRef = useRef(true);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetLeaveTimeoutRef = useRef<number | null>(null);

  const expandWidget = (type: 'search' | 'filter') => {
    if (widgetLeaveTimeoutRef.current) {
      window.clearTimeout(widgetLeaveTimeoutRef.current);
      widgetLeaveTimeoutRef.current = null;
    }
    if (type === 'search') {
      setIsSearchExpanded(true);
      setIsFilterExpanded(false);
    } else if (type === 'filter') {
      setIsFilterExpanded(true);
      setIsSearchExpanded(false);
    }
  };

  const clearWidgetTimeout = () => {
    if (widgetLeaveTimeoutRef.current) {
      window.clearTimeout(widgetLeaveTimeoutRef.current);
      widgetLeaveTimeoutRef.current = null;
    }
  };

  const handleWidgetMouseLeave = () => {
    // Add a delay to allow the layout transition without immediately collapsing
    widgetLeaveTimeoutRef.current = window.setTimeout(() => {
      setIsSearchExpanded(false);
      setIsFilterExpanded(false);
    }, 600); // Wait enough time for transition (500ms) and mouse follow-up
  };

  const menuRef = useRef<HTMLDivElement>(null);
  const [timelineCategory, setTimelineCategory] = useState('All Categories');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false);
  const [isSnowing, setIsSnowing] = useState(false);

  // User Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [guestMode, setGuestMode] = useState<boolean>(() => isGuestMode());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load User Data
  useEffect(() => {
    setGuestMode(isGuestMode());
    getCurrentUser().then(userData => {
      setUser(userData);
      if (userData) {
        disableGuestMode();
        setGuestMode(false);
      }
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

  // Close Floating Widget on Outside Click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        // Only collapse if they are empty or we want a strict collapse. Let's just collapse states:
        setIsSearchExpanded(false);
        setIsFilterExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    if (guestMode) {
      disableGuestMode();
      setGuestMode(false);
      window.location.href = '/login';
      return;
    }

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
    if (isDataLoaded && !guestMode) {
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasks)
      }).catch(err => console.error('Failed to save tasks:', err));
    }
  }, [tasks, isDataLoaded, guestMode]);

  // Handle Scroll Restoration
  useLayoutEffect(() => {
    if (mainRef.current) {
      if (currentView === 'editor' || currentView === 'viewer') {
        // Entering detail views: reset scroll to top
        mainRef.current.scrollTop = 0;
      } else {
        // Returning to previous view: restore scroll
        mainRef.current.scrollTop = scrollPositionRef.current;
      }
    }
  }, [currentView]);

  // Helper to push a task to recent history
  const logRecentTask = (taskId: string) => {
    try {
      const data = localStorage.getItem('recent_tasks');
      let recents: string[] = data ? JSON.parse(data) : [];
      // Remove if exists to push to front
      recents = recents.filter(id => id !== taskId);
      recents.unshift(taskId);
      // Keep only last 10
      if (recents.length > 10) recents = recents.slice(0, 10);
      localStorage.setItem('recent_tasks', JSON.stringify(recents));
      // Dispatch an event so other components (Dashboard) can update immediately
      window.dispatchEvent(new Event('storage'));
    } catch (e) { console.error('Failed to log recent task', e); }
  };

  const handleTaskClick = (task: Task) => {
    if (mainRef.current) {
      scrollPositionRef.current = mainRef.current.scrollTop;
    }
    setViewerReturnView(currentView);
    setEditingTask(task);
    setIsCreatingNewTask(false);
    setPreviousView(currentView);
    setCurrentView('viewer');
    setShowMoreMenu(false);
    logRecentTask(task.id);
  };

  const handleEditTaskFromViewer = () => {
    if (guestMode) return;
    if (editingTask) logRecentTask(editingTask.id);
    setIsCreatingNewTask(false);
    setPreviousView('viewer');
    setCurrentView('editor');
  };

  const handleToggleFavorite = () => {
    if (guestMode || !editingTask) return;
    const toggled: Task = { ...editingTask, favorite: !editingTask.favorite };
    handleTaskUpdate(toggled);
  };

  const handleDeleteTask = () => {
    if (guestMode) return;
    if (!editingTask) return;
    setTasks(prev => prev.filter(t => t.id !== editingTask.id));
    setCurrentView(currentView === 'viewer' ? viewerReturnView : previousView);
    setShowMoreMenu(false);
  };

  const navigateToView = (nextView: ViewState) => {
    if (currentView === 'editor' && isCreatingNewTask && nextView !== 'editor') {
      // Drop unsaved draft safely: it has never been committed to tasks.
      setEditingTask(null);
      setIsCreatingNewTask(false);
      setShowMoreMenu(false);
    }
    setCurrentView(nextView);
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
    if (guestMode) return;
    if (isCreatingNewTask) {
      // For new tasks, keep updates local until explicit save.
      setEditingTask(updatedTask);
      return;
    }
    setTasks(prev => {
      const exists = prev.find(t => t.id === updatedTask.id);

      // If the task just transitioned to 'Done', remove it from recent views
      if (exists && exists.status !== 'Done' && updatedTask.status === 'Done') {
        try {
          const data = localStorage.getItem('recent_tasks');
          if (data) {
            let recents: string[] = JSON.parse(data);
            recents = recents.filter(id => id !== updatedTask.id);
            localStorage.setItem('recent_tasks', JSON.stringify(recents));
            window.dispatchEvent(new Event('storage'));
          }
        } catch (e) {
          console.error('Failed to update recent tasks on status change', e);
        }
      }

      let newTasks;
      if (exists) {
        newTasks = prev.map(t => t.id === updatedTask.id ? updatedTask : t);
      } else {
        newTasks = [...prev, updatedTask];
      }
      // Keep sorted when updating
      return newTasks.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
    });
    setEditingTask(updatedTask); // Keep editor in sync
  };

  const handleCreateNew = () => {
    if (guestMode) return;
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
    setIsCreatingNewTask(true);
    setPreviousView(currentView);
    setCurrentView('editor');
  };

  const handleCancelCreate = () => {
    if (!isCreatingNewTask) return;
    setEditingTask(null);
    setIsCreatingNewTask(false);
    setShowMoreMenu(false);
    setCurrentView(previousView);
  };

  const handleSaveTask = () => {
    if (currentView !== 'editor') return;

    if (isCreatingNewTask && editingTask) {
      setTasks(prev => {
        const exists = prev.find(t => t.id === editingTask.id);
        const nextTasks = exists
          ? prev.map(t => (t.id === editingTask.id ? editingTask : t))
          : [...prev, editingTask];
        return nextTasks.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
      });
      setIsCreatingNewTask(false);
    }

    setCurrentView(previousView);
  };

  const showSearch = currentView === 'timeline';
  const isDetailView = currentView === 'editor' || currentView === 'viewer';
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchStatus = statusFilter === 'All Status' || task.status === statusFilter;
      if (!matchStatus) return false;

      if (!normalizedSearch) return true;
      const searchable = [
        task.title,
        task.description,
        task.category,
        task.status,
        task.priority,
        task.dateStr,
        task.endDateStr,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [tasks, statusFilter, normalizedSearch]);

  useEffect(() => {
    if (!showSearch) return;
    if (isFirstFilterRenderRef.current) {
      isFirstFilterRenderRef.current = false;
      return;
    }
    setIsFilterTransitioning(true);
    const timer = window.setTimeout(() => setIsFilterTransitioning(false), 260);
    return () => window.clearTimeout(timer);
  }, [searchQuery, statusFilter, showSearch]);

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans text-slate-800 bg-white relative selection:bg-orange-300 selection:text-orange-900">
      {isSnowing && <Snowfall />}

      {/* Sticky Header - Glass Effect */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-orange-100/40 shadow-[0_4px_30px_-10px_rgba(249,115,22,0.08)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 lg:py-2">
            <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] items-center gap-2 lg:gap-4">

              {/* Left: Branding */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigateToView('home')}>
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-500 ${currentView === 'editor' ? 'text-primary' : 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-12'}`}>
                    <span className={`material-symbols-outlined text-xl ${currentView === 'editor' ? 'text-inherit' : 'text-white'}`}>nutrition</span>
                  </div>
                  <h1 className={`text-sm font-black tracking-tight uppercase ${currentView === 'editor' ? 'text-primary' : 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 bg-clip-text text-transparent'}`}>orange time</h1>
                </div>
              </div>

              {/* Right: Navigation & Actions */}
              <div className="flex items-center justify-end gap-2 flex-wrap">
                {guestMode && (
                  <div className="px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wide">
                    Guest Readonly
                  </div>
                )}
                {!isDetailView ? (
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

                    <Tooltip content="Home">
                      <button
                        onClick={() => navigateToView('home')}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${currentView === 'home' ? 'bg-orange-100/80 text-orange-600 shadow-inner' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50/50'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">home</span>
                      </button>
                    </Tooltip>

                    <div className="w-px h-6 bg-slate-200/50 mx-1"></div>

                    <Tooltip content="Dashboard">
                      <button
                        onClick={() => navigateToView('dashboard')}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-orange-100/80 text-orange-600 shadow-inner' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50/50'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">dashboard</span>
                      </button>
                    </Tooltip>

                    <Tooltip content="Timeline">
                      <button
                        onClick={() => navigateToView('timeline')}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${currentView === 'timeline' ? 'bg-orange-100/80 text-orange-600 shadow-inner' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50/50'}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                      </button>
                    </Tooltip>
                  </nav>
                ) : (
                  /* Editor specific actions */
                  <div className="flex items-center gap-2">
                    {currentView === 'viewer' ? (
                      <>
                        <button
                          onClick={() => setCurrentView(viewerReturnView)}
                          className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs border border-slate-200"
                        >
                          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                          Back
                        </button>
                        {!guestMode && (
                          <>
                            <button
                              onClick={handleToggleFavorite}
                              className={`p-2 rounded-md transition-colors ${editingTask?.favorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                              title={editingTask?.favorite ? 'Unfavorite' : 'Favorite'}
                            >
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
                          </>
                        )}
                      </>
                    ) : guestMode ? (
                      <button
                        onClick={() => setCurrentView(previousView)}
                        className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs border border-slate-200"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        Readonly
                      </button>
                    ) : (
                      <>
                        {/* Save Button */}
                        {isCreatingNewTask && (
                          <button
                            onClick={handleCancelCreate}
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl font-bold text-xs border border-slate-200 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setIsCreatingNewTask(false);
                            handleSaveTask();
                          }}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30 transition-all mr-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          Save
                        </button>
                        {!isCreatingNewTask && (
                          <>
                            <button
                              onClick={handleToggleFavorite}
                              className={`p-2 rounded-md transition-colors ${editingTask?.favorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                              title={editingTask?.favorite ? 'Unfavorite' : 'Favorite'}
                            >
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
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* User Avatar & Logout - Only Show if User is Logged In */}
                {guestMode && (
                  <div className="relative ml-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-200 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      Exit Guest
                    </button>
                  </div>
                )}
                {user && !guestMode && (
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
        </div>
      </header>

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto bg-slate-50/50">

        {/* Global Search & Filter Bar */}


        {currentView === 'home' && (
          <Home
            tasks={tasks}
            categories={CATEGORIES}
            onTaskClick={handleTaskClick}
          />
        )}
        {currentView === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            categories={CATEGORIES}
          />
        )}
        {currentView === 'timeline' && (
          <div className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isFilterTransitioning ? 'opacity-80 translate-y-[2px]' : 'opacity-100 translate-y-0'}`}>
            <Timeline
              tasks={filteredTasks}
              categories={CATEGORIES}
              onTaskClick={handleTaskClick}
              readonly={guestMode}
              selectedCategory={timelineCategory}
              onCategorySelect={setTimelineCategory}
            />
          </div>
        )}
        {currentView === 'editor' && !guestMode && (
          <TaskEditor
            task={editingTask}
            categories={CATEGORIES}
            onUpdate={handleTaskUpdate}
            onClose={() => navigateToView(previousView)}
          />
        )}
        {currentView === 'viewer' && (
          <TaskView
            task={editingTask}
            canEdit={!guestMode}
            onEdit={handleEditTaskFromViewer}
          />
        )}
      </main>

      {/* Floating Dynamic Widget for Search & Filter */}
      {showSearch && (
        <div className="fixed bottom-8 right-8 z-50 pointer-events-none flex flex-row-reverse items-center justify-start">
          <div
            ref={widgetRef}
            onMouseEnter={clearWidgetTimeout}
            onMouseLeave={handleWidgetMouseLeave}
            className={`glass-float-widget pointer-events-auto rounded-full p-2 flex flex-row-reverse items-center gap-2 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[width,transform] ${isSearchExpanded || isFilterExpanded ? 'scale-100 shadow-[0_28px_62px_-20px_rgba(15,23,42,0.38)]' : 'scale-95 hover:scale-100'
              }`}
          >
            {!guestMode && (
              <>
                <div className="liquid-separator w-px h-6 shrink-0"></div>
                <button
                  onClick={() => {
                    setIsSearchExpanded(false);
                    setIsFilterExpanded(false);
                    handleCreateNew();
                  }}
                  className="liquid-icon-btn w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-colors"
                  title="New Task"
                  aria-label="New Task"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </>
            )}

            {/* FILTER SECTION (Now on the right side) */}
            <div className={`liquid-segment flex flex-row-reverse items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full ${isFilterExpanded ? 'w-[372px]' : 'w-10'}`}>
              <button
                onMouseEnter={() => expandWidget('filter')}
                onClick={() => {
                  if (widgetLeaveTimeoutRef.current) window.clearTimeout(widgetLeaveTimeoutRef.current);
                  setIsFilterExpanded(!isFilterExpanded);
                  if (!isFilterExpanded) setIsSearchExpanded(false);
                }}
                className={`liquid-icon-btn w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-colors relative ${statusFilter !== 'All Status' && !isFilterExpanded ? 'text-orange-500 bg-orange-100/60' : 'text-slate-700'}`}
              >
                <span className="material-symbols-outlined text-[20px] font-medium drop-shadow-sm">tune</span>
                {statusFilter !== 'All Status' && !isFilterExpanded && (
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-orange-500 ring-2 ring-white/90"></span>
                )}
              </button>

              <div className={`flex flex-row items-center gap-1 whitespace-nowrap transition-opacity duration-300 pr-2 pl-2 ${isFilterExpanded ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none select-none'}`}>
                {['All Status', 'ToDo', 'In Progress', 'Done'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterExpanded(false);
                    }}
                    className={`px-3 py-1.5 rounded-[14px] text-[12px] font-semibold transition-all whitespace-nowrap ${statusFilter === status
                      ? 'liquid-chip-active text-slate-900'
                      : 'bg-transparent text-slate-700/90 hover:bg-white/20 hover:text-slate-900'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* SEPARATOR */}
            <div className="liquid-separator w-px h-6 shrink-0"></div>

            {/* SEARCH SECTION (Expanding leftward) */}
            <div className={`liquid-segment flex flex-row-reverse items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full ${isSearchExpanded ? 'w-[280px] liquid-segment-active' : 'w-10'}`}>
              <button
                onMouseEnter={() => expandWidget('search')}
                onClick={() => {
                  if (widgetLeaveTimeoutRef.current) window.clearTimeout(widgetLeaveTimeoutRef.current);
                  setIsSearchExpanded(!isSearchExpanded);
                  if (!isSearchExpanded) setIsFilterExpanded(false);
                }}
                className={`liquid-icon-btn w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-colors ${searchQuery && !isSearchExpanded ? 'text-orange-600 bg-orange-100' : 'text-slate-600'}`}
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </button>

              {searchQuery && isSearchExpanded && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                  className="ml-2 shrink-0 w-6 h-6 rounded-full bg-white/45 text-slate-700 hover:bg-white/70 hover:text-slate-900 flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}

              <input
                type="text"
                autoFocus={isSearchExpanded}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent border-none focus:ring-0 text-slate-800 text-sm font-medium outline-none transition-opacity duration-300 pl-3 ${isSearchExpanded ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none select-none'}`}
                placeholder="Search..."
              />
            </div>
          </div>
        </div>
      )}

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
        path="/home"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
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
      <Route path="/" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default App;
