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
	fg3A: integer(),
	fg3Pct: real("fg3_pct"),
	fg2: integer(),
	fg2A: integer(),
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
	fairLine: integer("fair_line"),
	bookOdds: integer("book_odds"),
	bookLine: integer("book_line"),
}, (table) => [
	index("idx_player_date").using("btree", table.playerName.asc().nullsLast().op("date_ops"), table.gameDate.asc().nullsLast().op("date_ops")),
	check("player_props_ou_check", sql`(ou)::text = ANY ((ARRAY['OVER'::character varying, 'UNDER'::character varying])::text[])`),
]);
