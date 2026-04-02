'use client';

import { Task } from '@/lib/api/tasks';

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}

interface TaskItemProps {
  task: Task;
  size?: 'default' | 'compact';
  onToggle: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export default function TaskItem({ task, size = 'default', onToggle, onEdit, onDelete }: TaskItemProps) {
  if (size === 'compact') {
    return (
      <div
        className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${task.completed ? 'opacity-50' : ''}`}
        style={{ backgroundColor: 'var(--bg-card)' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
      >
        <button
          onClick={() => onToggle(task)}
          className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
          style={{
            backgroundColor: task.completed ? 'var(--brand)' : 'transparent',
            border: task.completed ? 'none' : '1.5px solid var(--border-md)',
          }}
          onMouseEnter={e => { if (!task.completed) e.currentTarget.style.borderColor = 'var(--brand)'; }}
          onMouseLeave={e => { if (!task.completed) e.currentTarget.style.borderColor = 'var(--border-md)'; }}
        >
          {task.completed && (
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: task.completed ? 'var(--text-3)' : 'var(--text-1)', textDecoration: task.completed ? 'line-through' : 'none' }}>
            {task.title}
          </p>
          {task.tags[0]?.tag && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 inline-block" style={{ backgroundColor: task.tags[0].tag.color + '25', color: task.tags[0].tag.color }}>
              {task.tags[0].tag.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onEdit && (
            <button onClick={() => onEdit(task)} className="p-1 rounded transition-colors text-[var(--text-3)] hover:text-[var(--text-1)]">
              <EditIcon />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(task.id)} className="p-1 rounded transition-colors text-[var(--text-3)] hover:text-red-400">
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3 rounded-xl transition-colors ${task.completed ? 'opacity-50' : ''}`}
      style={{ backgroundColor: 'var(--bg-card)' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task)}
        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
        style={{
          backgroundColor: task.completed ? 'var(--brand)' : 'transparent',
          border: task.completed ? 'none' : '1.5px solid var(--border-md)',
        }}
        onMouseEnter={e => { if (!task.completed) e.currentTarget.style.borderColor = 'var(--brand)'; }}
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
        <p
          className="text-sm font-medium leading-snug"
          style={{
            color: task.completed ? 'var(--text-3)' : 'var(--text-1)',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>

        {/* Meta row */}
        {(task.tags[0]?.tag || task.dueDate) && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.tags[0]?.tag && (
              <span
                className="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: task.tags[0].tag.color + '22', color: task.tags[0].tag.color }}
              >
                {task.tags[0].tag.name}
              </span>
            )}
            {task.dueDate && (
              <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg transition-colors text-[var(--text-3)] hover:text-[var(--text-1)]"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <EditIcon />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg transition-colors text-[var(--text-3)] hover:text-red-400"
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}
