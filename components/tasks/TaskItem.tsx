'use client';

import { Task } from '@/lib/api/tasks';

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
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
function TimerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

interface TaskItemProps {
  task: Task;
  /** 'default' = full tasks-page row; 'compact' = smaller calendar row */
  size?: 'default' | 'compact';
  onToggle: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export default function TaskItem({ task, size = 'default', onToggle, onEdit, onDelete }: TaskItemProps) {
  const elapsed = Math.round(task.elapsedMins);
  const estimated = task.estimatedMins;
  const progress = estimated > 0 ? Math.min(1, elapsed / estimated) : 0;

  if (size === 'compact') {
    return (
      <div
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${task.completed ? 'opacity-60' : ''}`}
        style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}
      >
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
          style={{
            backgroundColor: task.completed ? '#9747FF' : 'transparent',
            border: task.completed ? 'none' : '2px solid var(--border-md)',
          }}
        >
          {task.completed && <CheckIcon />}
        </button>

        {/* Title + tag */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-medium truncate ${task.completed ? 'line-through' : ''}`}
            style={{ color: task.completed ? 'var(--text-3)' : 'var(--text-1)' }}
          >
            {task.title}
          </p>
          {task.subjectTag && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
              style={{ backgroundColor: task.subjectTag.color + '25', color: task.subjectTag.color }}
            >
              {task.subjectTag.name}
            </span>
          )}
        </div>

        {/* Est. time */}
        {estimated > 0 && (
          <span className="text-[10px] shrink-0" style={{ color: 'var(--text-3)' }}>{estimated}m</span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded transition-colors text-[var(--text-3)] hover:text-[var(--text-1)]"
            >
              <EditIcon />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 rounded transition-colors text-[var(--text-3)] hover:text-red-400"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default (full) size
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${task.completed ? 'opacity-50' : ''}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${task.completed ? 'var(--border)' : 'var(--border-md)'}`,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'bg-[#9747FF] border-[#9747FF]' : 'border-[var(--border-md)] hover:border-[#9747FF]'}`}
      >
        {task.completed && <CheckIcon />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-[var(--text-3)]' : 'text-[var(--text-1)]'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.subjectTag && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: task.subjectTag.color + '30', color: task.subjectTag.color }}>
              {task.subjectTag.name}
            </span>
          )}
          {task.dueDate && (
            <span className="text-xs text-[var(--text-3)]">
              Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Progress / time */}
      <div className="flex-shrink-0 text-right min-w-[80px]">
        <div className="flex items-center gap-1 justify-end text-xs text-[var(--text-3)]">
          <TimerIcon />
          <span>{elapsed}m / {estimated}m</span>
        </div>
        {!task.completed && (
          <div className="w-20 h-1 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            <div className="h-full bg-[#9747FF] rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button onClick={() => onEdit(task)} className="p-1.5 text-[var(--text-3)] hover:text-[var(--text-1)] rounded-lg hover:bg-black/5 transition-all">
            <EditIcon />
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(task.id)} className="p-1.5 text-[var(--text-3)] hover:text-red-400 rounded-lg hover:bg-black/5 transition-all">
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}
