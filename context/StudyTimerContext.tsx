'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { studySessionsApi, StudySession, SessionTaskEntry } from '@/lib/api/tasks';
import { auth } from '@/lib/firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

type TimerMode = 'pomodoro' | 'timeblock';
type TimerStatus = 'idle' | 'running' | 'paused' | 'break';

interface TimerState {
  session: StudySession | null;
  mode: TimerMode | null;
  status: TimerStatus;
  workMins: number;
  breakMins: number;
  currentInterval: 'work' | 'break';
  intervalSecondsRemaining: number;
  taskEntries: SessionTaskEntry[];
  activeTaskEntryId: string | null;
  totalSecondsRemaining: number;
  totalElapsedSecs: number;
}

interface TimerContextValue extends TimerState {
  isCollapsed: boolean;
  totalElapsedMins: number;
  startSession: (
    mode: TimerMode,
    taskIds?: string[],
    workMins?: number,
    breakMins?: number
  ) => Promise<string | null>;
  pauseTimer: () => void;
  resumeTimer: () => void;
  endSession: () => Promise<void>;
  abandonSession: () => Promise<void>;
  setActiveTask: (entryId: string) => void;
  toggleCollapsed: () => void;
  completeTaskEntry: (entryId: string) => void;
  addTaskToSession: (title: string) => Promise<void>;
}

const DEFAULT: TimerState = {
  session: null,
  mode: null,
  status: 'idle',
  workMins: 25,
  breakMins: 5,
  currentInterval: 'work',
  intervalSecondsRemaining: 25 * 60,
  taskEntries: [],
  activeTaskEntryId: null,
  totalSecondsRemaining: 0,
  totalElapsedSecs: 0,
};

const StudyTimerContext = createContext<TimerContextValue | null>(null);

