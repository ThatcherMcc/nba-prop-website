"use client";

import Image from "next/image";
import {
  useThemeLayout,
  type ColorTheme,
  type LayoutVariant,
} from "./ThemeLayoutContext";
import { signOutAction } from "@/lib/auth-actions";
import type { Session } from "next-auth";

interface ProfilePageContentProps {
  session: Session | null;
}

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

export default function ProfilePageContent({ session }: ProfilePageContentProps) {
  const { colorTheme, layoutVariant, setColorTheme, setLayoutVariant } =
    useThemeLayout();

  const user = session?.user;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-pe-text-primary">Profile</h1>
        <p className="text-sm text-pe-text-muted mt-1">
          Customize your PropEdge experience.
        </p>
      </div>

      {/* Account section */}
      <section className="mb-8 rounded-2xl bg-pe-surface-1 border border-pe-border/10 p-5">
        {user ? (
          /* Signed-in state */
          <div>
            <div className="flex items-center gap-4 mb-5">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "Profile photo"}
                  width={48}
                  height={48}
                  className="rounded-full w-12 h-12 object-cover border border-pe-border/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-pe-accent/20 border border-pe-border/10 flex items-center justify-center text-pe-accent text-lg font-bold">
                  {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {user.name && (
                  <p className="text-sm font-bold text-pe-text-primary truncate">
                    {user.name}
                  </p>
                )}
                {user.email && (
                  <p className="text-xs text-pe-text-muted truncate">{user.email}</p>
                )}
              </div>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-xl bg-pe-surface-2 border border-pe-border/10 px-4 py-2.5 text-sm font-semibold text-pe-text-secondary hover:text-pe-text-primary hover:bg-pe-surface-2/80 transition-colors text-left"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          /* Signed-out state */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-pe-surface-2 border border-pe-border/10 flex items-center justify-center text-pe-text-faint text-xl">
                &#128100;
              </div>
              <div>
                <p className="text-sm font-bold text-pe-text-primary">
                  Sign in to PropEdge
                </p>
                <p className="text-xs text-pe-text-faint">
                  Access your profile and saved preferences.
                </p>
              </div>
            </div>
            <a
              href="/auth/sign-in?callbackUrl=/profile"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-pe-accent/20 border border-pe-accent/20 px-4 py-2.5 text-sm font-semibold text-pe-accent hover:bg-pe-accent/30 transition-colors"
            >
              Sign in
            </a>
          </div>
        )}
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
