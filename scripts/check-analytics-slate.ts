import { getTopPicks, getUnderPicks } from "../src/lib/data";

async function main() {
  const [top, under] = await Promise.all([
    getTopPicks(5),
    getUnderPicks(5),
  ]);

  console.log(JSON.stringify({
    topCount: top.picks.length,
    topDate: top.propDate,
    topFirst: top.picks[0] ?? null,
    underCount: under.picks.length,
    underDate: under.propDate,
    underFirst: under.picks[0] ?? null,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
