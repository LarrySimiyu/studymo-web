'use client';

import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

const EMPTY = '__empty__';

function encode(v: string) { return v === '' ? EMPTY : v; }
function decode(v: string) { return v === EMPTY ? '' : v; }

export default function Select({ value, onChange, options, placeholder = 'Select…' }: Props) {
  const selected = options.find(o => o.value === value);

  return (
    <RadixSelect.Root value={encode(value)} onValueChange={v => onChange(decode(v))}>
      <RadixSelect.Trigger
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs outline-none transition-colors"
        style={{
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border)',
          color: 'var(--text-1)',
        }}
      >
        <RadixSelect.Value placeholder={placeholder}>
          {selected?.label ?? placeholder}
        </RadixSelect.Value>
        <RadixSelect.Icon>
          <ChevronDown size={11} style={{ color: 'var(--text-3)' }} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 min-w-[180px] rounded-xl shadow-xl py-1 overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <RadixSelect.Viewport>
            {options.map(opt => (
              <RadixSelect.Item
                key={encode(opt.value)}
                value={encode(opt.value)}
                className="relative flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer outline-none select-none transition-colors"
                style={{ color: 'var(--text-1)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="ml-auto">
                  <Check size={11} style={{ color: 'var(--brand)' }} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
