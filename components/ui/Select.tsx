'use client';

import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'pill' | 'button';
  align?: 'start' | 'end';
}

const EMPTY = '__empty__';

function encode(v: string) { return v === '' ? EMPTY : v; }
function decode(v: string) { return v === EMPTY ? '' : v; }

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  variant = 'pill',
  align = 'start',
}: Props) {
  const selected = options.find(o => o.value === value);
  const SelectedIcon = selected?.icon;

  return (
    <RadixSelect.Root value={encode(value)} onValueChange={v => onChange(decode(v))}>
      <RadixSelect.Trigger
        className={cn(
          'flex items-center outline-none transition-colors hover:bg-[var(--bg-hover)]',
          variant === 'pill'
            ? 'gap-1.5 px-2.5 py-1 rounded-full text-xs'
            : 'gap-2 px-3 py-1.5 rounded-lg text-sm font-medium'
        )}
        style={{
          backgroundColor: variant === 'pill' ? 'var(--bg-input)' : 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-1)',
        }}
      >
        {SelectedIcon && <SelectedIcon size={14} strokeWidth={1.75} style={{ color: 'var(--text-2)' }} />}
        <RadixSelect.Value placeholder={placeholder}>
          {selected?.label ?? placeholder}
        </RadixSelect.Value>
        <RadixSelect.Icon>
          <ChevronDown size={variant === 'pill' ? 11 : 14} style={{ color: 'var(--text-3)' }} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          align={align}
          className="z-50 rounded-xl shadow-xl p-1 overflow-hidden"
          style={{
            minWidth: 'max(180px, var(--radix-select-trigger-width))',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <RadixSelect.Viewport>
            {options.map(opt => {
              const Icon = opt.icon;
              return (
                <RadixSelect.Item
                  key={encode(opt.value)}
                  value={encode(opt.value)}
                  className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer outline-none select-none transition-colors data-[highlighted]:bg-[var(--bg-hover)]"
                  style={{ color: 'var(--text-1)' }}
                >
                  {Icon && <Icon size={15} strokeWidth={1.75} className="shrink-0" style={{ color: 'var(--text-2)' }} />}
                  <div className="flex flex-col min-w-0">
                    <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                    {opt.description && (
                      <span className="text-2xs leading-tight mt-0.5" style={{ color: 'var(--text-3)' }}>
                        {opt.description}
                      </span>
                    )}
                  </div>
                </RadixSelect.Item>
              );
            })}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
