'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Task } from '@/lib/api/tasks';
import { cn } from '@/lib/utils';
import { TagBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';

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
      className={cn(`group flex items-center gap-3 rounded-xl transition-colors ${compact ? 'px-3 py-2.5' : 'px-4 py-3'} ${task.completed ? 'opacity-50' : ''}`, 'bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]')}
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
              className="text-2xs font-medium shrink-0"
              style={{ color: overdue ? '#EF4444' : today ? '#F59E0B' : 'var(--text-3)' }}
            >
              {dueDateStr}
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-0.5 max-w-0 overflow-hidden group-hover:max-w-[52px] transition-all duration-200 shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Edit task"
                onClick={() => onEdit(task)}
                className="text-[var(--text-3)]"
              >
                <Pencil size={12} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Delete task"
                onClick={() => onDelete(task.id)}
                className="text-[var(--text-3)] hover:text-[var(--danger-ink)]"
              >
                <Trash2 size={12} />
              </Button>
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
