import {
  pgTable,
  index,
  unique,
  serial,
  date,
  integer,
  varchar,
  boolean,
  numeric,
  timestamp,
  text,
  primaryKey,
} from "drizzle-orm/pg-core";

// --- Neon schema (see directives/infrastructure/neon_schema.md) ---

export const teams = pgTable(
  "teams",
  {
    teamId: serial("team_id").primaryKey(),
    teamCode: varchar("team_code", { length: 3 }).notNull().unique(),
    teamName: varchar("team_name", { length: 50 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_team_abbr").on(table.teamCode)]
);

export const players = pgTable(
  "players",
  {
    playerId: serial("player_id").primaryKey(),
    playerName: varchar("player_name", { length: 100 }).notNull().unique(),
    url: varchar("url", { length: 120 }).notNull().unique(),
    playerAbbreviation: varchar("player_abbreviation", { length: 9 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_player_names").on(table.playerName)]
);

export const games = pgTable(
  "games",
  {
    gameId: serial("game_id").primaryKey(),
    gameDate: date("game_date").notNull(),
    homeTeamId: integer("home_team_id").notNull().references(() => teams.teamId),
    awayTeamId: integer("away_team_id").notNull().references(() => teams.teamId),
    season: varchar("season", { length: 9 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("unique_game").on(table.gameDate, table.homeTeamId, table.awayTeamId),
    index("idx_games_date").on(table.gameDate),
  ]
);

export const playerGameStats = pgTable(
  "player_game_stats",
  {
    gamelogId: serial("gamelog_id").primaryKey(),
    playerId: integer("player_id").notNull().references(() => players.playerId),
    gameId: integer("game_id").notNull().references(() => games.gameId),
    teamId: integer("team_id").notNull().references(() => teams.teamId),
    isHome: boolean("is_home").notNull(),
    minutesPlayed: varchar("minutes_played", { length: 5 }),
    fieldGoalsMade: integer("field_goals_made").default(0),
    fieldGoalsAttempted: integer("field_goals_attempted").default(0),
    fieldGoalPct: numeric("field_goal_pct"),
    threePointersMade: integer("three_pointers_made").default(0),
    threePointersAttempted: integer("three_pointers_attempted").default(0),
    threePointPct: numeric("three_point_pct"),
    twoPointersMade: integer("two_pointers_made").default(0),
    twoPointersAttempted: integer("two_pointers_attempted").default(0),
    twoPointPct: numeric("two_point_pct"),
    freeThrowsMade: integer("free_throws_made").default(0),
    freeThrowsAttempted: integer("free_throws_attempted").default(0),
    freeThrowPct: numeric("free_throw_pct"),
    effectiveFgPct: numeric("effective_fg_pct"),
    offensiveRebounds: integer("offensive_rebounds").default(0),
    defensiveRebounds: integer("defensive_rebounds").default(0),
    totalRebounds: integer("total_rebounds").default(0),
    assists: integer("assists").default(0),
    steals: integer("steals").default(0),
    blocks: integer("blocks").default(0),
    turnovers: integer("turnovers").default(0),
    personalFouls: integer("personal_fouls").default(0),
    points: integer("points").default(0),
    ptsRebAst: integer("pts_reb_ast"),
    ptsReb: integer("pts_reb"),
    ptsAst: integer("pts_ast"),
    rebAst: integer("reb_ast"),
    stlBlk: integer("stl_blk"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("unq_player_game").on(table.playerId, table.gameId),
    index("idx_stats_lookup").on(table.playerId, table.gameId),
  ]
);

export const propMarkets = pgTable("prop_markets", {
  marketId: serial("market_id").primaryKey(),
  marketCode: varchar("market_code", { length: 20 }).notNull().unique(),
  marketName: varchar("market_name", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const playerProps = pgTable(
  "player_props",
  {
    propId: serial("prop_id").primaryKey(),
    playerId: integer("player_id").notNull().references(() => players.playerId),
    gameId: integer("game_id").notNull().references(() => games.gameId),
    marketId: integer("market_id").notNull().references(() => propMarkets.marketId),
    overUnder: varchar("over_under", { length: 5 }),
    fairLine: numeric("fair_line"),
    fairOdds: integer("fair_odds"),
    bookLine: numeric("book_line"),
    bookOdds: integer("book_odds"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("unq_player_game_market").on(table.playerId, table.gameId, table.marketId),
    index("idx_props_lookup").on(table.playerId, table.gameId),
  ]
);

export const mlPredictions = pgTable(
  "ml_predictions",
  {
    predictionId: serial("prediction_id").primaryKey(),
    playerId: integer("player_id").notNull().references(() => players.playerId),
    gameId: integer("game_id").notNull().references(() => games.gameId),
    marketId: integer("market_id").notNull().references(() => propMarkets.marketId),
    pOver: numeric("p_over").notNull(),
    prediction: varchar("prediction", { length: 5 }).notNull(),
    confidence: numeric("confidence").notNull(),
    bookLine: numeric("book_line"),
    avgLast5: numeric("avg_last_5"),
    avgSeason: numeric("avg_season"),
    oppDefRank: integer("opp_def_rank"),
    lineZscore: numeric("line_zscore"),
    modelVersion: varchar("model_version", { length: 50 }),
    predictedAt: timestamp("predicted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("unq_ml_player_game_market").on(table.playerId, table.gameId, table.marketId),
    index("idx_ml_predictions_game").on(table.gameId),
    index("idx_ml_predictions_player_game").on(table.playerId, table.gameId),
  ]
);

export const teamDefensiveRatings = pgTable(
  "team_defensive_ratings",
  {
    ratingId: serial("rating_id").primaryKey(),
    teamId: integer("team_id").notNull().references(() => teams.teamId),
    season: varchar("season", { length: 9 }).notNull().default("2025-2026"),
    gamesPlayed: integer("games_played"),
    oppFg: numeric("opp_fg"),
    oppFga: numeric("opp_fga"),
    oppFgPct: numeric("opp_fg_pct"),
    opp3p: numeric("opp_3p"),
    opp3pa: numeric("opp_3pa"),
    opp3pPct: numeric("opp_3p_pct"),
    opp2p: numeric("opp_2p"),
    opp2pa: numeric("opp_2pa"),
    opp2pPct: numeric("opp_2p_pct"),
    oppFt: numeric("opp_ft"),
    oppFta: numeric("opp_fta"),
    oppFtPct: numeric("opp_ft_pct"),
    oppOrb: numeric("opp_orb"),
    oppDrb: numeric("opp_drb"),
    oppTrb: numeric("opp_trb"),
    oppAst: numeric("opp_ast"),
    oppStl: numeric("opp_stl"),
    oppBlk: numeric("opp_blk"),
    oppTov: numeric("opp_tov"),
    oppPf: numeric("opp_pf"),
    oppPts: numeric("opp_pts"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("unq_team_season_rating").on(table.teamId, table.season),
  ]
);

export const nbaAdvancedTeamStats = pgTable(
  "nba_advanced_team_stats",
  {
    statId: serial("stat_id").primaryKey(),
    teamId: integer("team_id").notNull().references(() => teams.teamId),
    season: varchar("season", { length: 9 }).notNull().default("2025-26"),
    gp: integer("gp"),
    w: integer("w"),
    l: integer("l"),
    wPct: numeric("w_pct"),
    offRating: numeric("off_rating"),
    defRating: numeric("def_rating"),
    netRating: numeric("net_rating"),
    eOffRating: numeric("e_off_rating"),
    eDefRating: numeric("e_def_rating"),
    eNetRating: numeric("e_net_rating"),
    pace: numeric("pace"),
    tsPct: numeric("ts_pct"),
    efgPct: numeric("efg_pct"),
    astPct: numeric("ast_pct"),
    astTo: numeric("ast_to"),
    astRatio: numeric("ast_ratio"),
    orebPct: numeric("oreb_pct"),
    drebPct: numeric("dreb_pct"),
    rebPct: numeric("reb_pct"),
    tmTovPct: numeric("tm_tov_pct"),
    pie: numeric("pie"),
    offRatingRank: integer("off_rating_rank"),
    defRatingRank: integer("def_rating_rank"),
    netRatingRank: integer("net_rating_rank"),
    paceRank: integer("pace_rank"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("unq_adv_team_season").on(table.teamId, table.season),
  ]
);

export const mlBacktestResults = pgTable(
  "ml_backtest_results",
  {
    id: serial("id").primaryKey(),
    gameDate: date("game_date").notNull(),
    playerName: text("player_name").notNull(),
    marketCode: text("market_code").notNull(),
    prediction: text("prediction").notNull(),
    bookLine: numeric("book_line"),
    pOver: numeric("p_over"),
    confidence: numeric("confidence"),
    actualValue: numeric("actual_value"),
    hit: boolean("hit"),
    avgLast5: numeric("avg_last_5"),
    oppDefRank: integer("opp_def_rank"),
    pickRank: integer("pick_rank").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("ml_backtest_results_game_date_player_name_market_code_key").on(table.gameDate, table.playerName, table.marketCode),
    index("idx_ml_backtest_date").on(table.gameDate),
  ]
);

export const subscribers = pgTable("subscribers", {
  subscriberId: serial("subscriber_id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
});

// --- NextAuth (Auth.js) tables ---

export const authUsers = pgTable("auth_users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).notNull().default("free"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("inactive"),
  subscriptionId: text("subscription_id"),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authAccounts = pgTable("auth_accounts", {
  userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => [
  primaryKey({ columns: [table.provider, table.providerAccountId] }),
]);

export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const authVerificationTokens = pgTable("auth_verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.identifier, table.token] }),
]);

// --- UI-facing type: flat game log shape (mapped from player_game_stats + games + players) ---

export type PlayerGameLog = {
  playerName: string | null;
  gameDate: string | null;
  location: string | null;
  opponent: string | null;
  mp: string | null;
  fg: number | null;
  fga: number | null;
  fgPct: number | null;
  fg3: number | null;
  fg3a: number | null;
  fg3Pct: number | null;
  fg2: number | null;
  fg2a: number | null;
  fg2Pct: number | null;
  efgPct: number | null;
  ft: number | null;
  fta: number | null;
  ftPct: number | null;
  orb: number | null;
  drb: number | null;
  trb: number | null;
  ast: number | null;
  stl: number | null;
  blk: number | null;
  tov: number | null;
  pts: number | null;
  pra: number | null;
  pr: number | null;
  pa: number | null;
  ra: number | null;
  sb: number | null;
};

export const PLAYER_STAT_NAMES: string[] = [
  "fg", "fga", "fgPct", "fg3", "fg3a", "fg3Pct", "fg2", "fg2a", "fg2Pct", "efgPct",
  "ft", "fta", "ftPct", "orb", "drb", "trb", "ast", "stl", "blk", "tov", "pts",
  "pra", "pr", "pa", "ra", "sb",
];

export type PLAYER_STAT_TYPE =
  | "fg" | "fga" | "fgPct" | "fg3" | "fg3a" | "fg3Pct" | "fg2" | "fg2a" | "fg2Pct" | "efgPct"
  | "ft" | "fta" | "ftPct" | "orb" | "drb" | "trb" | "ast" | "stl" | "blk" | "tov" | "pts"
  | "pra" | "pr" | "pa" | "ra" | "sb";
