"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "./CommandPaletteProvider";

export default function NavBar() {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();
  const isPlayerPage = pathname.startsWith("/player/");

  return (
    <nav className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {isPlayerPage && (
            <Link
              href="/"
              className="text-zinc-400 hover:text-white text-sm font-medium hidden sm:flex items-center gap-1"
            >
              &#8592; Home
            </Link>
          )}
          <Link
            href="/"
            className="text-lg md:text-xl font-black tracking-tighter flex items-center gap-2"
          >
            <span className="bg-blue-600 p-1 md:p-1.5 rounded-lg text-xs md:text-sm">
              &#127936;
            </span>
            PROP<span className="text-blue-500">ANALYZER</span>
          </Link>
        </div>

        {/* Desktop: full search bar */}
        <button
          type="button"
          onClick={openPalette}
          className="hidden md:flex flex-1 max-w-xl bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-500 text-left cursor-pointer hover:border-white/20 transition-colors items-center gap-3"
        >
          <span>&#128269;</span>
          <span className="flex-1 truncate">Search players...</span>
          <kbd className="inline-flex items-center gap-0.5 rounded border border-white/10 bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </button>

        {/* Mobile: compact search icon */}
        <button
          type="button"
          onClick={openPalette}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 active:bg-zinc-800 transition-colors"
          aria-label="Search players"
        >
          <span className="text-base">&#128269;</span>
        </button>
      </div>
    </nav>
  );
}
