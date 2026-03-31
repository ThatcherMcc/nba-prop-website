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
  { key: "slate", label: "Slate", href: "/slate", icon: "\u{1F3C0}" },
  { key: "search", label: "Search", href: null, icon: "\u{1F50D}" },
] as const;

export default function MobileTabBar({ session }: MobileTabBarProps) {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();

  const user = session?.user;

  return (
    <div className="shell-mobile-bar fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav
        className="flex items-center justify-around px-2"
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
                  className="flex h-16 flex-1 flex-col items-center justify-center gap-1 py-2 text-pe-text-faint active:text-pe-text-secondary"
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-[0.58rem] uppercase tracking-[0.2em]">{tab.label}</span>
                </button>
              );
          }

          return (
            <Link
              key={tab.key}
              href={tab.href!}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 py-2 ${
                isActive
                  ? "text-pe-text-secondary"
                  : "text-pe-text-faint active:text-pe-text-secondary"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[0.58rem] uppercase tracking-[0.2em]">{tab.label}</span>
            </Link>
          );
        })}

        {/* Profile / Sign In tab */}
        {user ? (
          <Link
            href="/profile"
            className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 py-2 ${
              pathname === "/profile"
                ? "text-pe-text-secondary"
                : "text-pe-text-faint active:text-pe-text-secondary"
            }`}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "Profile"}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pe-accent/20 text-xs font-bold text-pe-text-secondary">
                {(user.name ?? user.email ?? "?")[0].toUpperCase()}
              </span>
            )}
            <span className="text-[0.58rem] uppercase tracking-[0.2em]">Profile</span>
          </Link>
        ) : (
          <Link
            href="/auth/sign-in"
            className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 py-2 ${
              pathname === "/auth/sign-in"
                ? "text-pe-text-secondary"
                : "text-pe-text-faint active:text-pe-text-secondary"
            }`}
          >
            <span className="text-lg">&#128100;</span>
            <span className="text-[0.58rem] uppercase tracking-[0.2em]">Sign In</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
