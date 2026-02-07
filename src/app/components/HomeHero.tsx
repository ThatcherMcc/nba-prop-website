"use client";
export default function HomeHero() {
  return (
    <header className="mb-10">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
        Is this prop a good bet?
      </h1>
      <p className="text-zinc-400 text-base md:text-lg max-w-xl">
        Pick a player, set your stat and line, and see how often they’ve gone over in their last 5–20 games. Use past performance to decide.
      </p>
    </header>
  );
}
