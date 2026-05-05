"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCommandPalette } from "./CommandPaletteProvider";
import type { Session } from "next-auth";
import { getLeagueFromPathname, getLeagueNavLinks } from "@/lib/leagues";

interface MobileTabBarProps {
  session: Session | null;
}

function tabIcon(label: string, isMlb: boolean): string {
  if (label === "Home") return "\u2302";
  if (label === "Analytics") return "\u{1F4CA}";
  if (label === "Slate") return isMlb ? "\u26BE" : "\u{1F3C0}";
  return "\u{1F50D}";
}

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/mlb") return pathname === "/mlb";
  if (href === "/slate") return pathname === "/slate" || pathname === "/track-record";
  return pathname === href;
}

export default function MobileTabBar({ session }: MobileTabBarProps) {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();
  const user = session?.user;
  const activeLeague = getLeagueFromPathname(pathname);
  const leagueTabs = getLeagueNavLinks(activeLeague).map((tab) => ({
    ...tab,
    icon: tabIcon(tab.label, activeLeague === "mlb"),
  }));

  return (
    <div className="shell-mobile-bar fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <nav
        className="flex items-center justify-around px-2"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {leagueTabs.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 py-2 ${
                active ? "text-pe-text-secondary" : "text-pe-text-faint active:text-pe-text-secondary"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[0.58rem] uppercase tracking-[0.2em]">{tab.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={openPalette}
          className="flex h-16 flex-1 flex-col items-center justify-center gap-1 py-2 text-pe-text-faint active:text-pe-text-secondary"
        >
          <span className="text-lg">&#128269;</span>
          <span className="text-[0.58rem] uppercase tracking-[0.2em]">Search</span>
        </button>

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
