export default function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="px-4 py-2.5 rounded-2xl rounded-br-sm text-[var(--text-1)] max-w-[80%] whitespace-pre-wrap leading-relaxed text-sm"
        style={{ backgroundColor: 'var(--bg-hover)' }}
      >
        {content}
      </div>
    </div>
  );
}
