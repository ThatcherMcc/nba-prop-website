import "server-only";

import { existsSync, readFileSync } from "fs";
import { join } from "path";

export type MlbPitcher = {
  name: string;
  mlb_id: number | null;
};

export type MlbStarterGame = {
  game_date: string;
  home_team: string;
  away_team: string;
  home_pitcher: MlbPitcher;
  away_pitcher: MlbPitcher;
  game_time: string;
  status: string;
  game_pk: number;
  game_type: string;
};

const MLB_SCHEDULE_URL =
  "https://statsapi.mlb.com/api/v1/schedule?sportId=1&hydrate=probablePitcher";

const TEAM_NAME_TO_ABBR: Record<string, string> = {
  "Arizona Diamondbacks": "ARI",
  "Atlanta Braves": "ATL",
  "Baltimore Orioles": "BAL",
  "Boston Red Sox": "BOS",
  "Chicago Cubs": "CHC",
  "Chicago White Sox": "CHW",
  "Cincinnati Reds": "CIN",
  "Cleveland Guardians": "CLE",
  "Colorado Rockies": "COL",
  "Detroit Tigers": "DET",
  "Houston Astros": "HOU",
  "Kansas City Royals": "KC",
  "Los Angeles Angels": "LAA",
  "Los Angeles Dodgers": "LAD",
  "Miami Marlins": "MIA",
  "Milwaukee Brewers": "MIL",
  "Minnesota Twins": "MIN",
  "New York Mets": "NYM",
  "New York Yankees": "NYY",
  "Oakland Athletics": "OAK",
  "Philadelphia Phillies": "PHI",
  "Pittsburgh Pirates": "PIT",
  "San Diego Padres": "SD",
  "San Francisco Giants": "SF",
  "Seattle Mariners": "SEA",
  "St. Louis Cardinals": "STL",
  "Tampa Bay Rays": "TB",
  "Texas Rangers": "TEX",
  "Toronto Blue Jays": "TOR",
  "Washington Nationals": "WSH",
  Athletics: "OAK",
};

function getEasternDateString(now = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function formatGameTimeEastern(gameDateIso: string): string {
  const gameDate = new Date(gameDateIso);
  if (Number.isNaN(gameDate.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(gameDate);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";
  return hour && minute ? `${hour}:${minute}` : "";
}

function normalizeTeamAbbreviation(name: string, fallback?: string): string {
  return TEAM_NAME_TO_ABBR[name] ?? fallback ?? name.slice(0, 3).toUpperCase();
}

function extractPitcher(teamBlock: Record<string, unknown>): MlbPitcher {
  const probablePitcher = teamBlock.probablePitcher as Record<string, unknown> | undefined;
  if (!probablePitcher) {
    return { name: "TBD", mlb_id: null };
  }

  return {
    name: String(probablePitcher.fullName ?? "TBD").trim() || "TBD",
    mlb_id:
      typeof probablePitcher.id === "number"
        ? probablePitcher.id
        : probablePitcher.id != null
          ? Number(probablePitcher.id)
          : null,
  };
}

function parseScheduleResponse(payload: Record<string, unknown>): MlbStarterGame[] {
  const dateBlocks = Array.isArray(payload.dates) ? payload.dates : [];
  const results: MlbStarterGame[] = [];

  for (const dateBlock of dateBlocks) {
    const games = Array.isArray((dateBlock as Record<string, unknown>).games)
      ? ((dateBlock as Record<string, unknown>).games as Record<string, unknown>[])
      : [];

    for (const game of games) {
      const teams = (game.teams as Record<string, unknown> | undefined) ?? {};
      const home = (teams.home as Record<string, unknown> | undefined) ?? {};
      const away = (teams.away as Record<string, unknown> | undefined) ?? {};
      const homeTeam = (home.team as Record<string, unknown> | undefined) ?? {};
      const awayTeam = (away.team as Record<string, unknown> | undefined) ?? {};
      const status = (game.status as Record<string, unknown> | undefined) ?? {};

      results.push({
        game_date: String(game.officialDate ?? ""),
        home_team: normalizeTeamAbbreviation(
          String(homeTeam.name ?? ""),
          typeof homeTeam.abbreviation === "string" ? homeTeam.abbreviation : undefined
        ),
        away_team: normalizeTeamAbbreviation(
          String(awayTeam.name ?? ""),
          typeof awayTeam.abbreviation === "string" ? awayTeam.abbreviation : undefined
        ),
        home_pitcher: extractPitcher(home),
        away_pitcher: extractPitcher(away),
        game_time: formatGameTimeEastern(String(game.gameDate ?? "")),
        status: String(status.detailedState ?? "Scheduled"),
        game_pk: Number(game.gamePk ?? 0),
        game_type: String(game.gameType ?? ""),
      });
    }
  }

  return results;
}

function readFallbackGames(date: string): MlbStarterGame[] {
  const workspaceRoot = join(process.cwd(), "..");
  const fallbackPath = join(
    workspaceRoot,
    "nba-data-backend",
    "data",
    `mlb_confirmed_starters_${date}.json`
  );

  if (!existsSync(fallbackPath)) {
    return [];
  }

  try {
    return JSON.parse(readFileSync(fallbackPath, "utf-8")) as MlbStarterGame[];
  } catch (error) {
    console.error("Failed to read fallback MLB starters file:", error);
    return [];
  }
}

export async function getMlbStarterGames(date = getEasternDateString()): Promise<MlbStarterGame[]> {
  const url = `${MLB_SCHEDULE_URL}&date=${date}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 900 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`MLB schedule request failed with ${response.status}`);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const games = parseScheduleResponse(payload);

    if (games.length > 0) {
      return games;
    }
  } catch (error) {
    console.error("Failed to fetch live MLB starters:", error);
  }

  return readFallbackGames(date);
}
