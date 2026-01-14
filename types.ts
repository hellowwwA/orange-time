export type ViewState = 'dashboard' | 'timeline' | 'editor';

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
  category: 'Personal' | 'Learning' | 'Health' | 'Urgent' | 'Design' | 'Product';
  dateStr: string;
  endDateStr?: string; // Added for editor support
  startTime?: string;
  endTime?: string;
  description: string;
  status: 'Done' | 'In Progress' | 'ToDo';
  priority?: 'High' | 'Medium' | 'Low';
  content?: string; // HTML or Markdown content for the editor
}