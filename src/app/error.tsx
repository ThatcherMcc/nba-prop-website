"use client";

export default function GlobalError({
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
          Something went wrong
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
