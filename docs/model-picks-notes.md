# Model Picks Notes

Removed from the live frontend on 2026-03-30 while the model is being reevaluated.

## Removed UI surfaces

- Homepage hero and support copy that positioned PropEdge as a model-driven or AI picks product
- Slate page `Prop AI` section and AI pick counts
- Slate page metadata that described the page as ML or AI picks
- Track record page metadata describing ML model performance
- Navigation label `The Edge` for the slate route

## Saved product language

- "Read the slate like a model room, not a sportsbook lobby."
- "PropEdge turns raw NBA prop data into a sharper operating surface: ranked edges, trend context, and player-level research built for faster decisions."
- "Top model leverage"
- "Backtest archive"
- "Score the edges"
- "The prediction layer weighs recent form, player context, and market inputs to rank the day's highest-leverage spots."
- "Model performance graded against real results"
- "Past performance does not guarantee future results. All model outputs are probabilistic estimates, not guaranteed predictions."

## Deferred implementation surfaces still in codebase

- `src/lib/data.ts` ML query helpers and types
- `src/app/components/TrackRecordContent.tsx` ML-oriented components and tabs
- `src/app/api/og/pick/route.tsx`
- `src/app/components/PickShareButton.tsx`
- `src/app/api/send-daily-digest/route.ts`
- `src/app/api/send-weekly-recap/route.ts`

These are intentionally left in place for later reuse, but they are no longer part of the main homepage/slate flow.
