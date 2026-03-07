"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCommandPalette } from "./CommandPaletteProvider";

const tabs = [
  { key: "home", label: "Home", href: "/", icon: "\u2302" },
  { key: "slate", label: "Slate", href: "/slate", icon: "\u{1F3C0}" },
  { key: "search", label: "Search", href: null, icon: "\u{1F50D}" },
  { key: "analytics", label: "Analytics", href: "/analytics", icon: "\u{1F4CA}" },
] as const;

export default function MobileTabBar() {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-pe-border/10 bg-pe-bg/95 backdrop-blur-md">
      <nav
        className="flex items-center justify-around h-16"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map((tab) => {
          const isActive =
            tab.key === "home"
              ? pathname === "/"
              : tab.key === "slate"
                ? pathname === "/slate"
                : tab.key === "analytics"
                  ? pathname === "/analytics"
                  : false;

          if (tab.key === "search") {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={openPalette}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-pe-text-faint active:text-pe-accent transition-colors"
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
                  ? "text-pe-accent"
                  : "text-pe-text-faint active:text-pe-accent"
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
