import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-pe-border/5 bg-pe-bg">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-pe-text-faint">
            <span className="bg-pe-accent-strong p-1 rounded text-xs">&#127936;</span>
            <span className="font-bold text-pe-text-secondary">
              PROP<span className="text-pe-accent">EDGE</span>
            </span>
            <span className="text-pe-text-faint">&middot;</span>
            <span>Built for smarter bets</span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-pe-text-faint">
            <Link href="/" className="hover:text-pe-text-secondary transition-colors">Home</Link>
            <Link href="/slate" className="hover:text-pe-text-secondary transition-colors">Slate</Link>
            <Link href="/analytics" className="hover:text-pe-text-secondary transition-colors">Analytics</Link>
            <Link href="/insights" className="hover:text-pe-text-secondary transition-colors">The Edge</Link>
            <a
              href="https://www.basketball-reference.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pe-text-secondary transition-colors"
            >
              Basketball Reference
            </a>
          </nav>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-pe-text-faint">
            Data updated daily from Basketball Reference. For entertainment
            purposes only &mdash; not financial or betting advice. Must be 21+.
            If you or someone you know has a gambling problem, call the
            National Council on Problem Gambling helpline:{" "}
            <a
              href="tel:18005224700"
              className="underline underline-offset-2 hover:text-pe-text-muted transition-colors"
            >
              1-800-522-4700
            </a>
            .
          </p>
          <nav className="flex items-center gap-3 text-xs text-pe-text-faint flex-shrink-0">
            <Link href="/terms" className="hover:text-pe-text-secondary transition-colors">Terms</Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/privacy" className="hover:text-pe-text-secondary transition-colors">Privacy</Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/responsible-gambling" className="hover:text-pe-text-secondary transition-colors">Responsible Gambling</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
