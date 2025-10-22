import {
  pgTable,
  index,
  unique,
  serial,
  text,
  date,
  integer,
  real,
} from "drizzle-orm/pg-core";

export const playerData = pgTable(
  "player_data",
  {
    id: serial().primaryKey().notNull(),
    playerName: text("player_name"),
    gameDate: date("game_date"),
    location: text(),
    opponent: text(),
    fg: integer(),
    fga: integer(),
    fg_pct: real("fg_pct"),
    fg3: integer(),
    fg3a: integer(),
    fg3_pct: real("fg3_pct"),
    fg2: integer(),
    fg2a: integer(),
    fg2_pct: real("fg2_pct"),
    efg_pct: real("efg_pct"),
    ft: integer(),
    fta: integer(),
    ft_pct: real("ft_pct"),
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
  },
  (table) => [
    index("idx_game_data").using(
      "btree",
      table.gameDate.asc().nullsLast().op("date_ops")
    ),
    index("idx_player_name").using(
      "btree",
      table.playerName.asc().nullsLast().op("text_ops")
    ),
    index("idx_player_opponent").using(
      "btree",
      table.playerName.asc().nullsLast().op("text_ops"),
      table.opponent.asc().nullsLast().op("text_ops")
    ),
    unique("player_data_player_name_game_date_opponent_key").on(
      table.playerName,
      table.gameDate,
      table.opponent
    ),
  ]
);

export type PlayerGameLog = typeof playerData.$inferSelect;
export const PLAYER_STAT_NAMES: string[] = [
  "fg",
  "fga",
  "fg_pct",
  "fg3",
  "fg3a",
  "fg3_pct",
  "fg2",
  "fg2a",
  "fg2_pct",
  "efg_pct",
  "ft",
  "fta",
  "ft_pct",
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
  | "fg_pct"
  | "fg3"
  | "fg3a"
  | "fg3_pct"
  | "fg2"
  | "fg2a"
  | "fg2_pct"
  | "efg_pct"
  | "ft"
  | "fta"
  | "ft_pct"
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
