'use client';

import { useEffect, useState, useCallback } from 'react';
import { tasksApi, Task } from '@/lib/api/tasks';
import TaskItem from '@/components/tasks/TaskItem';
import TaskModal from '@/components/tasks/TaskModal';
import { Plus, ClipboardList } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function TasksPanel({ onCountChange, hideCompleted }: { onCountChange?: (n: number) => void; hideCompleted?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const load = useCallback(async () => {
    const { data } = await tasksApi.getAll().catch(() => ({ data: null }));
    if (data) {
      setTasks(data);
      onCountChange?.(data.filter(t => !t.completed).length);
    }
    setLoading(false);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (task: Task) => {
    await tasksApi.update(task.id, { completed: !task.completed }).catch(() => {});
    load();
  };

  const handleDelete = async (id: string) => {
    await tasksApi.delete(id).catch(() => {});
    load();
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-2)]">
            {activeTasks.length} active{completedTasks.length > 0 ? ` · ${completedTasks.length} done` : ''}
          </span>
          <button
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
          >
            <Plus size={12} /> New Task
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-card)' }} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <ClipboardList size={20} style={{ color: 'var(--text-3)' }} className="mb-2" />
            <p className="text-xs text-[var(--text-3)] mb-1">No tasks yet</p>
            <button
              onClick={() => { setEditingTask(null); setShowModal(true); }}
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: 'var(--brand)' }}
            >
              Add your first task
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {/* Active */}
            <AnimatePresence initial={false}>
              {activeTasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <TaskItem
                    task={task}
                    compact
                    onToggle={handleToggle}
                    onEdit={t => { setEditingTask(t); setShowModal(true); }}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Completed */}
            {!hideCompleted && completedTasks.length > 0 && (
              <div className="mt-1">
                <p className="text-[10px] font-medium uppercase tracking-wide mb-1.5 px-1" style={{ color: 'var(--text-3)' }}>
                  Completed · {completedTasks.length}
                </p>
                <div className="flex flex-col gap-1.5">
                  {completedTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      compact
                      onToggle={handleToggle}
                      onEdit={t => { setEditingTask(t); setShowModal(true); }}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load(); }}
        />
      )}
    </>
  );
}
