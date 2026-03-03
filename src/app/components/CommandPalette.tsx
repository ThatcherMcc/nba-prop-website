"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";

const MAX_RESULTS = 8;
const MAX_RECENT = 5;
const RECENT_KEY = "propanalyzer-recent-searches";

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(name: string) {
  try {
    const recent = getRecentSearches().filter((n) => n !== name);
    recent.unshift(name);
    localStorage.setItem(
      RECENT_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT))
    );
  } catch {
    // localStorage unavailable
  }
}

export default function CommandPalette({
  playerNames,
  isOpen,
  onClose,
}: {
  playerNames: string[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const fuse = useRef(
    new Fuse(playerNames, {
      threshold: 0.3,
      distance: 100,
      minMatchCharLength: 1,
    })
  );

  // Update fuse when playerNames changes
  useEffect(() => {
    fuse.current = new Fuse(playerNames, {
      threshold: 0.3,
      distance: 100,
      minMatchCharLength: 1,
    });
  }, [playerNames]);

  // Load recent searches on open
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setQuery("");
      setSelectedIndex(0);
      // Focus input after animation frame
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const results =
    query.trim().length > 0
      ? fuse.current.search(query).slice(0, MAX_RESULTS).map((r) => r.item)
      : [];

  const displayItems =
    query.trim().length > 0
      ? results
      : recentSearches.filter((n) => playerNames.includes(n));

  const isShowingRecent = query.trim().length === 0 && displayItems.length > 0;

  const navigate = useCallback(
    (name: string) => {
      saveRecentSearch(name);
      onClose();
      router.push(`/player/${encodeURIComponent(name)}`);
    },
    [onClose, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, displayItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (displayItems[selectedIndex]) {
            navigate(displayItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [displayItems, selectedIndex, navigate, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.children[selectedIndex] as HTMLElement | undefined;
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Search players"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-white/10">
          <span className="text-zinc-500 text-lg">&#128269;</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search any NBA player..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent py-4 text-sm text-white placeholder:text-zinc-500 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-white/10 bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {displayItems.length > 0 && (
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {isShowingRecent && (
              <div className="px-4 py-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Recent
              </div>
            )}
            {displayItems.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => navigate(name)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                  i === selectedIndex
                    ? "bg-blue-600/20 text-white"
                    : "text-zinc-300 hover:bg-white/5"
                }`}
              >
                <span className="text-zinc-500">&#127936;</span>
                {name}
              </button>
            ))}
          </div>
        )}

        {/* No-query empty state */}
        {query.trim().length === 0 && displayItems.length === 0 && (
          <div className="px-4 py-8 text-center space-y-1">
            <p className="text-sm text-zinc-500">Start typing a player name</p>
            <p className="text-xs text-zinc-600">515+ NBA players available</p>
          </div>
        )}

        {/* Empty state */}
        {query.trim().length > 0 && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-zinc-500">
            No players found for &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4 text-xs text-zinc-600">
          <span>
            <kbd className="border border-white/10 bg-zinc-800 px-1 py-0.5 rounded text-zinc-500">
              &#8593;&#8595;
            </kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="border border-white/10 bg-zinc-800 px-1 py-0.5 rounded text-zinc-500">
              &#8629;
            </kbd>{" "}
            select
          </span>
          <span>
            <kbd className="border border-white/10 bg-zinc-800 px-1 py-0.5 rounded text-zinc-500">
              esc
            </kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>
  );
}
