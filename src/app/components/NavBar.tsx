"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "./CommandPaletteProvider";
import type { Session } from "next-auth";

interface NavBarProps {
  session: Session | null;
}

export default function NavBar({ session }: NavBarProps) {
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();

  const user = session?.user;
  const links = [
    { href: "/", label: "Home", active: pathname === "/" },
    { href: "/analytics", label: "Analytics", active: pathname === "/analytics" },
    {
      href: "/slate",
      label: "Slate",
      active: pathname === "/slate" || pathname === "/track-record",
    },
    { href: "/mlb", label: "MLB", active: pathname === "/mlb" },
    {
      href: "/insights",
      label: "Insights",
      active: pathname.startsWith("/insights"),
    },
  ];

  const navLinkClass = (active: boolean) =>
    active
      ? "rounded-full border border-pe-accent/25 bg-pe-accent/12 px-3 py-2 text-pe-accent-strong shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
      : "rounded-full border border-transparent px-3 py-2 text-pe-text-muted hover:border-white/8 hover:bg-white/[0.02] hover:text-pe-text-primary";

  return (
    <nav className="sticky top-0 z-50 border-b border-transparent bg-transparent backdrop-blur-0">
      <div className="mx-auto max-w-[1600px] px-4 py-3 md:px-6 md:py-4 lg:px-8">
        <div className="shell-nav rounded-[1.45rem] px-4 py-3 md:px-6 md:py-0">
          <div className="flex items-center justify-between gap-4 md:h-16 md:gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-none md:gap-0">
              <Link href="/" className="group flex shrink-0 items-center gap-3 text-pe-text-primary">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-pe-accent/40 bg-pe-accent/10 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-pe-accent-strong shadow-[0_0_18px_rgba(0,0,0,0.14)]">
                  PE
                </span>
                <span className="hidden text-[1.05rem] font-semibold uppercase tracking-[0.32em] md:inline md:text-[1.15rem]">
                  PropEdge
                </span>
              </Link>

              <button
                type="button"
                onClick={openPalette}
                className="shell-panel-soft flex min-w-0 flex-1 items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm text-pe-text-faint md:hidden"
                aria-label="Search players"
              >
                <span className="text-pe-text-secondary">&#128269;</span>
                <span className="flex-1 truncate">Search players or markets</span>
              </button>
            </div>

            <button
              type="button"
              onClick={openPalette}
              className="shell-panel-soft hidden flex-1 items-center gap-3 rounded-full px-5 py-3 text-left text-sm text-pe-text-faint md:flex md:max-w-xl"
            >
              <span className="text-pe-text-secondary">&#128269;</span>
              <span className="flex-1 truncate">Search a player, market, or matchup</span>
              <kbd className="rounded-full border border-white/10 px-2 py-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-pe-text-muted">
                Cmd K
              </kbd>
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden items-center gap-6 lg:flex">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[0.72rem] font-medium uppercase tracking-[0.24em] transition-colors ${navLinkClass(link.active)}`}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Link
                    href="/profile"
                    className={`shell-panel-soft flex items-center gap-2 rounded-full px-2 py-1.5 ${
                      pathname === "/profile"
                        ? "border-pe-accent/30 text-pe-accent"
                        : "text-pe-text-muted hover:text-pe-text-primary"
                    }`}
                    aria-label="Profile"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name ?? "Profile"}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pe-accent/20 text-sm font-bold text-pe-accent">
                        {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                      </span>
                    )}
                    <span className="pr-2 text-[0.68rem] uppercase tracking-[0.22em]">
                      Profile
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    className="rounded-full border border-pe-accent/28 bg-pe-accent/12 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-pe-accent-strong hover:bg-pe-accent/18"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
