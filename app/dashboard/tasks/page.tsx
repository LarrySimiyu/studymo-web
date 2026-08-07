'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, X } from 'lucide-react';
import { tasksApi, Task, Tag } from '@/lib/api/tasks';
import { docTagsApi } from '@/lib/api/documents';
import TaskItem from '@/components/tasks/TaskItem';
import TaskModal from '@/components/tasks/TaskModal';
import TagDropdown from '@/components/ui/TagDropdown';
import SlidingTabs from '@/components/ui/SlidingTabs';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import PageShell from '@/components/dashboard/PageShell';
import EmptyState from '@/components/dashboard/EmptyState';
import ManageTagsModal from '@/components/library/ManageTagsModal';
import DeleteConfirmModal from '@/components/library/DeleteConfirmModal';

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
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    await tasksApi.delete(pendingDelete);
    setDeleting(false);
    setPendingDelete(null);
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
  const activeTag = tags.find(t => t.id === tagFilter);

  return (
    <PageShell
      width="lg"
      header={
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
      }
    >

      {/* Sliding tabs + active tag chip */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <SlidingTabs
          tabs={[
            { value: 'active' as FilterTab, label: 'Active', count: activeTasks.length },
            { value: 'all' as FilterTab, label: 'All', count: tasks.length },
            { value: 'completed' as FilterTab, label: 'Completed', count: completedCount },
          ]}
          active={filter}
          onChange={setFilter}
        />
        {activeTag && (
          <Button variant="secondary" size="xs" className="mb-1" onClick={() => setTagFilter('')}>
            <span style={{ color: activeTag.color }}>{activeTag.name}</span>
            <X size={12} />
          </Button>
        )}
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          accent="#22C55E"
          accentBg="var(--success-subtle)"
          title={filter === 'completed' ? 'Nothing completed yet' : 'No tasks'}
          description={filter === 'completed'
            ? 'Tasks you tick off will collect here.'
            : 'Add a task to start tracking what you need to get done.'}
          action={filter === 'completed'
            ? undefined
            : { label: 'New Task', onClick: () => { setEditingTask(null); setShowTaskModal(true); } }}
        />
      ) : (
        <div className="space-y-5">
          {grouped.map(group => (
            <div key={group.label}>
              <div className="mb-2 flex items-center gap-2 px-1">
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">
                  {group.label}
                </span>
                <span className="text-xs text-[var(--text-3)]">{group.tasks.length}</span>
              </div>
              <div className="space-y-1">
                {group.tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={t => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={id => setPendingDelete(id)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        open={showTaskModal}
        task={editingTask}
        onClose={() => setShowTaskModal(false)}
        onSave={() => { setShowTaskModal(false); loadData(); }}
      />

      <ManageTagsModal
        open={showTagManager}
        onClose={() => setShowTagManager(false)}
        onChange={loadData}
      />

      <DeleteConfirmModal
        open={!!pendingDelete}
        deleting={deleting}
        title="Delete this task?"
        description="This action cannot be undone."
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </PageShell>
  );
}
