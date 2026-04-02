interface Props {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
}

export default function AddButton({ onClick, loading, disabled, title }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-base font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: 'var(--brand)' }}
      title={title}
    >
      {loading ? (
        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
      ) : '+'}
    </button>
  );
}
