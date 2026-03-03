"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCommandPalette } from "./CommandPaletteProvider";

const tabs = [
  { key: "home", label: "Home", href: "/", icon: "\u2302" },
  { key: "search", label: "Search", href: null, icon: "\u{1F50D}" },
  { key: "trending", label: "Trending", href: "/#trending", icon: "\u{1F525}" },
  { key: "picks", label: "Picks", href: "/#picks", icon: "\u{1F3C6}" },
] as const;

export default function MobileTabBar() {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-white/10 bg-[#09090b]/95 backdrop-blur-md">
      <nav
        className="flex items-center justify-around h-16"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map((tab) => {
          const isActive =
            tab.key === "home"
              ? pathname === "/"
              : tab.key === "search"
                ? false
                : false;

          if (tab.key === "search") {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={openPalette}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-zinc-500 active:text-blue-400 transition-colors"
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.key}
              href={tab.href!}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${
                isActive
                  ? "text-blue-400"
                  : "text-zinc-500 active:text-blue-400"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
