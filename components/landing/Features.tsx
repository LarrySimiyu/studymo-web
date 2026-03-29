const FEATURES = [
  {
    title: 'AI-Powered Insights',
    description:
      'Leverage Claude to analyze your data and surface actionable insights automatically.',
    icon: '✦',
  },
  {
    title: 'Real-Time Collaboration',
    description:
      'Work together with your team in real time with live cursors, comments, and notifications.',
    icon: '⚡',
  },
  {
    title: 'Enterprise Security',
    description:
      'SOC 2 compliant infrastructure with end-to-end encryption and granular access controls.',
    icon: '🔒',
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-muted/40 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            All the tools to move fast without breaking things.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-8 shadow-sm"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
