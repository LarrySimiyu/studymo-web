'use client';

import { Task } from '@/lib/api/tasks';
import { TagBadge } from '@/components/ui/badge';

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}

function isOverdue(dueDate: string) {
  const d = new Date(dueDate);
  const n = new Date();
  n.setHours(0, 0, 0, 0);
  return d < n;
}
function isToday(dueDate: string) {
  const d = new Date(dueDate);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

interface TaskItemProps {
  task: Task;
  compact?: boolean;
  onToggle: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export default function TaskItem({ task, compact, onToggle, onEdit, onDelete }: TaskItemProps) {
  const tag = task.tags[0]?.tag;

  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  const overdue = task.dueDate && !task.completed && isOverdue(task.dueDate);
  const today = task.dueDate && !task.completed && isToday(task.dueDate);

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl transition-colors ${compact ? 'px-3 py-2.5' : 'px-4 py-3'} ${task.completed ? 'opacity-50' : ''}`}
      style={{ backgroundColor: 'var(--bg-card)' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
    >
      {/* Checkbox — centered against full item height */}
      <button
        onClick={() => onToggle(task)}
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
        style={{
          backgroundColor: task.completed ? '#22C55E' : 'transparent',
          border: task.completed ? 'none' : '1.5px solid var(--border-md)',
        }}
        onMouseEnter={e => { if (!task.completed) e.currentTarget.style.borderColor = '#22C55E'; }}
        onMouseLeave={e => { if (!task.completed) e.currentTarget.style.borderColor = 'var(--border-md)'; }}
      >
        {task.completed && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <p
            className={`flex-1 min-w-0 ${compact ? 'text-xs' : 'text-sm'} font-medium truncate`}
            style={{
              color: task.completed ? 'var(--text-3)' : 'var(--text-1)',
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </p>

          {/* Due date */}
          {dueDateStr && (
            <span
              className="text-[10px] font-medium shrink-0"
              style={{ color: overdue ? '#EF4444' : today ? '#F59E0B' : 'var(--text-3)' }}
            >
              {dueDateStr}
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-0.5 max-w-0 overflow-hidden group-hover:max-w-[52px] transition-all duration-200 shrink-0">
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded-lg transition-colors text-[var(--text-3)] hover:text-[var(--text-1)]"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <EditIcon />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 rounded-lg transition-colors text-[var(--text-3)] hover:text-red-400"
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        </div>

        {/* Tag row */}
        {tag && (
          <div className="mt-1">
            <TagBadge color={tag.color} size="sm">
              {tag.name}
            </TagBadge>
          </div>
        )}
      </div>
    </div>
  );
}
