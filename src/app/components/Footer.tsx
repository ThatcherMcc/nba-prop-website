import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-pe-border/5 bg-pe-bg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-pe-text-faint">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-pe-text-secondary">
            PROP<span className="text-pe-accent">EDGE</span>
          </span>
          <span>&middot;</span>
          <span>Data from{" "}
            <a
              href="https://www.basketball-reference.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pe-text-secondary transition-colors underline underline-offset-2"
            >
              Basketball Reference
            </a>
          </span>
          <span>&middot;</span>
          <span>21+ | Gambling Problem?{" "}
            <a
              href="tel:18005224700"
              className="underline underline-offset-2 hover:text-pe-text-muted transition-colors"
            >
              1-800-522-4700
            </a>
          </span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/terms" className="hover:text-pe-text-secondary transition-colors">Terms</Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-pe-text-secondary transition-colors">Privacy</Link>
          <span>&middot;</span>
          <Link href="/responsible-gambling" className="hover:text-pe-text-secondary transition-colors">Responsible Gambling</Link>
        </nav>
      </div>
    </footer>
  );
}
