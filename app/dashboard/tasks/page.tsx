'use client';

import { useState, useEffect, useCallback } from 'react';
import { tasksApi, subjectTagsApi, Task, SubjectTag } from '@/lib/api/tasks';
import { useStudyTimer } from '@/context/StudyTimerContext';
import TaskItem from '@/components/tasks/TaskItem';
import TaskModal from '@/components/tasks/TaskModal';

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
      <div className="border rounded-2xl w-full max-w-md p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--text-1)]">Manage Subject Tags</h2>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"><XIcon /></button>
        </div>

        {/* Create new */}
        <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-input)' }}>
          <p className="text-xs text-[var(--text-2)] mb-2">New Tag</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createTag()}
              placeholder="Tag name"
              className="flex-1 border rounded-lg px-3 py-1.5 text-sm text-[var(--text-1)] outline-none focus:border-[#9747FF]/50"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
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
            <p className="text-[var(--text-3)] text-sm text-center py-4">No tags yet</p>
          )}
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5">
              {editId === tag.id ? (
                <>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: editColor }} />
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 border rounded px-2 py-1 text-sm text-[var(--text-1)] outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}
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
                  <button onClick={() => setEditId(null)} className="text-[var(--text-3)] text-xs">Cancel</button>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                  <span className="flex-1 text-sm text-[var(--text-1)]">{tag.name}</span>
                  <button
                    onClick={() => { setEditId(tag.id); setEditName(tag.name); setEditColor(tag.color); }}
                    className="text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
                  >
                    <EditIcon />
                  </button>
                  <button onClick={() => deleteTag(tag.id)} className="text-[var(--text-3)] hover:text-red-400 transition-colors">
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
          <h1 className="text-2xl font-bold text-[var(--text-1)]">Tasks</h1>
          <p className="text-sm text-[var(--text-2)] mt-1">
            {activeTasks.length} active · {completedCount} completed · ~{Math.round(totalEstimated / 60)}h estimated
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTagManager(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
            style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            <TagIcon />
            Tags
          </button>
          {activeTasks.length > 0 && (
            <button
              onClick={() => handleStartTimer(activeTasks.map(t => t.id))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
              style={{ border: '1px solid var(--brand-border)', color: '#9747FF' }}
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
        <div className="flex border rounded-xl p-1" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          {(['all', 'active', 'completed'] as FilterTab[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${filter === f ? 'bg-[#9747FF] text-white' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {tags.length > 0 && (
          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-2)' }}
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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9747FF" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-[var(--text-2)] text-sm">
            {filter === 'completed' ? 'No completed tasks yet' : 'No tasks yet. Create one to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="text-xs font-medium text-[var(--text-2)] uppercase tracking-wider">{group.label}</span>
                <span className="text-xs text-[var(--text-3)]">({group.tasks.length})</span>
              </div>
              <div className="space-y-2">
                {group.tasks.map(task => (
                  <TaskItem
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
