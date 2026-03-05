"use client";

import Link from "next/link";

export default function PlayerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md">
        <h2 className="text-xl font-bold text-red-400 mb-2">
          Failed to load player
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          {error.message || "Could not load player data. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-zinc-400 hover:text-white text-sm font-medium px-6 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
