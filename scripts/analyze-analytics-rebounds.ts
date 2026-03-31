import { sql } from "drizzle-orm";
import { db } from "../src/db";

async function main() {
  const result = await db.execute<{ payload: unknown }>(sql`
    WITH available_dates AS (
      SELECT DISTINCT g.game_date AS dt
      FROM games g
      JOIN player_props pp ON pp.game_id = g.game_id AND pp.book_line IS NOT NULL
      WHERE g.game_date >= DATE '2025-10-01'
    ),
    ranked_games AS (
      SELECT
        ad.dt,
        s.player_id,
        s.points,
        s.total_rebounds,
        s.assists,
        s.steals,
        s.blocks,
        s.three_pointers_made,
        s.free_throws_made,
        s.turnovers,
        s.pts_reb_ast,
        ROW_NUMBER() OVER (PARTITION BY ad.dt, s.player_id ORDER BY g.game_date DESC) AS rn
      FROM available_dates ad
      JOIN games g ON g.game_date < ad.dt
      JOIN player_game_stats s ON s.game_id = g.game_id
      WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
    ),
    last_10 AS (
      SELECT * FROM ranked_games WHERE rn <= 10
    ),
    target_props AS (
      SELECT
        g.game_date AS dt,
        pp.player_id,
        pm.market_code,
        pp.book_line,
        CASE
          WHEN pgs.team_id = g.home_team_id THEN g.away_team_id
          ELSE g.home_team_id
        END AS opponent_team_id
      FROM player_props pp
      JOIN games g ON g.game_id = pp.game_id
      JOIN prop_markets pm ON pm.market_id = pp.market_id
      JOIN player_game_stats pgs ON pgs.player_id = pp.player_id AND pgs.game_id = pp.game_id
      WHERE pp.book_line IS NOT NULL
        AND pm.market_code NOT IN ('FTM', 'TOV')
    ),
    hit_rates AS (
      SELECT
        tp.dt,
        tp.player_id,
        tp.market_code,
        tp.book_line,
        tp.opponent_team_id,
        COUNT(*)::int AS games_checked,
        COUNT(*) FILTER (
          WHERE CASE tp.market_code
            WHEN 'PTS' THEN l.points
            WHEN 'REB' THEN l.total_rebounds
            WHEN 'AST' THEN l.assists
            WHEN 'STL' THEN l.steals
            WHEN 'BLK' THEN l.blocks
            WHEN 'FG3' THEN l.three_pointers_made
            WHEN 'PRA' THEN l.pts_reb_ast
            WHEN 'PR' THEN l.points + l.total_rebounds
            WHEN 'PA' THEN l.points + l.assists
            WHEN 'RA' THEN l.total_rebounds + l.assists
            WHEN 'SB' THEN l.steals + l.blocks
          END > tp.book_line
        )::int AS over_count,
        COUNT(*) FILTER (
          WHERE CASE tp.market_code
            WHEN 'PTS' THEN l.points
            WHEN 'REB' THEN l.total_rebounds
            WHEN 'AST' THEN l.assists
            WHEN 'STL' THEN l.steals
            WHEN 'BLK' THEN l.blocks
            WHEN 'FG3' THEN l.three_pointers_made
            WHEN 'PRA' THEN l.pts_reb_ast
            WHEN 'PR' THEN l.points + l.total_rebounds
            WHEN 'PA' THEN l.points + l.assists
            WHEN 'RA' THEN l.total_rebounds + l.assists
            WHEN 'SB' THEN l.steals + l.blocks
          END < tp.book_line
        )::int AS under_count,
        AVG(
          CASE tp.market_code
            WHEN 'PTS' THEN l.points
            WHEN 'REB' THEN l.total_rebounds
            WHEN 'AST' THEN l.assists
            WHEN 'STL' THEN l.steals
            WHEN 'BLK' THEN l.blocks
            WHEN 'FG3' THEN l.three_pointers_made
            WHEN 'PRA' THEN l.pts_reb_ast
            WHEN 'PR' THEN l.points + l.total_rebounds
            WHEN 'PA' THEN l.points + l.assists
            WHEN 'RA' THEN l.total_rebounds + l.assists
            WHEN 'SB' THEN l.steals + l.blocks
          END
        ) AS avg_last10,
        MAX(
          CASE tp.market_code
            WHEN 'PTS' THEN l.points
            WHEN 'REB' THEN l.total_rebounds
            WHEN 'AST' THEN l.assists
            WHEN 'STL' THEN l.steals
            WHEN 'BLK' THEN l.blocks
            WHEN 'FG3' THEN l.three_pointers_made
            WHEN 'PRA' THEN l.pts_reb_ast
            WHEN 'PR' THEN l.points + l.total_rebounds
            WHEN 'PA' THEN l.points + l.assists
            WHEN 'RA' THEN l.total_rebounds + l.assists
            WHEN 'SB' THEN l.steals + l.blocks
          END
        ) FILTER (WHERE l.rn = 1) AS prev_game_value
      FROM target_props tp
      JOIN last_10 l ON l.dt = tp.dt AND l.player_id = tp.player_id
      GROUP BY tp.dt, tp.player_id, tp.market_code, tp.book_line, tp.opponent_team_id
      HAVING COUNT(*) >= 5
    ),
    over_ranked AS (
      SELECT
        h.dt,
        h.player_id,
        h.market_code,
        h.book_line,
        h.opponent_team_id,
        h.prev_game_value,
        ROUND((h.over_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
        'over'::text AS side,
        ROW_NUMBER() OVER (
          PARTITION BY h.dt, h.player_id, 'over'
          ORDER BY (h.over_count::numeric / h.games_checked) DESC,
            ABS(h.avg_last10 - h.book_line) / NULLIF(h.book_line, 0) DESC
        ) AS player_rn
      FROM hit_rates h
      WHERE h.over_count::numeric / h.games_checked >= 0.6
        AND h.book_line > 1.5
    ),
    under_ranked AS (
      SELECT
        h.dt,
        h.player_id,
        h.market_code,
        h.book_line,
        h.opponent_team_id,
        h.prev_game_value,
        ROUND((h.under_count::numeric / h.games_checked) * 100, 0) AS hit_rate,
        'under'::text AS side,
        ROW_NUMBER() OVER (
          PARTITION BY h.dt, h.player_id, 'under'
          ORDER BY (h.under_count::numeric / h.games_checked) DESC,
            ABS(h.avg_last10 - h.book_line) / NULLIF(h.book_line, 0) DESC
        ) AS player_rn
      FROM hit_rates h
      WHERE h.under_count::numeric / h.games_checked >= 0.6
        AND h.book_line > 1.5
        AND h.market_code != 'FG3'
        AND NOT (h.market_code IN ('BLK', 'STL', 'SB') AND h.book_line <= 1.5)
        AND NOT (h.market_code = 'AST' AND h.book_line <= 2.5)
    ),
    all_picks AS (
      SELECT * FROM over_ranked WHERE player_rn <= 2
      UNION ALL
      SELECT * FROM under_ranked WHERE player_rn <= 2
    ),
    actual AS (
      SELECT
        ap.dt,
        ap.player_id,
        ap.market_code,
        CASE ap.market_code
          WHEN 'PTS' THEN s.points
          WHEN 'REB' THEN s.total_rebounds
          WHEN 'AST' THEN s.assists
          WHEN 'STL' THEN s.steals
          WHEN 'BLK' THEN s.blocks
          WHEN 'FG3' THEN s.three_pointers_made
          WHEN 'PRA' THEN s.pts_reb_ast
          WHEN 'PR' THEN s.points + s.total_rebounds
          WHEN 'PA' THEN s.points + s.assists
          WHEN 'RA' THEN s.total_rebounds + s.assists
          WHEN 'SB' THEN s.steals + s.blocks
        END AS actual_value
      FROM all_picks ap
      JOIN games g ON g.game_date = ap.dt
      JOIN player_game_stats s ON s.game_id = g.game_id AND s.player_id = ap.player_id
      WHERE COALESCE(LOWER(TRIM(s.minutes_played)), '') NOT IN ('', 'inactive', 'inact', 'did n', '0', '0:00')
    ),
    def_ranks AS (
      SELECT
        tdr.team_id,
        ROW_NUMBER() OVER (ORDER BY tdr.opp_pts ASC) AS opp_pts_rank,
        ROW_NUMBER() OVER (ORDER BY tdr.opp_trb ASC) AS opp_trb_rank,
        ROW_NUMBER() OVER (ORDER BY tdr.opp_ast ASC) AS opp_ast_rank,
        ROW_NUMBER() OVER (ORDER BY tdr.opp_stl ASC) AS opp_stl_rank,
        ROW_NUMBER() OVER (ORDER BY tdr.opp_blk ASC) AS opp_blk_rank,
        ROW_NUMBER() OVER (ORDER BY tdr.opp_3p ASC) AS opp_3p_rank,
        ats.def_rating_rank
      FROM team_defensive_ratings tdr
      LEFT JOIN nba_advanced_team_stats ats ON ats.team_id = tdr.team_id
    ),
    graded AS (
      SELECT
        ap.dt,
        ap.player_id,
        ap.market_code,
        ap.side,
        ap.hit_rate,
        ap.book_line,
        ap.prev_game_value,
        CASE
          WHEN a.actual_value IS NULL THEN 'dnp'
          WHEN ap.side = 'over' AND a.actual_value > ap.book_line THEN 'win'
          WHEN ap.side = 'under' AND a.actual_value < ap.book_line THEN 'win'
          WHEN a.actual_value = ap.book_line THEN 'push'
          ELSE 'loss'
        END AS result,
        CASE ap.market_code
          WHEN 'PTS' THEN dr.opp_pts_rank
          WHEN 'REB' THEN dr.opp_trb_rank
          WHEN 'AST' THEN dr.opp_ast_rank
          WHEN 'FG3' THEN dr.opp_3p_rank
          WHEN 'STL' THEN dr.opp_stl_rank
          WHEN 'BLK' THEN dr.opp_blk_rank
          WHEN 'PRA' THEN ROUND((dr.opp_pts_rank + dr.opp_trb_rank + dr.opp_ast_rank) / 3.0)
          WHEN 'PR' THEN ROUND((dr.opp_pts_rank + dr.opp_trb_rank) / 2.0)
          WHEN 'PA' THEN ROUND((dr.opp_pts_rank + dr.opp_ast_rank) / 2.0)
          WHEN 'RA' THEN ROUND((dr.opp_trb_rank + dr.opp_ast_rank) / 2.0)
          WHEN 'SB' THEN ROUND((dr.opp_stl_rank + dr.opp_blk_rank) / 2.0)
          ELSE NULL
        END AS matchup_rank,
        dr.def_rating_rank
      FROM all_picks ap
      LEFT JOIN actual a
        ON a.dt = ap.dt
       AND a.player_id = ap.player_id
       AND a.market_code = ap.market_code
      LEFT JOIN def_ranks dr ON dr.team_id = ap.opponent_team_id
    ),
    loss90 AS (
      SELECT *
      FROM graded
      WHERE hit_rate >= 90
        AND result = 'loss'
    ),
    next_80 AS (
      SELECT
        l.dt AS loss_dt,
        n.side,
        n.dt AS next_dt,
        n.hit_rate AS next_hit_rate,
        n.result AS next_result,
        n.matchup_rank AS next_matchup_rank,
        n.def_rating_rank AS next_def_rating_rank,
        (n.dt - l.dt) AS days_between,
        ROW_NUMBER() OVER (
          PARTITION BY l.dt, l.player_id, l.market_code, l.side
          ORDER BY n.dt ASC
        ) AS seq
      FROM loss90 l
      JOIN graded n
        ON n.player_id = l.player_id
       AND n.market_code = l.market_code
       AND n.side = l.side
       AND n.dt > l.dt
       AND n.hit_rate BETWEEN 80 AND 89
    ),
    next_80_first AS (
      SELECT * FROM next_80 WHERE seq = 1
    ),
    summary AS (
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE next_result = 'win')::int AS wins,
        COUNT(*) FILTER (WHERE next_result = 'loss')::int AS losses,
        COUNT(*) FILTER (WHERE next_result = 'dnp')::int AS dnps,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE next_result = 'win')
          / NULLIF(COUNT(*) FILTER (WHERE next_result IN ('win', 'loss')), 0),
          1
        ) AS graded_hit_rate
      FROM next_80_first
    ),
    by_side AS (
      SELECT
        side,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE next_result = 'win')::int AS wins,
        COUNT(*) FILTER (WHERE next_result = 'loss')::int AS losses,
        COUNT(*) FILTER (WHERE next_result = 'dnp')::int AS dnps,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE next_result = 'win')
          / NULLIF(COUNT(*) FILTER (WHERE next_result IN ('win', 'loss')), 0),
          1
        ) AS graded_hit_rate
      FROM next_80_first
      GROUP BY side
      ORDER BY side
    ),
    by_gap AS (
      SELECT
        CASE
          WHEN days_between = 1 THEN '1 day'
          WHEN days_between BETWEEN 2 AND 3 THEN '2-3 days'
          WHEN days_between BETWEEN 4 AND 7 THEN '4-7 days'
          ELSE '8+ days'
        END AS gap_bucket,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE next_result = 'win')::int AS wins,
        COUNT(*) FILTER (WHERE next_result = 'loss')::int AS losses,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE next_result = 'win')
          / NULLIF(COUNT(*) FILTER (WHERE next_result IN ('win', 'loss')), 0),
          1
        ) AS graded_hit_rate
      FROM next_80_first
      GROUP BY 1
      ORDER BY 1
    ),
    by_gap_side AS (
      SELECT
        side,
        CASE
          WHEN days_between = 1 THEN '1 day'
          WHEN days_between BETWEEN 2 AND 3 THEN '2-3 days'
          WHEN days_between BETWEEN 4 AND 7 THEN '4-7 days'
          ELSE '8+ days'
        END AS gap_bucket,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE next_result = 'win')::int AS wins,
        COUNT(*) FILTER (WHERE next_result = 'loss')::int AS losses,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE next_result = 'win')
          / NULLIF(COUNT(*) FILTER (WHERE next_result IN ('win', 'loss')), 0),
          1
        ) AS graded_hit_rate
      FROM next_80_first
      GROUP BY side, 2
      ORDER BY side, 2
    ),
    by_matchup AS (
      SELECT
        CASE
          WHEN next_matchup_rank <= 10 THEN 'strong defense (1-10)'
          WHEN next_matchup_rank <= 20 THEN 'mid defense (11-20)'
          ELSE 'weak defense (21-30)'
        END AS bucket,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE next_result = 'win')::int AS wins,
        COUNT(*) FILTER (WHERE next_result = 'loss')::int AS losses,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE next_result = 'win')
          / NULLIF(COUNT(*) FILTER (WHERE next_result IN ('win', 'loss')), 0),
          1
        ) AS graded_hit_rate
      FROM next_80_first
      WHERE next_matchup_rank IS NOT NULL
      GROUP BY 1
      ORDER BY 1
    ),
    by_matchup_side AS (
      SELECT
        side,
        CASE
          WHEN next_matchup_rank <= 10 THEN 'strong defense (1-10)'
          WHEN next_matchup_rank <= 20 THEN 'mid defense (11-20)'
          ELSE 'weak defense (21-30)'
        END AS bucket,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE next_result = 'win')::int AS wins,
        COUNT(*) FILTER (WHERE next_result = 'loss')::int AS losses,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE next_result = 'win')
          / NULLIF(COUNT(*) FILTER (WHERE next_result IN ('win', 'loss')), 0),
          1
        ) AS graded_hit_rate
      FROM next_80_first
      WHERE next_matchup_rank IS NOT NULL
      GROUP BY side, 2
      ORDER BY side, 2
    ),
    by_def_rating AS (
      SELECT
        CASE
          WHEN next_def_rating_rank <= 10 THEN 'strong overall defense (1-10)'
          WHEN next_def_rating_rank <= 20 THEN 'mid overall defense (11-20)'
          ELSE 'weak overall defense (21-30)'
        END AS bucket,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE next_result = 'win')::int AS wins,
        COUNT(*) FILTER (WHERE next_result = 'loss')::int AS losses,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE next_result = 'win')
          / NULLIF(COUNT(*) FILTER (WHERE next_result IN ('win', 'loss')), 0),
          1
        ) AS graded_hit_rate
      FROM next_80_first
      WHERE next_def_rating_rank IS NOT NULL
      GROUP BY 1
      ORDER BY 1
    ),
    by_def_rating_side AS (
      SELECT
        side,
        CASE
          WHEN next_def_rating_rank <= 10 THEN 'strong overall defense (1-10)'
          WHEN next_def_rating_rank <= 20 THEN 'mid overall defense (11-20)'
          ELSE 'weak overall defense (21-30)'
        END AS bucket,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE next_result = 'win')::int AS wins,
        COUNT(*) FILTER (WHERE next_result = 'loss')::int AS losses,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE next_result = 'win')
          / NULLIF(COUNT(*) FILTER (WHERE next_result IN ('win', 'loss')), 0),
          1
        ) AS graded_hit_rate
      FROM next_80_first
      WHERE next_def_rating_rank IS NOT NULL
      GROUP BY side, 2
      ORDER BY side, 2
    )
    SELECT json_build_object(
      'summary', (SELECT row_to_json(summary) FROM summary),
      'by_side', (SELECT json_agg(by_side) FROM by_side),
      'by_gap', (SELECT json_agg(by_gap) FROM by_gap),
      'by_gap_side', (SELECT json_agg(by_gap_side) FROM by_gap_side),
      'by_matchup', (SELECT json_agg(by_matchup) FROM by_matchup),
      'by_matchup_side', (SELECT json_agg(by_matchup_side) FROM by_matchup_side),
      'by_def_rating', (SELECT json_agg(by_def_rating) FROM by_def_rating),
      'by_def_rating_side', (SELECT json_agg(by_def_rating_side) FROM by_def_rating_side)
    ) AS payload;
  `);

  console.log(JSON.stringify(result.rows[0]?.payload ?? null, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
