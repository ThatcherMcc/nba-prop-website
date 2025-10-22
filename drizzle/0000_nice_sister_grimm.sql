-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "player_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_name" text,
	"game_date" date,
	"location" text,
	"opponent" text,
	"fg" integer,
	"fga" integer,
	"fg_pct" real,
	"fg3" integer,
	"fg3a" integer,
	"fg3_pct" real,
	"fg2" integer,
	"fg2a" integer,
	"fg2_pct" real,
	"efg_pct" real,
	"ft" integer,
	"fta" integer,
	"ft_pct" real,
	"orb" integer,
	"drb" integer,
	"trb" integer,
	"ast" integer,
	"stl" integer,
	"blk" integer,
	"tov" integer,
	"pts" integer,
	"pra" integer,
	"pr" integer,
	"pa" integer,
	"ra" integer,
	"sb" integer,
	CONSTRAINT "player_data_player_name_game_date_opponent_key" UNIQUE("player_name","game_date","opponent")
);
--> statement-breakpoint
CREATE INDEX "idx_game_data" ON "player_data" USING btree ("game_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_player_name" ON "player_data" USING btree ("player_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_player_opponent" ON "player_data" USING btree ("player_name" text_ops,"opponent" text_ops);
*/