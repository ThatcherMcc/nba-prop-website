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
            <Link href="/analytics" className="hover:text-pe-text-secondary transition-colors">Analytics</Link>
            <Link href="/insights" className="hover:text-pe-text-secondary transition-colors">The Edge</Link>
            <Link href="/player/LeBron%20James" className="hover:text-pe-text-secondary transition-colors">LeBron James</Link>
            <Link href="/player/Stephen%20Curry" className="hover:text-pe-text-secondary transition-colors">Stephen Curry</Link>
            <Link href="/player/Luka%20Doncic" className="hover:text-pe-text-secondary transition-colors">Luka Doncic</Link>
            <Link href="/player/Nikola%20Jokic" className="hover:text-pe-text-secondary transition-colors">Nikola Jokic</Link>
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
        <p className="text-xs text-pe-text-faint">
          Data updated daily from Basketball Reference. Not financial advice.
          Gamble responsibly.
        </p>
      </div>
    </footer>
  );
}
