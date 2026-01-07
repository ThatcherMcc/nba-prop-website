import { pgTable, index, unique, serial, text, date, integer, real, check, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const playerData = pgTable("player_data", {
	id: serial().primaryKey().notNull(),
	playerName: text("player_name"),
	gameDate: date("game_date"),
	location: text(),
	opponent: text(),
	fg: integer(),
	fga: integer(),
	fgPct: real("fg_pct"),
	fg3: integer(),
	fg3a: integer(),
	fg3Pct: real("fg3_pct"),
	fg2: integer(),
	fg2a: integer(),
	fg2Pct: real("fg2_pct"), 
	efgPct: real("efg_pct"),
	ft: integer(),
	fta: integer(),
	ftPct: real("ft_pct"),
	orb: integer(),
	drb: integer(),
	trb: integer(),
	ast: integer(),
	stl: integer(),
	blk: integer(),
	tov: integer(),
	pts: integer(),
	pra: integer(),
	pr: integer(),
	pa: integer(),
	ra: integer(),
	sb: integer(),
}, (table) => [
	index("idx_game_data").using("btree", table.gameDate.asc().nullsLast().op("date_ops")),
	index("idx_player_name").using("btree", table.playerName.asc().nullsLast().op("text_ops")),
	index("idx_player_opponent").using("btree", table.playerName.asc().nullsLast().op("text_ops"), table.opponent.asc().nullsLast().op("text_ops")),
	unique("player_data_player_name_game_date_opponent_key").on(table.playerName, table.gameDate, table.opponent),
]);

export const playerProps = pgTable("player_props", {
	id: serial().primaryKey().notNull(),
	playerName: varchar("player_name", { length: 100 }).notNull(),
	gameDate: date("game_date").notNull(),
	statType: varchar("stat_type", { length: 20 }),
	ou: varchar({ length: 5 }),
	fairOdds: integer("fair_odds"),
	fairLine: real("fair_line"),
	bookOdds: integer("book_odds"),
	bookLine: real("book_line"),
}, (table) => [
	index("idx_player_date").using("btree", table.playerName.asc().nullsLast().op("date_ops"), table.gameDate.asc().nullsLast().op("date_ops")),
	check("player_props_ou_check", sql`(ou)::text = ANY ((ARRAY['OVER'::character varying, 'UNDER'::character varying])::text[])`),
  unique("unique_player_game_stat").on(
    table.playerName, 
    table.gameDate, 
    table.statType
  ),
]);

export type PlayerProp = typeof playerProps.$inferSelect;
export type PlayerGameLog = typeof playerData.$inferSelect;
export const PLAYER_STAT_NAMES: string[] = [
  "fg",
  "fga",
  "fgPct",
  "fg3",
  "fg3a",
  "fg3Pct",
  "fg2",
  "fg2a",
  "fg2Pct",
  "efgPct",
  "ft",
  "fta",
  "ftPct",
  "orb",
  "drb",
  "trb",
  "ast",
  "stl",
  "blk",
  "tov",
  "pts",
  "pra",
  "pr",
  "pa",
  "ra",
  "sb",
];

export type PLAYER_STAT_TYPE =
  | "fg"
  | "fga"
  | "fgPct"
  | "fg3"
  | "fg3a"
  | "fg3Pct"
  | "fg2"
  | "fg2a"
  | "fg2Pct"
  | "efgPct"
  | "ft"
  | "fta"
  | "ftPct"
  | "orb"
  | "drb"
  | "trb"
  | "ast"
  | "stl"
  | "blk"
  | "tov"
  | "pts"
  | "pra"
  | "pr"
  | "pa"
  | "ra"
  | "sb";
