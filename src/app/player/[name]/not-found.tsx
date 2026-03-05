import Link from "next/link";

export default function PlayerNotFound() {
  return (
    <div className="min-h-screen bg-pe-bg text-pe-text-body flex flex-col items-center justify-center p-6">
      <h1 className="text-xl font-bold text-pe-text-secondary mb-2">Player not found</h1>
      <p className="text-pe-text-faint text-sm mb-6">That player isn’t in our database or the name doesn’t match.</p>
      <Link
        href="/"
        className="text-pe-accent hover:opacity-80 font-medium"
      >
        ← Back to home
      </Link>
    </div>
  );
}
