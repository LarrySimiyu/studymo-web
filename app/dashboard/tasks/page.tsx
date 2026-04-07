'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pen, Trash2 } from 'lucide-react';
import { tasksApi, Task, Tag } from '@/lib/api/tasks';
import { docTagsApi } from '@/lib/api/documents';
import TaskItem from '@/components/tasks/TaskItem';
import TaskModal from '@/components/tasks/TaskModal';
import TagDropdown from '@/components/ui/TagDropdown';
import SlidingTabs from '@/components/ui/SlidingTabs';
import { PageHeader } from '@/components/dashboard/PageHeader';

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const TAG_COLORS = [
  '#FF6500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
];

function TagManager({ tags, onClose, onChange }: { tags: Tag[]; onClose: () => void; onChange: () => void }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const createTag = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await docTagsApi.create({ name: newName.trim(), color: newColor });
    setSaving(false);
    setNewName('');
    onChange();
  };

  const saveEdit = async (id: string) => {
    await docTagsApi.update(id, { name: editName, color: editColor });
    setEditId(null);
    onChange();
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Delete this tag? Tasks with this tag will be untagged.')) return;
    await docTagsApi.delete(id);
    onChange();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[var(--text-1)]">Manage Tags</h2>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors p-1"><XIcon /></button>
        </div>

        <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-input)' }}>
          <p className="text-xs text-[var(--text-2)] mb-2">New Tag</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createTag()}
              placeholder="Tag name"
              className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none"
              style={{ backgroundColor: 'var(--bg-hover)' }}
            />
            <button
              onClick={createTag}
              disabled={saving || !newName.trim()}
              className="px-3 py-2 rounded-lg text-white text-sm disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF6500, #FF9A3C)' }}
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

        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {tags.length === 0 && (
            <p className="text-[var(--text-3)] text-sm text-center py-4">No tags yet</p>
          )}
          {tags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--bg-input)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
            >
              {editId === tag.id ? (
                <>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: editColor }} />
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 min-w-0 rounded px-2 py-1 text-sm text-[var(--text-1)] outline-none"
                    style={{ backgroundColor: 'var(--bg-hover)' }}
                  />
                  <div className="flex gap-1 shrink-0">
                    {TAG_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        className="w-4 h-4 rounded-full border transition-all"
                        style={{ backgroundColor: c, borderColor: editColor === c ? 'white' : 'transparent' }}
                      />
                    ))}
                  </div>
                  <button onClick={() => saveEdit(tag.id)} className="text-xs font-medium shrink-0" style={{ color: 'var(--brand)' }}>Save</button>
                  <button onClick={() => setEditId(null)} className="text-[var(--text-3)] text-xs shrink-0">Cancel</button>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                  <span className="flex-1 min-w-0 text-sm text-[var(--text-1)] truncate">{tag.name}</span>
                  <button
                    onClick={() => { setEditId(tag.id); setEditName(tag.name); setEditColor(tag.color); }}
                    className="text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors p-1 shrink-0"
                  >
                    <Pen />
                  </button>
                  <button onClick={() => deleteTag(tag.id)} className="text-[var(--text-3)] hover:text-red-400 transition-colors p-1 shrink-0">
                    <Trash2 />
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

type FilterTab = 'all' | 'active' | 'completed';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('active');
  const [tagFilter, setTagFilter] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);

  const loadData = useCallback(async () => {
    const [tasksRes, tagsRes] = await Promise.all([
      tasksApi.getAll(),
      docTagsApi.getAll(),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (tagsRes.data) setTags(tagsRes.data.map(t => ({ ...t, color: t.color ?? '#FF6500' })) as Tag[]);
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

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (tagFilter && !t.tags.some(tt => tt.tagId === tagFilter)) return false;
    return true;
  });

  const grouped: { label: string; color: string; tasks: Task[] }[] = [];
  const byTag: Record<string, Task[]> = {};
  for (const t of filteredTasks) {
    const key = t.tags[0]?.tagId ?? '__none__';
    if (!byTag[key]) byTag[key] = [];
    byTag[key].push(t);
  }
  if (byTag['__none__']?.length) {
    grouped.push({ label: 'No Tag', color: 'var(--text-3)', tasks: byTag['__none__'] });
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
    <div className="max-w-3xl mx-auto p-6">
      <PageHeader
        title="Tasks"
        actionSlot={tags.length > 0 ? (
          <TagDropdown
            tags={tags}
            value={tagFilter || undefined}
            onChange={id => setTagFilter(prev => prev === id ? '' : id)}
            onManageTags={() => setShowTagManager(true)}
            align="right"
          />
        ) : undefined}
        action={{ label: 'New Task', onClick: () => { setEditingTask(null); setShowTaskModal(true); } }}
      />

      {/* Sliding tabs + active tag chip */}
      <div className="flex items-end justify-between gap-3 mb-5 flex-wrap">
        <SlidingTabs
          tabs={[
            { value: 'active' as FilterTab, label: 'Active', count: activeTasks.length },
            { value: 'all' as FilterTab, label: 'All', count: tasks.length },
            { value: 'completed' as FilterTab, label: 'Completed', count: completedCount },
          ]}
          active={filter}
          onChange={setFilter}
        />
        {tagFilter && (
          <button
            onClick={() => setTagFilter('')}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg mb-1 transition-colors shrink-0"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
          >
            <span style={{ color: tags.find(t => t.id === tagFilter)?.color }}>
              {tags.find(t => t.id === tagFilter)?.name}
            </span>
            <XIcon />
          </button>
        )}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-[var(--text-2)] text-sm">
            {filter === 'completed' ? 'No completed tasks yet' : 'No tasks. Add one to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(group => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                  {group.label}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{group.tasks.length}</span>
              </div>
              <div className="space-y-1">
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
