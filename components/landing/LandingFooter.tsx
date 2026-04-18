export default function LandingFooter() {
  return (
    <footer className="flex justify-center gap-6 py-6">
      <a href="/blog" className="text-xs" style={{ color: 'var(--text-2)' }}>Blog</a>
      <a href="/privacy" className="text-xs" style={{ color: 'var(--text-2)' }}>Privacy Policy</a>
      <a href="/terms" className="text-xs" style={{ color: 'var(--text-2)' }}>Terms of Service</a>
    </footer>
  );
}
