type Props = {
  answer: string;
};

export default function QuickAnswer({ answer }: Props) {
  return (
    <div
      className="border-l-4 rounded-r-xl px-5 py-4 mb-8"
      style={{
        borderColor: '#FF6500',
        backgroundColor: 'rgba(255,101,0,0.06)',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#FF6500' }}>
        Quick answer
      </p>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>
        {answer}
      </p>
    </div>
  );
}
