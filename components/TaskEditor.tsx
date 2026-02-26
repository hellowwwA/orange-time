import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import MarkdownWithToc from './MarkdownWithToc';
import 'md-editor-rt/lib/preview.css';

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
                className={`inline-flex items-center justify-between gap-x-2 rounded-xl px-3 h-9 text-xs font-bold text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-orange-200 transition-all w-40 whitespace-nowrap overflow-hidden cursor-pointer ${color}`}
            >
                <span className="flex items-center gap-2 overflow-hidden">
                    {icon && <span className="material-symbols-outlined text-[18px] flex-shrink-0">{icon}</span>}
                    {value}
                </span>
                <span className="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-full origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in z-50">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => { onChange(option); setIsOpen(false); }}
                                className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 rounded-lg cursor-pointer transition-colors ${option === value ? 'font-bold text-primary bg-orange-50' : 'text-slate-700'}`}
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
                <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                <div className="font-bold text-slate-800">{monthNames[currentMonth]} {currentYear}</div>
                <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {blanks.map(x => <div key={`blank-${x}`} className="h-8"></div>)}
                {days.map(day => {
                    const date = new Date(currentYear, currentMonth, day);
                    const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);
                    const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
                    return (
                        <button
                            key={day}
                            disabled={isDisabled}
                            onClick={() => !isDisabled && handleDateClick(day)}
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors cursor-pointer ${isDisabled ? 'text-slate-300 !cursor-not-allowed' : isToday ? 'bg-primary text-white font-bold shadow-sm shadow-orange-500/30' : 'text-slate-700 hover:bg-orange-100 hover:text-primary'}`}
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mdFileInputRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLTextAreaElement>(null);

    const [isLoadingMarkdown, setIsLoadingMarkdown] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

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
            if (!task.content && task.hasContent) {
                setIsLoadingMarkdown(true);
                fetch(`/api/tasks/${task.id}/content`)
                    .then(res => res.text())
                    .then(text => {
                        setFormData(prev => ({ ...prev, content: text }));
                    })
                    .catch(err => console.error('Failed to load markdown content:', err))
                    .finally(() => setIsLoadingMarkdown(false));
            }
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

    const handleMdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsLoadingMarkdown(true);
        try {
            const content = await file.text();
            if (content) {
                handleChange('content', content);
            }
        } catch (err) {
            console.error('Failed to read markdown file:', err);
        } finally {
            setIsLoadingMarkdown(false);
            e.target.value = '';
        }
    };

    // --- Drag and Drop Logic ---
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const items = e.dataTransfer.items;
        if (!items || items.length === 0) return;

        setIsLoadingMarkdown(true);

        const allFiles: File[] = [];

        // Helper to recursively read directory entries
        const readEntry = async (entry: FileSystemEntry): Promise<void> => {
            if (entry.isFile) {
                const fileEntry = entry as FileSystemFileEntry;
                return new Promise((resolve) => {
                    fileEntry.file((file) => {
                        // Store the full relative path if possible, but File API lacks it.
                        // We attach the webkitRelativePath or fullPath via a custom descriptor if needed,
                        // but usually name matching is enough, or we can use entry.fullPath
                        Object.defineProperty(file, 'fullPath', { value: entry.fullPath });
                        allFiles.push(file);
                        resolve();
                    });
                });
            } else if (entry.isDirectory) {
                const dirEntry = entry as FileSystemDirectoryEntry;
                const reader = dirEntry.createReader();
                return new Promise((resolve) => {
                    reader.readEntries(async (entries) => {
                        for (const child of entries) {
                            await readEntry(child);
                        }
                        resolve();
                    });
                });
            }
        };

        // Read all dropped items
        const promises = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const entry = item.webkitGetAsEntry();
            if (entry) {
                promises.push(readEntry(entry));
            }
        }

        await Promise.all(promises);

        // Separate MD files and Image files
        const mdFiles = allFiles.filter(f => f.name.endsWith('.md') || f.name.endsWith('.txt'));
        const imageFiles = allFiles.filter(f => f.type.startsWith('image/'));

        if (mdFiles.length === 0) {
            alert('No Markdown file found in the dropped items.');
            setIsLoadingMarkdown(false);
            return;
        }

        const mdFile = mdFiles[0];
        let mdContent = await mdFile.text();

        // If there are images, upload them and get the mapping
        if (imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(async (img) => {
                const formData = new FormData();
                formData.append('image', img);
                try {
                    const res = await fetch('/api/upload-image', {
                        method: 'POST',
                        body: formData
                    });
                    if (res.ok) {
                        const data = await res.json();
                        // Also associate with img.fullPath if we want robust replacement
                        const fullPath = (img as any).fullPath;
                        return { originalName: img.name, fullPath, url: data.url };
                    }
                } catch (err) {
                    console.error('Failed to upload image:', img.name, err);
                }
                return null;
            });

            const uploadedImages = (await Promise.all(uploadPromises)).filter(Boolean);

            // Replace local paths in markdown
            // Matches ![alt](local-path)
            mdContent = mdContent.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, localPath) => {
                // If the path is already an http(s) link, ignore
                if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
                    return match;
                }

                // Decode uri in case it's url encoded
                const decodedPath = decodeURIComponent(localPath);

                // Extract just the filename to match
                const filename = decodedPath.split('/').pop();

                const matchedImg = uploadedImages.find(img => img?.originalName === filename || img?.fullPath.endsWith(decodedPath));

                if (matchedImg) {
                    return `![${alt}](${matchedImg.url})`;
                }

                return match;
            });
        }

        handleChange('content', mdContent);
        setIsLoadingMarkdown(false);
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            if (!result) return;
            handleChange('cover', result);
            if (formData.coverPosition === undefined) {
                handleChange('coverPosition', 50);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleRemoveCover = () => {
        handleChange('cover', undefined);
        handleChange('coverPosition', undefined);
    };

    return (
        <div className="w-full max-w-[90%] mx-auto px-6 py-8 bg-white min-h-[calc(100vh-80px)] shadow-soft my-6 rounded-2xl border border-slate-100 animate-slide-up relative text-sm">
            {/* Hidden file input for markdown upload */}
            <input
                type="file"
                ref={mdFileInputRef}
                accept=".md,.markdown,.txt"
                onChange={handleMdFileUpload}
                className="hidden"
            />
            {/* Hidden file input for cover upload */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
            />
            <header className="mb-6">
                <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-4xl font-black text-slate-900 placeholder-slate-200 focus:ring-0 tracking-tight caret-primary outline-none min-w-0 mb-6"
                    placeholder="Untitled Task"
                />

                <section className="mb-4" ref={galleryRef}>
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div className="relative h-44">
                            {formData.cover ? (
                                <>
                                    <img
                                        src={formData.cover}
                                        alt="Task cover"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ objectPosition: `center ${formData.coverPosition ?? 50}%` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/10 to-transparent" />
                                </>
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                                    <div className="text-center text-slate-400">
                                        <span className="material-symbols-outlined text-4xl mb-1">image</span>
                                        <p className="text-xs font-semibold uppercase tracking-wide">No Background</p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/90 text-slate-700 hover:bg-white transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[14px]">upload</span>
                                    {formData.cover ? 'Change Cover' : 'Upload Cover'}
                                </button>
                                {formData.cover && (
                                    <button
                                        onClick={handleRemoveCover}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/90 text-white hover:bg-red-600 transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                        {formData.cover && (
                            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Background Position</span>
                                    <span className="text-xs font-bold text-slate-700">{formData.coverPosition ?? 50}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={formData.coverPosition ?? 50}
                                    onChange={(e) => handleChange('coverPosition', Number(e.target.value))}
                                    className="w-full mt-2 accent-orange-500 cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div className="rounded-2xl border border-orange-100/80 bg-gradient-to-br from-orange-50 via-white to-orange-50/30 px-4 py-3 shadow-[0_8px_20px_-16px_rgba(249,115,22,0.4)] transition-all hover:shadow-[0_10px_24px_-14px_rgba(249,115,22,0.45)]">
                        <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-orange-400">category</span>
                            Category
                        </p>
                        <p className="text-xs font-semibold text-slate-600 mb-2">Select a lane for this task</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            {categories.slice(0, 5).map(cat => (
                                <button
                                    key={cat.name}
                                    onClick={() => handleChange('category', cat.name)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-[11px] font-bold cursor-pointer ${formData.category === cat.name ? `${cat.bg} ${cat.text} shadow-sm` : 'bg-white text-slate-500 border border-slate-200 hover:border-orange-200'}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${formData.category === cat.name ? cat.text.replace('text-', 'bg-') : 'bg-slate-300'}`}></span>
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/20 px-4 py-3 relative shadow-[0_8px_20px_-16px_rgba(59,130,246,0.35)] transition-all hover:shadow-[0_10px_24px_-14px_rgba(59,130,246,0.4)]" ref={calendarRef}>
                        <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-blue-400">calendar_today</span>
                            Date
                        </p>
                        <p className="text-xs font-semibold text-slate-600 mb-2">Plan your time window</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setShowCalendar('start')}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${showCalendar === 'start' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 bg-white border border-slate-200 hover:border-orange-200'}`}
                            >
                                {formData.dateStr || 'Start Date'}
                            </button>
                            <span className="text-slate-300 material-symbols-outlined text-sm">arrow_right_alt</span>
                            <button
                                onClick={() => setShowCalendar('end')}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${showCalendar === 'end' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 bg-white border border-slate-200 hover:border-orange-200'}`}
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

                    <div className="rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/20 px-4 py-3 shadow-[0_8px_20px_-16px_rgba(16,185,129,0.35)] transition-all hover:shadow-[0_10px_24px_-14px_rgba(16,185,129,0.4)]">
                        <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                            Status
                        </p>
                        <p className="text-xs font-semibold text-slate-600 mb-2">Track current progress</p>
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

                    <div className="rounded-2xl border border-red-100/80 bg-gradient-to-br from-red-50/70 via-white to-red-50/20 px-4 py-3 shadow-[0_8px_20px_-16px_rgba(239,68,68,0.35)] transition-all hover:shadow-[0_10px_24px_-14px_rgba(239,68,68,0.4)]">
                        <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-red-400">flag</span>
                            Priority
                        </p>
                        <p className="text-xs font-semibold text-slate-600 mb-2">Set urgency level</p>
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
                </section>

                <section className="mb-2">
                    <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Summary</h3>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus-within:border-orange-300 focus-within:bg-orange-50/20 focus-within:shadow-[0_0_0_3px_rgba(251,146,60,0.12)]">
                        <textarea
                            ref={summaryRef}
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="summary-input w-full bg-transparent p-0 text-sm text-slate-700 placeholder-slate-400 transition-all font-medium border-none resize-none leading-relaxed [&::-webkit-scrollbar]:hidden overflow-hidden"
                            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                            placeholder="Short summary for the timeline card..."
                            rows={1}
                        />
                    </div>
                </section>
            </header>

            <hr className="border-slate-100/70 mb-6" />

            {/* Content Area - Markdown Upload & Preview */}
            {isLoadingMarkdown ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl min-h-[300px] flex flex-col items-center justify-center text-slate-400 group bg-slate-50/50">
                    <span className="material-symbols-outlined text-4xl animate-spin mb-4">refresh</span>
                    <h3 className="text-base font-semibold">Loading Markdown...</h3>
                </div>
            ) : formData.content ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`transition-all rounded-2xl ${isDragging ? 'ring-2 ring-primary bg-orange-50/50 p-4' : ''}`}
                >
                    {/* Re-upload bar */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <span className="material-symbols-outlined text-[18px]">description</span>
                            <span>Markdown Document</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => mdFileInputRef.current?.click()}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-primary hover:bg-orange-50 rounded-lg transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                                Re-upload
                            </button>
                        </div>
                    </div>
                    {/* Markdown Preview with TOC Layout */}
                    <MarkdownWithToc content={formData.content || ''} editorId="task-editor-preview" />

                    {/* Full-screen drop overlay for easier dropping when preview is long */}
                    {isDragging && (
                        <div className="absolute inset-0 z-50 bg-orange-50/90 rounded-2xl flex flex-col items-center justify-center border-4 border-dashed border-primary animate-fade-in pointer-events-none">
                            <span className="material-symbols-outlined text-7xl text-primary mb-4 animate-bounce">drive_folder_upload</span>
                            <h3 className="text-2xl font-bold text-primary">Drop to Re-upload</h3>
                            <p className="text-orange-600 font-medium mt-2">Replace current document & images</p>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => mdFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-all group ${isDragging ? 'border-primary bg-orange-50 scale-[1.02]' : 'border-slate-200 hover:border-primary/50 hover:bg-orange-50/50'}`}
                >
                    <span className={`material-symbols-outlined text-5xl transition-colors mb-4 ${isDragging ? 'text-primary' : 'text-slate-300 group-hover:text-primary'}`}>
                        {isDragging ? 'drive_folder_upload' : 'markdown'}
                    </span>
                    <h3 className={`text-lg font-bold transition-colors ${isDragging ? 'text-primary' : 'text-slate-600 group-hover:text-primary'}`}>
                        {isDragging ? 'Drop to Upload' : 'Upload Markdown'}
                    </h3>
                    <p className={`text-sm ${isDragging ? 'text-orange-500 font-medium' : 'text-slate-400'}`}>
                        {isDragging ? 'Release to upload folder/file' : 'Click to browse or drop folder/file here'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TaskEditor;
