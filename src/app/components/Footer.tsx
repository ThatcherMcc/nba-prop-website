export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="bg-blue-600 p-1 rounded text-xs">&#127936;</span>
          <span className="font-bold text-zinc-400">
            PROP<span className="text-blue-500">ANALYZER</span>
          </span>
          <span className="text-zinc-600">&middot;</span>
          <span>Built for smarter bets</span>
        </div>
        <p className="text-xs text-zinc-600">
          Data updated daily from Basketball Reference. Not financial advice.
          Gamble responsibly.
        </p>
      </div>
    </footer>
  );
}
