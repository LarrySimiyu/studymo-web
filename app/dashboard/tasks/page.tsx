'use client';

import { useState, useEffect, useCallback } from 'react';
import { tasksApi, subjectTagsApi, Task, SubjectTag } from '@/lib/api/tasks';
import { useStudyTimer } from '@/context/StudyTimerContext';

// ─── Icons ────────────────────────────────────────────────────────────────────
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}
function TimerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
interface TaskModalProps {
  task?: Task | null;
  tags: SubjectTag[];
  onClose: () => void;
  onSave: () => void;
}

function TaskModal({ task, tags, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [estimatedMins, setEstimatedMins] = useState(task?.estimatedMins ?? 45);
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : '');
  const [subjectTagId, setSubjectTagId] = useState(task?.subjectTagId ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedMins,
      dueDate: dueDate || undefined,
      subjectTagId: subjectTagId || undefined,
    };
    const { error: apiError } = task
      ? await tasksApi.update(task.id, payload)
      : await tasksApi.create(payload);
    setSaving(false);
    if (apiError) { setError(apiError); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><XIcon /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Title *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#9747FF]/50"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#9747FF]/50 resize-none"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-1">Estimated (mins)</label>
              <input
                type="number"
                min={1}
                value={estimatedMins}
                onChange={e => setEstimatedMins(Number(e.target.value))}
                className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#9747FF]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#9747FF]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Subject Tag</label>
            <select
              value={subjectTagId}
              onChange={e => setSubjectTagId(e.target.value)}
              className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#9747FF]/50"
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
              className="flex-1 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:border-white/20 transition-colors"
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

interface TagManagerProps {
  tags: SubjectTag[];
  onClose: () => void;
  onChange: () => void;
}

const TAG_COLORS = [
  '#9747FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
];

function TagManager({ tags, onClose, onChange }: TagManagerProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const createTag = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await subjectTagsApi.create({ name: newName.trim(), color: newColor });
    setSaving(false);
    setNewName('');
    onChange();
  };

  const saveEdit = async (id: string) => {
    await subjectTagsApi.update(id, { name: editName, color: editColor });
    setEditId(null);
    onChange();
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Delete this tag? Tasks with this tag will be untagged.')) return;
    await subjectTagsApi.delete(id);
    onChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Manage Subject Tags</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><XIcon /></button>
        </div>

        {/* Create new */}
        <div className="mb-4 p-3 bg-[#2A2A2A] rounded-xl">
          <p className="text-xs text-white/50 mb-2">New Tag</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createTag()}
              placeholder="Tag name"
              className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#9747FF]/50"
            />
            <button
              onClick={createTag}
              disabled={saving || !newName.trim()}
              className="px-3 py-1.5 bg-[#9747FF] rounded-lg text-white text-sm disabled:opacity-40 hover:bg-[#8535ee] transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {TAG_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{ backgroundColor: c, borderColor: newColor === c ? 'white' : 'transparent' }}
              />
            ))}
          </div>
        </div>

        {/* Existing tags */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tags.length === 0 && (
            <p className="text-white/30 text-sm text-center py-4">No tags yet</p>
          )}
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
              {editId === tag.id ? (
                <>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: editColor }} />
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 bg-[#2A2A2A] border border-white/10 rounded px-2 py-1 text-sm text-white outline-none"
                  />
                  <div className="flex gap-1">
                    {TAG_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        className="w-4 h-4 rounded-full border transition-all"
                        style={{ backgroundColor: c, borderColor: editColor === c ? 'white' : 'transparent' }}
                      />
                    ))}
                  </div>
                  <button onClick={() => saveEdit(tag.id)} className="text-[#9747FF] text-xs">Save</button>
                  <button onClick={() => setEditId(null)} className="text-white/40 text-xs">Cancel</button>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                  <span className="flex-1 text-sm text-white">{tag.name}</span>
                  <button
                    onClick={() => { setEditId(tag.id); setEditName(tag.name); setEditColor(tag.color); }}
                    className="text-white/30 hover:text-white/60 transition-colors"
                  >
                    <EditIcon />
                  </button>
                  <button onClick={() => deleteTag(tag.id)} className="text-white/30 hover:text-red-400 transition-colors">
                    <TrashIcon />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────────
interface TaskRowProps {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (t: Task) => void;
}

