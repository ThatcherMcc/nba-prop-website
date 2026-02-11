/**
 * DNP (did not play) detection from minutes_played.
 * Keep in sync with data.ts PLAYED_ONLY and .cursor/rules/nba-prop-website.mdc.
 * Excluded values (case-insensitive, trimmed): '', 'inactive', 'inact', 'did n', '0', '0:00'.
 */
const DNP_MINUTES_VALUES = ["", "inactive", "inact", "did n", "0", "0:00"] as const;

export function isDnpMinutes(mp: string | null | undefined): boolean {
  const v = (mp ?? "").toLowerCase().trim();
  return (DNP_MINUTES_VALUES as readonly string[]).includes(v);
}
