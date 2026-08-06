// Mirrors TAG_COLORS in studymo-api/src/lib/tagColors.ts — the API assigns these
// to AI-generated and onboarding tags, so the pickers must offer the same set.
export const TAG_COLORS = [
  '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F97316', '#06B6D4', '#84CC16', '#9747FF', '#64748B',
];

const COLOR_NAMES: Record<string, string> = {
  '#3B82F6': 'Blue',   '#22C55E': 'Green',  '#F59E0B': 'Amber',
  '#EF4444': 'Red',    '#8B5CF6': 'Violet', '#EC4899': 'Pink',
  '#14B8A6': 'Teal',   '#F97316': 'Orange', '#06B6D4': 'Cyan',
  '#84CC16': 'Lime',   '#9747FF': 'Purple', '#64748B': 'Slate',
};

export function colorName(hex: string): string {
  return COLOR_NAMES[hex.toUpperCase()] ?? 'Custom';
}

const FALLBACK = '#FF6500';

// Older rows can hold 'var(--brand)', which produces invalid CSS once the alpha
// suffix is appended, so anything that isn't 6-digit hex falls back to brand.
export function tagColor(color?: string | null): string {
  return color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : FALLBACK;
}

export function tagStyle(color?: string | null): { backgroundColor: string; color: string } {
  const hex = tagColor(color);
  return { backgroundColor: `${hex}22`, color: hex };
}
