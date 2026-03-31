import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-pe-accent/12 pb-20 pt-8 md:pb-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <p className="section-label mb-3">PropEdge</p>
          <h2 className="text-xl font-semibold uppercase tracking-[0.22em] text-pe-text-primary">
            Wealth-coded signal for prop bettors.
          </h2>
          <p className="mt-3 text-sm leading-6 text-pe-text-muted">
            NBA and MLB research surfaces built for sharper reads, premium signal, and less wasted motion.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.18em] text-pe-text-faint md:items-end">
          <span>Data source:
            <a
              href="https://www.basketball-reference.com"
              target="_blank"
              rel="noopener noreferrer"
              className="line-link ml-2 text-pe-text-secondary"
            >
              Basketball Reference
            </a>
          </span>
          <span>
            21+ | Gambling Problem?
            <a
              href="tel:18005224700"
              className="line-link ml-2 text-pe-text-secondary"
            >
              1-800-522-4700
            </a>
          </span>
          <div className="flex flex-wrap gap-4 text-pe-text-secondary">
            <Link href="/terms" className="line-link">Terms</Link>
            <Link href="/privacy" className="line-link">Privacy</Link>
            <Link href="/responsible-gambling" className="line-link">Responsible Gambling</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
