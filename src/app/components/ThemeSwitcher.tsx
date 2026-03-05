"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  useThemeLayout,
  type ColorTheme,
  type LayoutVariant,
} from "./ThemeLayoutContext";

const COLOR_THEMES: {
  key: ColorTheme;
  label: string;
  swatch: [string, string];
}[] = [
  { key: "default", label: "Default", swatch: ["#09090b", "#3b82f6"] },
  { key: "midnight", label: "Midnight Court", swatch: ["#0A0E1A", "#6366F1"] },
  { key: "clean", label: "Clean Slate", swatch: ["#FAFAFA", "#18181B"] },
  { key: "press-box", label: "Press Box", swatch: ["#121210", "#E2B860"] },
  { key: "hardwood", label: "Hardwood", swatch: ["#0F0D0B", "#C27A3A"] },
  { key: "broadcast", label: "Broadcast", swatch: ["#080C12", "#00D4AA"] },
  { key: "monochrome", label: "Monochrome", swatch: ["#0A0A0A", "#FFFFFF"] },
];

const LAYOUT_VARIANTS: {
  key: LayoutVariant;
  label: string;
  desc: string;
}[] = [
  { key: "current", label: "Current", desc: "Existing layout" },
  { key: "spotlight", label: "Spotlight", desc: "Hero pick + current flow" },
  { key: "editorial", label: "Editorial", desc: "Magazine / newsletter feel" },
  { key: "action-board", label: "Action Board", desc: "Collapsible decision board" },
  { key: "ticker-feed", label: "Ticker + Feed", desc: "Ticker strip + card feed" },
];

export default function ThemeSwitcher() {
  const { colorTheme, layoutVariant, setColorTheme, setLayoutVariant } =
    useThemeLayout();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div
      ref={panelRef}
      className="fixed right-4 bottom-20 md:bottom-6 z-[60]"
    >
      {/* Floating toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-pe-surface-1 border border-pe-border/[var(--pe-border-opacity,0.10)] px-4 py-2.5 text-sm font-medium text-pe-text-secondary shadow-lg backdrop-blur-md hover:text-pe-text-primary transition-colors"
        aria-label="Theme switcher"
      >
        <span className="text-base">&#127912;</span>
        <span className="hidden sm:inline">Theme</span>
      </button>

      {/* Popover panel */}
      {open && (
        <div className="absolute right-0 bottom-14 w-72 rounded-2xl bg-pe-surface-1 border border-pe-border/[var(--pe-border-opacity,0.10)] shadow-2xl overflow-hidden">
          {/* Color section */}
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint mb-3">
              Color Palette
            </h3>
            <div className="space-y-1">
              {COLOR_THEMES.map(({ key, label, swatch }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColorTheme(key)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    colorTheme === key
                      ? "bg-pe-accent/20 text-pe-text-primary"
                      : "text-pe-text-secondary hover:bg-pe-surface-2/60"
                  }`}
                >
                  {/* Double swatch */}
                  <span className="flex shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: swatch[0] }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 -ml-1.5"
                      style={{ backgroundColor: swatch[1] }}
                    />
                  </span>
                  <span>{label}</span>
                  {colorTheme === key && (
                    <span className="ml-auto text-xs">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Layout section — only on homepage */}
          {isHomepage && (
            <div className="px-4 pb-4 pt-2 border-t border-pe-border/[var(--pe-border-opacity,0.10)]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-pe-text-faint mb-3">
                Layout
              </h3>
              <div className="space-y-1">
                {LAYOUT_VARIANTS.map(({ key, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLayoutVariant(key)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                      layoutVariant === key
                        ? "bg-pe-accent/20 text-pe-text-primary"
                        : "text-pe-text-secondary hover:bg-pe-surface-2/60"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-pe-text-faint truncate">
                        {desc}
                      </div>
                    </div>
                    {layoutVariant === key && (
                      <span className="text-xs shrink-0">&#10003;</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
