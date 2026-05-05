export type League = "nba" | "mlb";

export function getLeagueFromPathname(pathname: string | null | undefined): League {
  return pathname?.startsWith("/mlb") ? "mlb" : "nba";
}

export function getLeagueHomeHref(league: League): string {
  return league === "mlb" ? "/mlb" : "/";
}

export function getLeagueAnalyticsHref(league: League): string {
  return league === "mlb" ? "/mlb/analytics" : "/analytics";
}

export function getLeagueSlateHref(league: League): string {
  return league === "mlb" ? "/mlb/slate" : "/slate";
}

export function getLeagueNavLinks(league: League) {
  return [
    { href: getLeagueHomeHref(league), label: "Home" },
    { href: getLeagueAnalyticsHref(league), label: "Analytics" },
    { href: getLeagueSlateHref(league), label: "Slate" },
  ] as const;
}

export function normalizeMlbTeamCode(teamCode: string): string {
  return teamCode.startsWith("M-") ? teamCode.slice(2) : teamCode;
}
