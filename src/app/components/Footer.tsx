export default function Footer() {
  return (
    <footer className="border-t border-pe-border/5 bg-pe-bg">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-pe-text-faint">
          <span className="bg-pe-accent-strong p-1 rounded text-xs">&#127936;</span>
          <span className="font-bold text-pe-text-secondary">
            PROP<span className="text-pe-accent">EDGE</span>
          </span>
          <span className="text-pe-text-faint">&middot;</span>
          <span>Built for smarter bets</span>
        </div>
        <p className="text-xs text-pe-text-faint">
          Data updated daily from Basketball Reference. Not financial advice.
          Gamble responsibly.
        </p>
      </div>
    </footer>
  );
}
