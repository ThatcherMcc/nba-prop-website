"use client";

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
  { key: "editorial", label: "Editorial", desc: "Clean picks-first layout" },
  { key: "current", label: "Classic", desc: "Original full layout" },
  { key: "spotlight", label: "Spotlight", desc: "Hero pick + classic flow" },
  { key: "action-board", label: "Action Board", desc: "Collapsible sections" },
  { key: "ticker-feed", label: "Ticker + Feed", desc: "Live ticker + card grid" },
];

export default function ProfilePageContent() {
  const { colorTheme, layoutVariant, setColorTheme, setLayoutVariant } =
    useThemeLayout();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-pe-text-primary">Profile</h1>
        <p className="text-sm text-pe-text-muted mt-1">
          Customize your PropEdge experience.
        </p>
      </div>

      {/* Sign In — coming soon */}
      <section className="mb-8 rounded-2xl bg-pe-surface-1 border border-pe-border/10 p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-pe-surface-2 border border-pe-border/10 flex items-center justify-center text-pe-text-faint text-xl">
            &#128100;
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-pe-text-primary">
              Sign in &amp; saved preferences
            </p>
            <p className="text-xs text-pe-text-faint">Coming soon</p>
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-pe-text-faint mb-4">
          Color Palette
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {COLOR_THEMES.map(({ key, label, swatch }) => (
            <button
              key={key}
              type="button"
              onClick={() => setColorTheme(key)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors border ${
                colorTheme === key
                  ? "bg-pe-accent/15 border-pe-accent/30 text-pe-text-primary"
                  : "bg-pe-surface-1 border-pe-border/10 text-pe-text-secondary hover:bg-pe-surface-2/60"
              }`}
            >
              <span className="flex shrink-0">
                <span
                  className="w-5 h-5 rounded-full border border-white/20"
                  style={{ backgroundColor: swatch[0] }}
                />
                <span
                  className="w-5 h-5 rounded-full border border-white/20 -ml-2"
                  style={{ backgroundColor: swatch[1] }}
                />
              </span>
              <span className="flex-1 text-left">{label}</span>
              {colorTheme === key && (
                <span className="text-pe-accent text-xs font-bold">
                  &#10003;
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Layout */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-pe-text-faint mb-4">
          Homepage Layout
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LAYOUT_VARIANTS.map(({ key, label, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => setLayoutVariant(key)}
              className={`flex flex-col items-start rounded-xl px-4 py-3 text-left transition-colors border ${
                layoutVariant === key
                  ? "bg-pe-accent/15 border-pe-accent/30 text-pe-text-primary"
                  : "bg-pe-surface-1 border-pe-border/10 text-pe-text-secondary hover:bg-pe-surface-2/60"
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-sm font-bold">{label}</span>
                {layoutVariant === key && (
                  <span className="ml-auto text-pe-accent text-xs font-bold">
                    &#10003;
                  </span>
                )}
              </div>
              <span className="text-xs text-pe-text-faint mt-0.5">{desc}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
