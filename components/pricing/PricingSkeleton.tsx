export default function PricingSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 items-center animate-pulse">
      <div className="h-10 w-64 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
      <div className="w-full rounded-3xl p-6 flex flex-col gap-5" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.06)' }}>
        <div className="h-11 w-11 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-32 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div className="h-4 w-48 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
        </div>
        <div className="h-14 w-40 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <div className="h-4 flex-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
        <div className="h-14 w-full rounded-2xl" style={{ backgroundColor: 'rgba(255,101,0,0.2)' }} />
      </div>
    </div>
  );
}
