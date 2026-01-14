import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';

interface TaskEditorProps {
    task: Task | null;
    categories: Array<{ name: string; color: string; border: string; text: string; bg: string }>;
    onUpdate: (task: Task) => void;
    onClose: () => void;
}

// Custom Dropdown Component
const Dropdown: React.FC<{
    value: string;
    options: string[];
    onChange: (val: string) => void;
    color?: string;
    icon?: string;
    label: string;
    getOptionIcon?: (option: string) => string | undefined;
}> = ({ value, options, onChange, color, icon, label, getOptionIcon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative inline-block text-left" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-between gap-x-2 rounded-lg px-3 h-9 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all w-40 whitespace-nowrap overflow-hidden ${color}`}
            >
                <span className="flex items-center gap-2 overflow-hidden">
                    {icon && <span className="material-symbols-outlined text-[18px] flex-shrink-0">{icon}</span>}
                    {value}
                </span>
                <span className="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in z-50">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => { onChange(option); setIsOpen(false); }}
                                className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${option === value ? 'font-bold text-primary bg-orange-50' : 'text-slate-700'}`}
                            >
                                {getOptionIcon && getOptionIcon(option) && (
                                    <span className={`material-symbols-outlined text-[18px] ${option === value ? 'text-primary' : 'text-slate-400'}`}>{getOptionIcon(option)}</span>
                                )}
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple Calendar Component
const CalendarPicker: React.FC<{ onSelect: (date: Date) => void; onClose: () => void; minDate?: Date; maxDate?: Date }> = ({ onSelect, onClose, minDate, maxDate }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handleDateClick = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        onSelect(date);
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    return (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-72 animate-fade-in text-slate-800">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                <div className="font-bold text-slate-800">{monthNames[currentMonth]} {currentYear}</div>
                <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {blanks.map(x => <div key={`blank-${x}`} className="h-8"></div>)}
                {days.map(day => {
                    const date = new Date(currentYear, currentMonth, day);
                    const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);
                    return (
                        <button
                            key={day}
                            disabled={isDisabled}
                            onClick={() => !isDisabled && handleDateClick(day)}
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors ${isDisabled ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-orange-100 hover:text-primary'}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


const TaskEditor: React.FC<TaskEditorProps> = ({ task, categories, onUpdate, onClose }) => {
    const [formData, setFormData] = useState<Partial<Task>>({
        title: '',
        category: 'Personal',
        dateStr: '',
        endDateStr: '',
        priority: 'Medium',
        status: 'ToDo',
        content: ''
    });

    const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize summary textarea
    useEffect(() => {
        if (summaryRef.current) {
            summaryRef.current.style.height = 'auto';
            summaryRef.current.style.height = summaryRef.current.scrollHeight + 'px';
        }
    }, [formData.description]);

    useEffect(() => {
        if (task) {
            setFormData({ ...task });
        }
    }, [task]);

    // Real-time update wrapper
    const handleChange = (field: keyof Task, value: any) => {
        const updated = { ...formData, [field]: value };

        // Automatically set End Date to today if Status becomes 'Done' and no End Date is present
        if (field === 'status' && value === 'Done') {
            if (!updated.endDateStr) {
                updated.endDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
        }

        setFormData(updated);
        if (updated.id) {
            onUpdate(updated as Task);
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [calendarRef]);

    // Helper to parse date strings
    const parseDateStr = (str?: string): Date | undefined => {
        if (!str) return undefined;
        const d = new Date(str);
        return isNaN(d.getTime()) ? undefined : d;
    };

    const handleDateSelect = (date: Date) => {
        // Strip time for comparison
        date.setHours(0, 0, 0, 0);

        const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (showCalendar === 'start') {
            const currentEnd = parseDateStr(formData.endDateStr);
            // If start date is after current end date
            if (currentEnd && date > currentEnd) {
                handleChange('endDateStr', '');
            }
            handleChange('dateStr', formatted);
        }
        if (showCalendar === 'end') {
            const currentStart = parseDateStr(formData.dateStr);
            // Validation: End Date >= Start Date
            if (currentStart && date < currentStart) {
                // Invalid
            } else {
                handleChange('endDateStr', formatted);
            }
        }
        setShowCalendar(null);
    };

    const getPriorityIcon = (p: string) => {
        switch (p) {
            case 'High': return 'priority_high';
            case 'Medium': return 'drag_handle';
            case 'Low': return 'arrow_downward';
            default: return undefined;
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'High': return 'text-red-600';
            case 'Medium': return 'text-orange-600';
            case 'Low': return 'text-slate-600';
            default: return 'text-slate-700';
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'Done': return 'check_circle';
            case 'In Progress': return 'sync';
            case 'ToDo': return 'radio_button_unchecked';
            default: return undefined;
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Done': return 'text-green-600';
            case 'In Progress': return 'text-orange-600';
            case 'ToDo': return 'text-slate-600';
            default: return 'text-slate-700';
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 bg-white min-h-[calc(100vh-80px)] shadow-lg my-6 rounded-xl animate-fade-in relative">
            <header className="mb-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="flex-1 bg-transparent border-none p-0 text-4xl font-bold text-slate-900 placeholder-slate-200 focus:ring-0 tracking-tight caret-primary outline-none min-w-0"
                        placeholder="Untitled Task"
                    />
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-y-3 items-center text-[14px]">
                    {/* Category */}
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-[18px]">category</span>
                        <span>Category</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {categories.slice(0, 5).map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => handleChange('category', cat.name)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold ${formData.category === cat.name ? `${cat.bg} ${cat.text}` : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                            >
                                <span className={`w-2 h-2 rounded-full ${formData.category === cat.name ? cat.text.replace('text-', 'bg-') : 'bg-slate-300'}`}></span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                        <button className="text-slate-300 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        </button>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        <span>Dates</span>
                    </div>
                    <div className="relative" ref={calendarRef}>
                        {/* Unified Date Box - REPLACED with separate buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowCalendar('start')}
                                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${showCalendar === 'start' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {formData.dateStr || 'Start Date'}
                            </button>

                            <span className="text-slate-300 material-symbols-outlined text-sm">arrow_right_alt</span>

                            <button
                                onClick={() => setShowCalendar('end')}
                                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${showCalendar === 'end' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {formData.endDateStr || 'End Date'}
                            </button>
                        </div>

                        {showCalendar && (
                            <CalendarPicker
                                onSelect={handleDateSelect}
                                onClose={() => setShowCalendar(null)}
                                minDate={showCalendar === 'end' ? parseDateStr(formData.dateStr) : undefined}
                            />
                        )}
                    </div>

                    {/* Priority */}
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-[18px]">flag</span>
                        <span>Priority</span>
                    </div>
                    <div>
                        <Dropdown
                            label="Priority"
                            value={formData.priority || 'Medium'}
                            options={['High', 'Medium', 'Low']}
                            onChange={(val) => handleChange('priority', val)}
                            color={getPriorityColor(formData.priority || 'Medium')}
                            icon={getPriorityIcon(formData.priority || 'Medium')}
                            getOptionIcon={getPriorityIcon}
                        />
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Status</span>
                    </div>
                    <div>
                        <Dropdown
                            label="Status"
                            value={formData.status || 'ToDo'}
                            options={['Done', 'In Progress', 'ToDo']}
                            onChange={(val) => handleChange('status', val)}
                            color={getStatusColor(formData.status || 'ToDo')}
                            icon={getStatusIcon(formData.status || 'ToDo')}
                            getOptionIcon={getStatusIcon}
                        />
                    </div>

                    {/* Short Description Field */}
                    <div className="flex items-center gap-2 text-slate-400 pt-2 self-start">
                        <span className="material-symbols-outlined text-[18px]">short_text</span>
                        <span>Summary</span>
                    </div>
                    <div className="pt-1">
                        <textarea
                            ref={summaryRef}
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full bg-transparent p-0 text-sm text-slate-700 placeholder-slate-400 focus:outline-none transition-all font-medium border-none resize-none [&::-webkit-scrollbar]:hidden overflow-hidden"
                            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                            placeholder="Short summary for the timeline card..."
                            rows={1}
                        />
                    </div>
                </div>
            </header>

            <hr className="border-slate-100 mb-6" />

            {/* Content Area - Markdown */}
            <div className="space-y-6">
                <div className="group relative">
                    <textarea
                        className="w-full min-h-[400px] text-slate-600 leading-8 text-lg outline-none resize-none bg-transparent placeholder-slate-300 font-normal font-mono"
                        placeholder="Type your detailed notes here (Markdown supported)..."
                        value={formData.content || ''}
                        onChange={(e) => handleChange('content', e.target.value)}
                    />
                    {/* Simple visual cue for blocks */}
                    <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity pointer-events-none">
                        <span className="material-symbols-outlined text-[18px] text-slate-200">drag_indicator</span>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default TaskEditor;