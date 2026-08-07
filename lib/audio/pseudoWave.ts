const DEFAULT_COUNT = 240;

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stand-in waveform for remote audio we never decode. Alternates spoken phrases with
 * short breaths so it reads like narration rather than noise, and is stable per seed
 * so a given podcast always draws the same bars.
 */
export function pseudoWave(seed: string, count = DEFAULT_COUNT): number[] {
  const rand = mulberry32(hash(seed));
  const out: number[] = [];
  let remaining = 0;
  let speaking = false;
  let level = 0.6;

  for (let i = 0; i < count; i++) {
    if (remaining <= 0) {
      speaking = !speaking;
      remaining = speaking ? 12 + Math.floor(rand() * 26) : 2 + Math.floor(rand() * 4);
      level = 0.45 + rand() * 0.4;
    }
    remaining--;

    if (!speaking) {
      out.push(0.05 + rand() * 0.05);
      continue;
    }
    const syllable = 0.55 + 0.45 * Math.abs(Math.sin(i * 0.9));
    out.push(Math.min(1, level * syllable * (0.75 + rand() * 0.5)));
  }
  return out;
}
