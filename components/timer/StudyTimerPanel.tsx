'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStudyTimer } from '@/context/StudyTimerContext';
import { tasksApi, Task } from '@/lib/api/tasks';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alertDialog';

const PRESET_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

function fmt(secs: number) {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '00')}`;
}

function fmtMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── Collapsed Pill ───────────────────────────────────────────────────────────
function CollapsedPill({ onExpand }: { onExpand: () => void }) {
  const { status, mode, intervalSecondsRemaining, totalSecondsRemaining, totalElapsedMins } = useStudyTimer();

  const label =
    status === 'idle'
      ? 'Start Session'
      : mode === 'pomodoro'
      ? fmt(intervalSecondsRemaining)
      : fmtMins(totalSecondsRemaining / 60) + ' left';

  const dot =
    status === 'running' ? '#4ade80' : status === 'break' ? '#60a5fa' : status === 'paused' ? '#fbbf24' : '#666';

  return (
    <button
      onClick={onExpand}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl text-[var(--text-1)] text-sm font-medium transition-all hover:scale-105"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
      {status !== 'idle' && (
        <span className="text-xs text-[var(--text-2)] mr-1">{mode === 'pomodoro' ? '🍅' : '⏱'}</span>
      )}
      <span>{label}</span>
      {status !== 'idle' && (
        <span className="text-xs text-[var(--text-2)]">{fmtMins(totalElapsedMins)} studied</span>
      )}
    </button>
  );
}

// ─── Setup Panel (no active session) ─────────────────────────────────────────
function SetupPanel({ onClose }: { onClose: () => void }) {
  const { startSession } = useStudyTimer();
  const [mode, setMode] = useState<'pomodoro' | 'timeblock'>('pomodoro');
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    tasksApi.getAll({ completed: false }).then(({ data }) => {
      if (data) setTasks(data);
    });
  }, []);

  const totalEstimated = tasks
    .filter((t) => selectedIds.has(t.id))
    .reduce((s, t) => s + Math.max(0, t.estimatedMins - t.elapsedMins), 0);

  async function handleStart() {
    setLoading(true);
    setError('');
    const err = await startSession(mode, [...selectedIds], workMins, breakMins);
    if (err) setError(err);
    setLoading(false);
  }

  async function handleCreateTask() {
    if (!newTaskTitle.trim()) return;
    setCreatingTask(true);
    const { data } = await tasksApi.create({ title: newTaskTitle.trim(), estimatedMins: 45 });
    if (data) {
      setTasks((prev) => [data, ...prev]);
      setSelectedIds((prev) => new Set([...prev, data.id]));
      setNewTaskTitle('');
    }
    setCreatingTask(false);
  }

  const WORK_PRESETS = [15, 25, 45, 60];
  const BREAK_PRESETS = [5, 10, 15];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-[var(--text-1)] font-semibold">Study Timer</h3>
        <button onClick={onClose} className="text-[var(--text-2)] hover:text-[var(--text-1)] text-xl leading-none">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Mode */}
        <div className="flex gap-2">
          {(['pomodoro', 'timeblock'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize"
              style={mode === m ? { backgroundColor: 'var(--brand)', color: '#fff' } : { backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
            >
              {m === 'pomodoro' ? '🍅 Pomodoro' : '⏱ Time Block'}
            </button>
          ))}
        </div>

        {/* Pomodoro config */}
        {mode === 'pomodoro' && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--text-2)] mb-2">Work interval</p>
              <div className="flex gap-2 flex-wrap">
                {WORK_PRESETS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setWorkMins(m)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={workMins === m ? { backgroundColor: 'var(--brand)', color: '#fff' } : { backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-[var(--text-2)] mb-2">Break interval</p>
              <div className="flex gap-2">
                {BREAK_PRESETS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setBreakMins(m)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={breakMins === m ? { backgroundColor: 'var(--brand)', color: '#fff' } : { backgroundColor: 'var(--bg-input)', color: 'var(--text-2)' }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Task selection */}
        <div>
          <p className="text-xs text-[var(--text-2)] mb-2 flex items-center justify-between">
            <span>Select tasks</span>
            {mode === 'timeblock' && selectedIds.size > 0 && (
              <span style={{ color: 'var(--brand-ink)' }}>Total: {fmtMins(totalEstimated)}</span>
            )}
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {tasks.map((task) => (
              <label
                key={task.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer"
                style={{ backgroundColor: selectedIds.has(task.id) ? 'var(--brand-subtle)' : 'var(--bg-input)' }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(task.id)}
                  onChange={(e) => {
                    const next = new Set(selectedIds);
                    e.target.checked ? next.add(task.id) : next.delete(task.id);
                    setSelectedIds(next);
                  }}
                  className="rounded"
                  style={{ accentColor: 'var(--brand)' }}
                />
                {task.tags[0]?.tag && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: task.tags[0]?.tag.color }} />
                )}
                <span className="text-sm text-[var(--text-1)] flex-1 truncate">{task.title}</span>
                {mode === 'timeblock' && (
                  <select
                    value={task.estimatedMins}
                    onClick={(e) => e.stopPropagation()}
                    onChange={async (e) => {
                      e.stopPropagation();
                      const mins = Number(e.target.value);
                      await tasksApi.update(task.id, { estimatedMins: mins });
                      setTasks((prev) =>
                        prev.map((t) => t.id === task.id ? { ...t, estimatedMins: mins } : t)
                      );
                    }}
                    className="text-xs shrink-0 bg-transparent border border-[var(--border-md)] rounded px-1.5 py-0.5 text-[var(--text-2)] hover:border-[var(--brand)] hover:text-[var(--text-1)] focus:outline-none focus:border-[var(--brand)] cursor-pointer transition-colors"
                  >
                    {[5, 10, 15, 20, 25, 30, 45, 60, 90, 120].map((m) => (
                      <option key={m} value={m} style={{ backgroundColor: 'var(--bg-card)' }}>
                        {m < 60 ? `${m}m` : `${m / 60}h${m % 60 ? ` ${m % 60}m` : ''}`}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            ))}
          </div>

          {/* Quick add task */}
          <div className="flex gap-2 mt-2">
            <input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
              placeholder="Quick add task…"
              className="flex-1 px-3 py-1.5 rounded-lg text-sm text-[var(--text-1)] focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-md)' }}
            />
            <button
              onClick={handleCreateTask}
              disabled={creatingTask || !newTaskTitle.trim()}
              className="px-3 py-1.5 rounded-lg text-xs text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              +
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-white font-medium text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          {loading ? 'Starting…' : 'Start Session'}
        </button>
      </div>
    </div>
  );
}

// ─── Active Pomodoro ──────────────────────────────────────────────────────────
function PomodoroPanel({ onEndRequest }: { onEndRequest: () => void }) {
  const {
    status, currentInterval, intervalSecondsRemaining,
    workMins, breakMins, taskEntries, pauseTimer, resumeTimer, completeTaskEntry, addTaskToSession,
  } = useStudyTimer();

  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const isRunning = status === 'running' || status === 'break';
  const radius = 54;
  const total = currentInterval === 'work' ? workMins * 60 : breakMins * 60;
  const progress = intervalSecondsRemaining / total;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * progress;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm text-[var(--text-2)]">🍅 Pomodoro</span>
        <button onClick={onEndRequest} className="text-xs text-red-400 hover:text-red-300">End Session</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Circular timer */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="64" cy="64" r={radius} fill="none"
                stroke={currentInterval === 'work' ? 'var(--brand)' : '#60a5fa'}
                strokeWidth="8"
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[var(--text-1)] font-mono">{fmt(intervalSecondsRemaining)}</span>
              <span className="text-xs text-[var(--text-2)]">{currentInterval === 'work' ? 'Focus' : 'Break'}</span>
            </div>
          </div>

          <button
            onClick={isRunning ? pauseTimer : resumeTimer}
            className="mt-3 px-6 py-2 rounded-lg text-white text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: isRunning ? 'var(--text-2)' : 'var(--brand)' }}
          >
            {isRunning ? '⏸ Pause' : '▶ Resume'}
          </button>
        </div>

        {/* Tasks */}
        {taskEntries.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-[var(--text-2)] mb-2">Tasks</p>
            {taskEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--bg-input)', opacity: entry.completed ? 0.5 : 1 }}
              >
                <button
                  onClick={() => !entry.completed && completeTaskEntry(entry.id)}
                  className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                  style={{ borderColor: entry.completed ? '#4ade80' : 'var(--border-md)', backgroundColor: entry.completed ? '#4ade8020' : 'transparent' }}
                >
                  {entry.completed && <span className="text-green-400 text-xs">✓</span>}
                </button>
                {entry.task.tags[0]?.tag && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.task.tags[0]?.tag.color }} />
                )}
                <span className={`text-sm flex-1 truncate ${entry.completed ? 'line-through text-[var(--text-2)]' : 'text-[var(--text-1)]'}`}>
                  {entry.task.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick add */}
        {adding ? (
          <div className="flex gap-2 mt-3">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && newTitle.trim() && !saving) {
                  setSaving(true);
                  await addTaskToSession(newTitle.trim());
                  setSaving(false);
                  setNewTitle('');
                  setAdding(false);
                }
                if (e.key === 'Escape') setAdding(false);
              }}
              placeholder="Task title…"
              className="flex-1 px-3 py-1.5 rounded-lg text-sm text-[var(--text-1)] focus:outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-md)' }}
            />
            <button
              disabled={saving || !newTitle.trim()}
              onClick={async () => {
                if (!newTitle.trim() || saving) return;
                setSaving(true);
                await addTaskToSession(newTitle.trim());
                setSaving(false);
                setNewTitle('');
                setAdding(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              {saving ? '…' : '+'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-3 w-full py-2 rounded-lg text-xs text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-black/5 transition-colors"
          >
            + Add Task
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Active Time Block ────────────────────────────────────────────────────────
function TimeBlockPanel({ onEndRequest }: { onEndRequest: () => void }) {
  const {
    status, taskEntries, activeTaskEntryId,
    totalSecondsRemaining, pauseTimer, resumeTimer,
    setActiveTask, completeTaskEntry,
  } = useStudyTimer();

  const isRunning = status === 'running';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm text-[var(--text-2)]">⏱ Time Block</span>
        <button onClick={onEndRequest} className="text-xs text-red-400 hover:text-red-300">End Session</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Total remaining */}
        <div className="text-center py-2">
          <p className="text-3xl font-bold font-mono text-[var(--text-1)]">{fmt(totalSecondsRemaining)}</p>
          <p className="text-xs text-[var(--text-2)] mt-1">total remaining</p>
          <button
            onClick={isRunning ? pauseTimer : resumeTimer}
            className="mt-3 px-6 py-2 rounded-lg text-white text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: isRunning ? 'var(--text-2)' : 'var(--brand)' }}
          >
            {isRunning ? '⏸ Pause' : '▶ Resume'}
          </button>
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {taskEntries.map((entry) => {
            const isActive = entry.id === activeTaskEntryId && !entry.completed;
            const taskRemaining = Math.max(0, entry.task.estimatedMins * 60 - entry.elapsedMins * 60);

            return (
              <div
                key={entry.id}
                onClick={() => !entry.completed && setActiveTask(entry.id)}
                className="p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--brand-subtle)' : 'var(--bg-input)',
                  border: `1px solid ${isActive ? 'var(--brand)' : 'var(--border-md)'}`,
                  opacity: entry.completed ? 0.5 : 1,
                }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!entry.completed) completeTaskEntry(entry.id); }}
                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                    style={{ borderColor: entry.completed ? '#4ade80' : 'var(--border-md)', backgroundColor: entry.completed ? '#4ade8020' : 'transparent' }}
                  >
                    {entry.completed && <span className="text-green-400 text-xs">✓</span>}
                  </button>
                  {entry.task.tags[0]?.tag && (
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.task.tags[0]?.tag.color }} />
                  )}
                  <span className={`text-sm flex-1 truncate font-medium ${entry.completed ? 'line-through text-[var(--text-2)]' : 'text-[var(--text-1)]'}`}>
                    {entry.task.title}
                  </span>
                  <span className="text-xs font-mono shrink-0" style={{ color: isActive ? 'var(--brand)' : 'var(--text-3)' }}>
                    {fmt(taskRemaining)}
                  </span>
                </div>
                {isActive && (
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-md)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (entry.elapsedMins / entry.task.estimatedMins) * 100)}%`,
                        backgroundColor: 'var(--brand)',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── End Session Confirmation ─────────────────────────────────────────────────
function EndConfirmModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { totalElapsedMins, taskEntries } = useStudyTimer();
  const completed = taskEntries.filter((e) => e.completed).length;

  return (
    <AlertDialog open={open} onOpenChange={o => !o && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader className="mb-5 items-start text-left">
          <AlertDialogTitle>End Session?</AlertDialogTitle>
          <AlertDialogDescription className="mt-2">
            Time studied: {fmtMins(totalElapsedMins)}
            <br />
            Tasks completed: {completed} / {taskEntries.length}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[var(--brand)] text-white"
          >
            Save &amp; End
          </AlertDialogAction>
          <AlertDialogCancel className="border-0 bg-[var(--bg-input)] text-[var(--text-1)]">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function StudyTimerPanel() {
  const { isCollapsed, toggleCollapsed, status, mode, endSession } = useStudyTimer();
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const hasSession = status !== 'idle';

  if (isCollapsed) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <CollapsedPill onExpand={toggleCollapsed} />
      </div>
    );
  }

  return (
    <>
      <EndConfirmModal
        open={showEndConfirm}
        onConfirm={async () => {
          await endSession();
          setShowEndConfirm(false);
        }}
        onCancel={() => setShowEndConfirm(false)}
      />

      <div
        className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl shadow-2xl flex flex-col"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          maxHeight: '80vh',
        }}
      >
        {!hasSession && <SetupPanel onClose={toggleCollapsed} />}
        {hasSession && mode === 'pomodoro' && (
          <PomodoroPanel onEndRequest={() => setShowEndConfirm(true)} />
        )}
        {hasSession && mode === 'timeblock' && (
          <TimeBlockPanel onEndRequest={() => setShowEndConfirm(true)} />
        )}

        {/* Collapse button */}
        <button
          onClick={toggleCollapsed}
          className="absolute top-4 right-4"
          style={{ display: hasSession ? 'none' : 'none' }}
        />
        <button
          onClick={toggleCollapsed}
          className="mx-4 mb-3 py-1.5 rounded-lg text-xs text-[var(--text-3)] hover:text-[var(--text-2)] hover:bg-black/5 transition-colors"
        >
          Collapse ↓
        </button>
      </div>
    </>
  );
}
