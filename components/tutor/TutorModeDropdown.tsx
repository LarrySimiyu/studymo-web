'use client';

import { GraduationCap, MessageCircle, Microscope, Speech, Puzzle } from 'lucide-react';
import Select, { SelectOption } from '@/components/ui/Select';

export type TutorMode = 'casual' | 'tutor' | 'strict' | 'teach_back' | 'eli5';

const MODES: SelectOption[] = [
  { value: 'tutor',      label: 'Tutor',      description: 'Guided, step-by-step',   icon: GraduationCap },
  { value: 'casual',     label: 'Casual',     description: 'Relaxed, conversational', icon: MessageCircle },
  { value: 'strict',     label: 'Strict',     description: 'Precise, no hand-holding', icon: Microscope },
  { value: 'teach_back', label: 'Teach Back', description: 'You explain, I correct',  icon: Speech },
  { value: 'eli5',       label: 'Simple',     description: 'Plain language',          icon: Puzzle },
];

interface Props {
  value: TutorMode;
  onChange: (mode: TutorMode) => void;
}

export default function TutorModeDropdown({ value, onChange }: Props) {
  return (
    <Select
      value={value}
      onChange={v => onChange(v as TutorMode)}
      options={MODES}
      variant="button"
      align="end"
    />
  );
}
