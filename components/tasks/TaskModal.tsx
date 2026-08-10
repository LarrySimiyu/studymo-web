'use client';

import { useEffect, useState } from 'react';
import { tasksApi, Task } from '@/lib/api/tasks';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import UsageCounter from '@/components/dashboard/UsageCounter';
import { Calendar } from '@/components/ui/calendar';
import * as Popover from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TaskModalProps {
  open: boolean;
  task?: Task | null;
  defaultDueDate?: string;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export default function TaskModal({ open, task, defaultDueDate, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.split('T')[0] : (defaultDueDate ?? '')
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? '');
    setDueDate(task?.dueDate ? task.dueDate.split('T')[0] : (defaultDueDate ?? ''));
    setError('');
  }, [open, task, defaultDueDate]);

  // const [estimatedMins, setEstimatedMins] = useState(task?.estimatedMins ?? 45);
  // const [tagId, setTagId] = useState(task?.tags?.[0]?.tagId ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    const payload = {
      title: title.trim(),
      dueDate: dueDate || undefined,
      // estimatedMins,
      // tagId: tagId || undefined,
    };
    const { data, error: apiError } = task
      ? await tasksApi.update(task.id, payload)
      : await tasksApi.create(payload);
    setSaving(false);
    if (apiError || !data) { setError(apiError ?? 'Something went wrong'); return; }
    onSave(data);
  }

  const minDate = new Date();

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent>
        <DialogHeader className="mb-5 gap-1">
          <DialogTitle className="text-body-lg font-bold">{task ? 'Edit Task' : 'New Task'}</DialogTitle>
          <DialogDescription className="text-xs text-[var(--text-3)]">
            {task ? 'Update your task details.' : 'Add a new task to your list.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-[var(--text-1)]">Title</label>
            <Input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-[var(--text-1)]">Due Date</label>
            <Popover.Root open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl border border-[var(--border-md)] bg-[var(--bg-card)] px-3 py-2.5 text-left text-body-sm transition-colors hover:border-[var(--brand)]',
                    dueDate ? 'text-[var(--text-1)]' : 'text-[var(--text-3)]'
                  )}
                >
                  <CalendarIcon size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  {dueDate
                    ? new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Pick a date'}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  align="start"
                  sideOffset={6}
                  className="z-[60] rounded-2xl p-4 shadow-2xl"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-md)', width: 300 }}
                >
                  <Calendar
                    mode="single"
                    selected={dueDate ? new Date(dueDate + 'T00:00:00') : undefined}
                    onSelect={date => {
                      if (date) setDueDate(date.toLocaleDateString('en-CA'));
                      setDatePickerOpen(false);
                    }}
                    disabled={{ before: minDate }}
                  />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>

          {/* <div>
            <label className="block text-xs font-medium mb-1.5 text-[var(--text-1)]">Duration</label>
            <select ...>...</select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-[var(--text-1)]">Subject Tag</label>
            <select ...>...</select>
          </div> */}

          {error && <p className="text-[var(--danger-ink)] text-xs">{error}</p>}

          <div className="flex flex-col items-center gap-2 pt-1">
            <Button variant="primary" size="lg" type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving…' : task ? 'Save Changes' : 'Add Task'}
            </Button>
            {!task && <UsageCounter limitKey="tasks" />}
            <Button type="button" variant="link" size="link" className="text-xs" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
