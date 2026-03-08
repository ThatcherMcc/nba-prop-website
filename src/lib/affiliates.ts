export type Sportsbook = "draftkings" | "fanduel" | "prizepicks";

export interface BookConfig {
  name: string;
  shortName: string;
  baseUrl: string;
  bgClass: string;
  textClass: string;
}

export const SPORTSBOOKS: Record<Sportsbook, BookConfig> = {
  draftkings: {
    name: "DraftKings",
    shortName: "DK",
    baseUrl: "https://sportsbook.draftkings.com",
    bgClass: "bg-[#53d337]/15 hover:bg-[#53d337]/25 text-[#53d337] border-[#53d337]/25",
    textClass: "text-[#53d337]",
  },
  fanduel: {
    name: "FanDuel",
    shortName: "FD",
    baseUrl: "https://sportsbook.fanduel.com",
    bgClass: "bg-[#1493ff]/15 hover:bg-[#1493ff]/25 text-[#1493ff] border-[#1493ff]/25",
    textClass: "text-[#1493ff]",
  },
  prizepicks: {
    name: "PrizePicks",
    shortName: "PP",
    baseUrl: "https://app.prizepicks.com",
    bgClass: "bg-[#7c3aed]/15 hover:bg-[#7c3aed]/25 text-[#7c3aed] border-[#7c3aed]/25",
    textClass: "text-[#7c3aed]",
  },
};

export const SPORTSBOOK_KEYS: Sportsbook[] = ["draftkings", "fanduel", "prizepicks"];

export function buildBetLink(book: Sportsbook): string {
  const config = SPORTSBOOKS[book];
  switch (book) {
    case "draftkings":
      return `${config.baseUrl}/leagues/basketball/nba`;
    case "fanduel":
      return `${config.baseUrl}/navigation/nba`;
    case "prizepicks":
      return `${config.baseUrl}/projections?leagueID=7&utm_source=propedge&utm_medium=referral`;
  }
}
