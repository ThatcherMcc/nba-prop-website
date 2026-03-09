"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCommandPalette } from "./CommandPaletteProvider";
import type { Session } from "next-auth";

interface MobileTabBarProps {
  session: Session | null;
}

const staticTabs = [
  { key: "home", label: "Home", href: "/", icon: "\u2302" },
  { key: "analytics", label: "Analytics", href: "/analytics", icon: "\u{1F4CA}" },
  { key: "slate", label: "The Edge", href: "/slate", icon: "\u{1F3C0}" },
  { key: "search", label: "Search", href: null, icon: "\u{1F50D}" },
] as const;

export default function MobileTabBar({ session }: MobileTabBarProps) {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();

  const user = session?.user;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-pe-border/10 bg-pe-bg/95 backdrop-blur-md">
      <nav
        className="flex items-center justify-around h-16"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {staticTabs.map((tab) => {
          const isActive =
            tab.key === "home"
              ? pathname === "/"
              : tab.key === "analytics"
                ? pathname === "/analytics"
                : tab.key === "slate"
                  ? pathname === "/slate" || pathname === "/track-record"
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

        {/* Profile / Sign In tab */}
        {user ? (
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${
              pathname === "/profile"
                ? "text-pe-accent"
                : "text-pe-text-faint active:text-pe-accent"
            }`}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "Profile"}
                width={28}
                height={28}
                className="rounded-full w-7 h-7 object-cover"
              />
            ) : (
              <span className="w-7 h-7 rounded-full bg-pe-accent/20 text-pe-accent text-xs font-bold flex items-center justify-center">
                {(user.name ?? user.email ?? "?")[0].toUpperCase()}
              </span>
            )}
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        ) : (
          <Link
            href="/auth/sign-in"
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${
              pathname === "/auth/sign-in"
                ? "text-pe-accent"
                : "text-pe-text-faint active:text-pe-accent"
            }`}
          >
            <span className="text-lg">&#128100;</span>
            <span className="text-[10px] font-medium">Sign In</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
