'use client';

import { useEffect, useRef, useState } from 'react';

interface Tab<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface Props<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (value: T) => void;
}

export default function SlidingTabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [, forceUpdate] = useState(0);
  const activeIndex = tabs.findIndex(t => t.value === active);

  // Refs aren't populated on first paint — re-render once after mount
  useEffect(() => { forceUpdate(n => n + 1); }, []);

  return (
    <div className="relative flex overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}>
      {tabs.map((tab, i) => (
        <button
          key={tab.value}
          ref={el => { tabRefs.current[i] = el; }}
          onClick={() => onChange(tab.value)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors shrink-0"
          style={{ color: active === tab.value ? 'var(--text-1)' : 'var(--text-3)' }}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full tabular-nums"
              style={{
                backgroundColor: active === tab.value ? 'rgba(255,101,0,0.12)' : 'var(--bg-input)',
                color: active === tab.value ? 'var(--brand)' : 'var(--text-3)',
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
      {/* Sliding indicator */}
      <span
        className="absolute bottom-0 h-0.5 rounded-full"
        style={{
          backgroundColor: 'var(--brand)',
          left: tabRefs.current[activeIndex]?.offsetLeft ?? 0,
          width: tabRefs.current[activeIndex]?.offsetWidth ?? 0,
          transition: 'left 0.2s ease, width 0.2s ease',
        }}
      />
    </div>
  );
}
