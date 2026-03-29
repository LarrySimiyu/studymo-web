import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 text-center">
        {/* Social proof badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground mb-8">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          <span>142 others started today</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Build faster with{' '}
          <span className="text-primary">AI-powered</span> tools
        </h1>

        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Your one-stop platform for AI-enhanced productivity. Get started in
          minutes and ship your first feature today.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/sign-in"
            className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow hover:opacity-90 transition-opacity"
          >
            Get started free
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-border px-6 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
