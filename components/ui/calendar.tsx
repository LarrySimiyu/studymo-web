'use client';

import * as React from 'react';
import { DayPicker, type DayPickerProps, useDayPicker, type MonthCaptionProps } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

function CalendarHeader({ calendarMonth, compact }: MonthCaptionProps & { compact?: boolean }) {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker();
  const label = calendarMonth.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span className={cn('font-semibold text-[var(--text-1)]', compact ? 'text-xs' : 'text-body-sm')}>{label}</span>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size={compact ? 'icon-xs' : 'icon-sm'}
          onClick={() => previousMonth && goToMonth(previousMonth)}
          disabled={!previousMonth}
          aria-label="Previous month"
          className="text-[var(--text-1)] disabled:opacity-30"
        >
          <ChevronLeft size={compact ? 14 : 16} />
        </Button>
        <Button
          variant="ghost"
          size={compact ? 'icon-xs' : 'icon-sm'}
          onClick={() => nextMonth && goToMonth(nextMonth)}
          disabled={!nextMonth}
          aria-label="Next month"
          className="text-[var(--text-1)] disabled:opacity-30"
        >
          <ChevronRight size={compact ? 14 : 16} />
        </Button>
      </div>
    </div>
  );
}

export type CalendarProps = DayPickerProps & {
  scheduledDates?: Set<string>;
  completedDates?: Set<string>;
  compact?: boolean;
};

export function Calendar({ scheduledDates, completedDates, compact, ...props }: CalendarProps) {
  return (
    <>
      <style>{`
        .rdp-root { width: 100%; }
        .rdp-months { width: 100%; }
        .rdp-month { width: 100%; position: relative; }

        .rdp-month_caption {
          display: flex;
          align-items: center;
          min-height: 32px;
          margin-bottom: 10px;
        }
        .rdp-caption_label {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-1);
        }

        .rdp-nav { display: none; }

        .rdp-month_grid {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }

        .rdp-weekday {
          text-align: center;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-3);
          padding-bottom: 6px;
        }

        .rdp-day { text-align: center; padding: 3px; }

        .rdp-day_button {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 8px;
          font-size: clamp(13px, 1.8vw, 18px);
          cursor: pointer;
          border: none;
          background: transparent;
          color: var(--text-2);
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0 auto;
        }
        .rdp-day_button:hover {
          background: var(--bg-hover);
          color: var(--text-1);
        }

        .rdp-selected .rdp-day_button {
          background: var(--text-1) !important;
          color: var(--bg-page) !important;
          font-weight: 700;
        }
        .rdp-today .rdp-day_button {
          background: var(--bg-input);
          color: var(--text-1);
          font-weight: 600;
        }
        .rdp-outside .rdp-day_button { opacity: 0.25; }
        .rdp-disabled .rdp-day_button { opacity: 0.2; cursor: not-allowed; }

        /* Compact overrides */
        .rdp-compact .rdp-weekday {
          font-size: 9px;
          padding-bottom: 4px;
        }
        .rdp-compact .rdp-day { padding: 2px; }
        .rdp-compact .rdp-day_button {
          font-size: 11px;
          border-radius: 6px;
        }
      `}</style>
      <div className={compact ? 'rdp-compact' : undefined}>
        <DayPicker
          {...props}
          components={{
            MonthCaption: (p) => <CalendarHeader {...p} compact={compact} />,
            DayButton: ({ day, modifiers, ...btnProps }) => {
              const dateStr = day.date.toISOString().split('T')[0];
              const isScheduled = scheduledDates?.has(dateStr);
              const isCompleted = completedDates?.has(dateStr);
              return (
                <button {...btnProps}>
                  {day.date.getDate()}
                  {(isScheduled || isCompleted) && (
                    <span style={{
                      position: 'absolute',
                      bottom: compact ? 2 : 3,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: compact ? 4 : 6,
                      height: compact ? 4 : 6,
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#22C55E' : 'var(--brand)',
                    }} />
                  )}
                </button>
              );
            },
          }}
        />
      </div>
    </>
  );
}
