interface Props {
  /** 0-based current index */
  index: number;
  total: number;
}

export default function ProgressBar({ index, total }: Props) {
  return (
    <div className="w-full">
      <span className="text-xs text-[var(--text-3)] mb-1.5 block text-center">
        {index + 1} / {total}
      </span>
      <div className="w-full rounded-full overflow-hidden" style={{ height: 10, backgroundColor: 'var(--bg-input)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${((index + 1) / total) * 100}%`,
            backgroundColor: 'var(--brand)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
}