function TaskRow({ task, onEdit, onDelete, onToggle }: TaskRowProps) {
  const elapsed = Math.round(task.elapsedMins);
  const estimated = task.estimatedMins;
  const progress = estimated > 0 ? Math.min(1, elapsed / estimated) : 0;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${task.completed ? 'border-white/5 opacity-50' : 'border-white/10 hover:border-white/20'} bg-[#1A1A1A]`}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'bg-[#9747FF] border-[#9747FF]' : 'border-white/30 hover:border-[#9747FF]'}`}
      >
        {task.completed && <CheckIcon />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-white/40' : 'text-white'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.subjectTag && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: task.subjectTag.color + '30', color: task.subjectTag.color }}>
              {task.subjectTag.name}
            </span>
          )}
          {task.dueDate && (
            <span className="text-xs text-white/30">
              Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Progress / time */}
      <div className="flex-shrink-0 text-right min-w-[80px]">
        <div className="flex items-center gap-1 justify-end text-xs text-white/40">
          <TimerIcon />
          <span>{elapsed}m / {estimated}m</span>
        </div>
        {!task.completed && (
          <div className="w-20 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-[#9747FF] rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onEdit(task)} className="p-1.5 text-white/30 hover:text-white/70 rounded-lg hover:bg-white/5 transition-all">
          <EditIcon />
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1.5 text-white/30 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type FilterTab = 'all' | 'active' | 'completed';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<SubjectTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('active');
  const [tagFilter, setTagFilter] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);

  const { startSession, status, toggleCollapsed, isCollapsed } = useStudyTimer();

  const loadData = useCallback(async () => {
    const [tasksRes, tagsRes] = await Promise.all([
      tasksApi.getAll(),
      subjectTagsApi.getAll(),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (tagsRes.data) setTags(tagsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = async (task: Task) => {
    await tasksApi.update(task.id, { completed: !task.completed });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    await tasksApi.delete(id);
    loadData();
  };

  const handleStartTimer = async (selectedTaskIds: string[]) => {
    if (status !== 'idle') {
      if (isCollapsed) toggleCollapsed();
      return;
    }
    const err = await startSession('timeblock', selectedTaskIds);
    if (!err && isCollapsed) toggleCollapsed();
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (tagFilter && t.subjectTagId !== tagFilter) return false;
    return true;
  });

  // Group by subject tag
  const grouped: { label: string; color: string; tasks: Task[] }[] = [];
  const byTag: Record<string, Task[]> = {};
  for (const t of filteredTasks) {
    const key = t.subjectTagId ?? '__none__';
    if (!byTag[key]) byTag[key] = [];
    byTag[key].push(t);
  }
  if (byTag['__none__']?.length) {
    grouped.push({ label: 'No Tag', color: '#555', tasks: byTag['__none__'] });
  }
  for (const tag of tags) {
    if (byTag[tag.id]?.length) {
      grouped.push({ label: tag.name, color: tag.color, tasks: byTag[tag.id] });
    }
  }

  const activeTasks = tasks.filter(t => !t.completed);
  const completedCount = tasks.filter(t => t.completed).length;
  const totalEstimated = activeTasks.reduce((s, t) => s + t.estimatedMins, 0);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-sm text-white/40 mt-1">
            {activeTasks.length} active · {completedCount} completed · ~{Math.round(totalEstimated / 60)}h estimated
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTagManager(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:border-white/20 hover:text-white transition-all"
          >
            <TagIcon />
            Tags
          </button>
          {activeTasks.length > 0 && (
            <button
              onClick={() => handleStartTimer(activeTasks.map(t => t.id))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#9747FF]/30 text-[#9747FF] text-sm hover:bg-[#9747FF]/10 transition-all"
            >
              <TimerIcon />
              {status === 'idle' ? 'Start Session' : 'View Timer'}
            </button>
          )}
          <button
            onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#9747FF] text-white text-sm font-medium hover:bg-[#8535ee] transition-colors"
          >
            <PlusIcon />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex bg-[#1A1A1A] border border-white/10 rounded-xl p-1">
          {(['all', 'active', 'completed'] as FilterTab[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${filter === f ? 'bg-[#9747FF] text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {tags.length > 0 && (
          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            className="bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-sm text-white/60 outline-none focus:border-white/20"
          >
            <option value="">All Tags</option>
            {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#9747FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9747FF" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-white/40 text-sm">
            {filter === 'completed' ? 'No completed tasks yet' : 'No tasks yet. Create one to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{group.label}</span>
                <span className="text-xs text-white/20">({group.tasks.length})</span>
              </div>
              <div className="space-y-2">
                {group.tasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          tags={tags}
          onClose={() => setShowTaskModal(false)}
          onSave={() => { setShowTaskModal(false); loadData(); }}
        />
      )}
      {showTagManager && (
        <TagManager
          tags={tags}
          onClose={() => setShowTagManager(false)}
          onChange={loadData}
        />
      )}
    </div>
  );
}
