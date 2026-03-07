"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "./CommandPaletteProvider";

export default function NavBar() {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();

  return (
    <nav className="border-b border-pe-border/10 bg-pe-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3 md:gap-4">
        {/* Left: logo */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="text-lg md:text-xl font-black tracking-tighter flex items-center gap-2"
          >
            <span className="bg-pe-accent-strong p-1 md:p-1.5 rounded-lg text-xs md:text-sm">
              &#127936;
            </span>
            PROP<span className="text-pe-accent">EDGE</span>
          </Link>
        </div>

        {/* Center: search bar (desktop) */}
        <button
          type="button"
          onClick={openPalette}
          className="hidden md:flex flex-1 max-w-xl bg-pe-surface-1 border border-pe-border/10 rounded-xl px-4 py-2.5 text-sm text-pe-text-faint text-left cursor-pointer hover:border-pe-border/20 transition-colors items-center gap-3"
        >
          <span>&#128269;</span>
          <span className="flex-1 truncate">Search players...</span>
          <kbd className="inline-flex items-center gap-0.5 rounded border border-pe-border/10 bg-pe-surface-2 px-1.5 py-0.5 text-xs text-pe-text-faint">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </button>

        {/* Right: nav tabs + mobile search */}
        <div className="flex items-center gap-2">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={openPalette}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-pe-surface-1 border border-pe-border/10 text-pe-text-muted active:bg-pe-surface-2 transition-colors"
            aria-label="Search players"
          >
            <span className="text-base">&#128269;</span>
          </button>

          {/* Desktop tab pills */}
          <div className="hidden sm:flex items-center gap-1 bg-pe-surface-1 border border-pe-border/10 rounded-xl p-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                pathname === "/"
                  ? "bg-pe-accent/20 text-pe-accent"
                  : "text-pe-text-muted hover:text-pe-text-primary hover:bg-pe-surface-2/60"
              }`}
            >
              Home
            </Link>
            <Link
              href="/slate"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                pathname === "/slate"
                  ? "bg-pe-accent/20 text-pe-accent"
                  : "text-pe-text-muted hover:text-pe-text-primary hover:bg-pe-surface-2/60"
              }`}
            >
              Slate
            </Link>
            <Link
              href="/analytics"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                pathname === "/analytics"
                  ? "bg-pe-accent/20 text-pe-accent"
                  : "text-pe-text-muted hover:text-pe-text-primary hover:bg-pe-surface-2/60"
              }`}
            >
              Analytics
            </Link>
            <Link
              href="/insights"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                pathname.startsWith("/insights")
                  ? "bg-pe-accent/20 text-pe-accent"
                  : "text-pe-text-muted hover:text-pe-text-primary hover:bg-pe-surface-2/60"
              }`}
            >
              The Edge
            </Link>
            <Link
              href="/profile"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                pathname === "/profile"
                  ? "bg-pe-accent/20 text-pe-accent"
                  : "text-pe-text-muted hover:text-pe-text-primary hover:bg-pe-surface-2/60"
              }`}
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