export function StudyTimerProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<TimerState>({ ...DEFAULT });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, setTick] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const render = useCallback(() => setTick((t) => t + 1), []);

  const set = useCallback(
    (updates: Partial<TimerState>) => {
      ref.current = { ...ref.current, ...updates };
      render();
    },
    [render]
  );

  // Build progress payload from current ref
  const buildProgress = () => ({
    totalElapsedMins: Math.round(ref.current.totalElapsedSecs / 60),
    taskEntries: ref.current.taskEntries.map((e) => ({
      id: e.id,
      elapsedMins: Math.round(e.elapsedMins),
      completed: e.completed,
    })),
  });

  const saveProgressToAPI = useCallback(async () => {
    const { session } = ref.current;
    if (!session) return;
    try {
      await studySessionsApi.saveProgress(session.id, buildProgress());
    } catch {
      // silent
    }
  }, []);

  const stopTicking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTicking = useCallback(() => {
    stopTicking();
    intervalRef.current = setInterval(() => {
      const t = ref.current;
      if (t.status !== 'running' && t.status !== 'break') return;

      const newElapsedSecs = t.totalElapsedSecs + 1;

      if (newElapsedSecs % 30 === 0 && t.session) {
        studySessionsApi
          .saveProgress(t.session.id, {
            totalElapsedMins: Math.round(newElapsedSecs / 60),
            taskEntries: t.taskEntries.map((e) => ({
              id: e.id,
              elapsedMins: Math.round(e.elapsedMins),
              completed: e.completed,
            })),
          })
          .catch(() => {});
      }

      if (t.mode === 'pomodoro') {
        const newRemaining = Math.max(0, t.intervalSecondsRemaining - 1);
        if (newRemaining === 0) {
          if (t.currentInterval === 'work') {
            ref.current = {
              ...t,
              currentInterval: 'break',
              status: 'break',
              intervalSecondsRemaining: t.breakMins * 60,
              totalElapsedSecs: newElapsedSecs,
            };
          } else {
            ref.current = {
              ...t,
              currentInterval: 'work',
              status: 'running',
              intervalSecondsRemaining: t.workMins * 60,
              totalElapsedSecs: newElapsedSecs,
            };
          }
        } else {
          ref.current = {
            ...t,
            intervalSecondsRemaining: newRemaining,
            totalElapsedSecs: newElapsedSecs,
          };
        }
      } else if (t.mode === 'timeblock') {
        const newTotal = Math.max(0, t.totalSecondsRemaining - 1);
        const activeIdx = t.taskEntries.findIndex(
          (e) => e.id === t.activeTaskEntryId && !e.completed
        );

        if (activeIdx >= 0) {
          const newEntries = t.taskEntries.map((e, i) => {
            if (i !== activeIdx) return e;
            const newElapsed = e.elapsedMins + 1 / 60;
            const done = newElapsed * 60 >= e.task.estimatedMins * 60;
            return { ...e, elapsedMins: newElapsed, completed: done };
          });

          let newActiveId = t.activeTaskEntryId;
          let newStatus: TimerStatus = t.status;

          if (newEntries[activeIdx].completed && !t.taskEntries[activeIdx].completed) {
            const next = newEntries.find((e, i) => i > activeIdx && !e.completed);
            newActiveId = next?.id ?? null;
            if (!next) newStatus = 'paused';
          }

          ref.current = {
            ...t,
            taskEntries: newEntries,
            activeTaskEntryId: newActiveId,
            totalSecondsRemaining: newTotal,
            totalElapsedSecs: newElapsedSecs,
            status: newStatus,
          };
        } else {
          ref.current = { ...t, totalSecondsRemaining: newTotal, totalElapsedSecs: newElapsedSecs };
        }
      }

      setTick((k) => k + 1);
    }, 1000);
  }, [stopTicking]);

  // Restore active session on mount
  useEffect(() => {
    studySessionsApi
      .getActive()
      .then(({ data: session }) => {
        if (!session) return;
        const entries = session.taskEntries ?? [];
        const firstIncomplete = entries.find((e) => !e.completed);
        const totalRemainingMins = entries
          .filter((e) => !e.completed)
          .reduce((sum, e) => sum + Math.max(0, e.task.estimatedMins - e.elapsedMins), 0);

        ref.current = {
          session,
          mode: session.mode,
          status: 'paused',
          workMins: session.workMins,
          breakMins: session.breakMins,
          currentInterval: 'work',
          intervalSecondsRemaining: session.workMins * 60,
          taskEntries: entries,
          activeTaskEntryId: firstIncomplete?.id ?? null,
          totalSecondsRemaining: Math.round(totalRemainingMins * 60),
          totalElapsedSecs: session.totalMins * 60,
        };
        setIsCollapsed(false);
        render();
      })
      .catch(() => {});
  }, [render]);

  useEffect(() => () => stopTicking(), [stopTicking]);

  // Warn before tab close / refresh when a session is active
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (ref.current.status === 'idle') return;
      e.preventDefault();
      e.returnValue = ''; // triggers native "Leave site?" dialog
    };

    const handlePageHide = () => {
      const { session, status } = ref.current;
      if (!session || status === 'idle') return;
      // Abandon session via keepalive fetch so it fires even as page unloads
      auth.currentUser?.getIdToken().then((token) => {
        fetch(`${API_URL}/study-sessions/${session.id}/abandon`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
          keepalive: true,
        }).catch(() => {});
      }).catch(() => {});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  const startSession = useCallback(
    async (
      mode: TimerMode,
      taskIds: string[] = [],
      workMins = 25,
      breakMins = 5
    ): Promise<string | null> => {
      const { data, error } = await studySessionsApi.start({ mode, taskIds, workMins, breakMins });
      if (error) return error;
      if (!data) return 'Failed to start session';

      const entries = data.taskEntries ?? [];
      const firstEntry = entries[0] ?? null;
      const totalSecs = entries
        .filter((e) => !e.completed)
        .reduce((sum, e) => sum + Math.max(0, e.task.estimatedMins - e.elapsedMins) * 60, 0);

      ref.current = {
        session: data,
        mode,
        status: 'running',
        workMins,
        breakMins,
        currentInterval: 'work',
        intervalSecondsRemaining: workMins * 60,
        taskEntries: entries,
        activeTaskEntryId: firstEntry?.id ?? null,
        totalSecondsRemaining: Math.round(totalSecs),
        totalElapsedSecs: 0,
      };
      setIsCollapsed(false);
      render();
      startTicking();
      return null;
    },
    [startTicking, render]
  );

  const pauseTimer = useCallback(() => {
    stopTicking();
    set({ status: 'paused' });
    saveProgressToAPI();
  }, [stopTicking, set, saveProgressToAPI]);

  const resumeTimer = useCallback(() => {
    const t = ref.current;
    const newStatus =
      t.mode === 'pomodoro' && t.currentInterval === 'break' ? 'break' : 'running';
    set({ status: newStatus });
    startTicking();
  }, [set, startTicking]);

  const endSession = useCallback(async () => {
    stopTicking();
    const { session } = ref.current;
    if (!session) return;
    await studySessionsApi.end(session.id, buildProgress()).catch(() => {});
    ref.current = { ...DEFAULT };
    render();
  }, [stopTicking, render]);

  const abandonSession = useCallback(async () => {
    stopTicking();
    const { session } = ref.current;
    if (!session) return;
    await studySessionsApi.abandon(session.id).catch(() => {});
    ref.current = { ...DEFAULT };
    render();
  }, [stopTicking, render]);

  const setActiveTask = useCallback(
    (entryId: string) => set({ activeTaskEntryId: entryId }),
    [set]
  );

  const completeTaskEntry = useCallback(
    (entryId: string) => {
      const t = ref.current;
      const newEntries = t.taskEntries.map((e) =>
        e.id === entryId ? { ...e, completed: true } : e
      );
      const activeIdx = newEntries.findIndex((e) => e.id === entryId);
      const next = newEntries.find((e, i) => i > activeIdx && !e.completed);
      set({
        taskEntries: newEntries,
        activeTaskEntryId: next?.id ?? t.activeTaskEntryId,
      });
    },
    [set]
  );

  const addTaskToSession = useCallback(async (title: string): Promise<void> => {
    const { session } = ref.current;
    if (!session) return;
    const { data } = await studySessionsApi.addTask(session.id, title);
    if (!data) return;
    set({ taskEntries: [...ref.current.taskEntries, data] });
  }, [set]);

  const toggleCollapsed = useCallback(() => setIsCollapsed((c) => !c), []);

  const t = ref.current;

  return (
    <StudyTimerContext.Provider
      value={{
        ...t,
        isCollapsed,
        totalElapsedMins: t.totalElapsedSecs / 60,
        startSession,
        pauseTimer,
        resumeTimer,
        endSession,
        abandonSession,
        setActiveTask,
        toggleCollapsed,
        completeTaskEntry,
        addTaskToSession,
      }}
    >
      {children}
    </StudyTimerContext.Provider>
  );
}

export function useStudyTimer(): TimerContextValue {
  const ctx = useContext(StudyTimerContext);
  if (!ctx) throw new Error('useStudyTimer must be used within StudyTimerProvider');
  return ctx;
}
