import Link from "next/link";

export default function PlayerNotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-xl font-bold text-zinc-300 mb-2">Player not found</h1>
      <p className="text-zinc-500 text-sm mb-6">That player isn’t in our database or the name doesn’t match.</p>
      <Link
        href="/"
        className="text-blue-400 hover:text-blue-300 font-medium"
      >
        ← Back to home
      </Link>
    </div>
  );
}
