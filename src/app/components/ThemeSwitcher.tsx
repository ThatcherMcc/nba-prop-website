"use client";

import { useState, useRef, useEffect } from "react";
import {
  useThemeLayout,
  type ColorTheme,
} from "./ThemeLayoutContext";

const COLOR_THEMES: {
  key: ColorTheme;
  label: string;
  swatch: [string, string];
}[] = [
  { key: "default", label: "Gold", swatch: ["#060708", "#E4C661"] },
  { key: "classic", label: "Original Slate", swatch: ["#18181B", "#3B82F6"] },
  { key: "press-box", label: "Champagne Press", swatch: ["#11100E", "#CBB78F"] },
  { key: "hardwood", label: "Bronze Court", swatch: ["#120D09", "#C78345"] },
];

export default function ThemeSwitcher() {
  const { colorTheme, setColorTheme } = useThemeLayout();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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
        aria-label="Color palette"
      >
        <span className="text-base">&#127912;</span>
        <span className="hidden sm:inline">Palette</span>
      </button>

      {open && (
        <div className="absolute right-0 bottom-14 w-72 rounded-2xl bg-pe-surface-1 border border-pe-border/[var(--pe-border-opacity,0.10)] shadow-2xl overflow-hidden">
          <div className="px-4 py-4">
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
        </div>
      )}
    </div>
  );
}
