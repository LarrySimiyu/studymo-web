import { gridColumns } from './pricingContent';

export default function PricingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid w-full animate-pulse gap-4 sm:gap-5 ${gridColumns(count)}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl p-5 sm:p-6"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="h-6" />
          <div className="mt-3 h-4 w-16 rounded-md" style={{ backgroundColor: 'var(--bg-input)' }} />
          <div className="mt-2 h-9 w-28 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }} />
          <div className="mt-2.5 h-4" />
          <div className="mt-5 h-11 w-full rounded-full" style={{ backgroundColor: 'var(--bg-hover)' }} />
          <div className="mt-6 h-4 w-32 rounded-md" style={{ backgroundColor: 'var(--bg-input)' }} />
          <div className="mt-3 flex flex-col gap-2.5">
            {[...Array(5)].map((__, j) => (
              <div key={j} className="flex items-center gap-2.5">
                <div className="h-5 w-5 shrink-0 rounded-md" style={{ backgroundColor: 'var(--bg-input)' }} />
                <div className="h-4 flex-1 rounded-md" style={{ backgroundColor: 'var(--bg-input)' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
