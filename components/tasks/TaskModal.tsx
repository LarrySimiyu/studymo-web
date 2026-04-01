'use client';

import { useEffect, useState } from 'react';
import { tasksApi, Task } from '@/lib/api/tasks';
import { docTagsApi } from '@/lib/api/documents';

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface TaskModalProps {
  /** Pass a task to edit; omit for create mode */
  task?: Task | null;
  /** Pre-fill the due date field (YYYY-MM-DD) */
  defaultDueDate?: string;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export default function TaskModal({ task, defaultDueDate, onClose, onSave }: TaskModalProps) {
  const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [estimatedMins, setEstimatedMins] = useState(task?.estimatedMins ?? 45);
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.split('T')[0] : (defaultDueDate ?? '')
  );
  const [tagId, setTagId] = useState(task?.tags?.[0]?.tagId ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    docTagsApi.getAll().then(({ data }) => { if (data) setTags(data.map(t => ({ ...t, color: t.color ?? '#9747FF' }))); });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedMins,
      dueDate: dueDate || undefined,
      tagId: tagId || undefined,
    };
    const { data, error: apiError } = task
      ? await tasksApi.update(task.id, payload)
      : await tasksApi.create(payload);
    setSaving(false);
    if (apiError || !data) { setError(apiError ?? 'Something went wrong'); return; }
    onSave(data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="border rounded-2xl w-full max-w-md p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--text-1)]">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-2)] mb-1">Title *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none focus:border-[#9747FF]/50"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-2)] mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none focus:border-[#9747FF]/50 resize-none"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-2)] mb-1">Estimated duration</label>
              <select
                value={estimatedMins}
                onChange={e => setEstimatedMins(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none focus:border-[#9747FF]/50"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}
              >
                {[5, 10, 15, 20, 25, 30, 45, 60, 90, 120].map(m => (
                  <option key={m} value={m}>
                    {m < 60 ? `${m} min` : `${m / 60}h${m % 60 ? ` ${m % 60}m` : ''}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-2)] mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none focus:border-[#9747FF]/50"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', colorScheme: 'dark' } as React.CSSProperties}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-2)] mb-1">Subject Tag</label>
            <select
              value={tagId}
              onChange={e => setTagId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none focus:border-[#9747FF]/50"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}
            >
              <option value="">No tag</option>
              {tags.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-lg bg-[#9747FF] text-white text-sm font-medium hover:bg-[#8535ee] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
