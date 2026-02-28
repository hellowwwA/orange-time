export type ViewState = 'home' | 'dashboard' | 'timeline' | 'editor' | 'viewer';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  colorClass: string;
  subtext: string;
  subtextIcon: string;
}

export interface Task {
  id: string;
  title: string;
  category: 'Personal' | 'Learning' | 'Health' | 'Urgent' | 'Gaming' | 'Product';
  dateStr: string;
  endDateStr?: string; // Added for editor support
  startTime?: string;
  endTime?: string;
  description: string;
  status: 'Done' | 'In Progress' | 'ToDo';
  priority?: 'High' | 'Medium' | 'Low';
  hasContent?: boolean; // Flag to indicate if external markdown file is associated
  content?: string; // HTML or Markdown content for the editor
  cover?: string; // Cover image URL
  coverPosition?: number; // 0-100% vertical position
  favorite?: boolean;
}
