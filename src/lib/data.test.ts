import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Neon serverless driver before importing data module
vi.mock("@neondatabase/serverless", () => ({
  neon: () => {
    const queryFn = async () => [];
    return queryFn;
  },
}));

// Mock next/cache so unstable_cache just returns the inner function
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

// Mock next/headers (used by "use server" modules)
vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => null }),
  headers: () => new Map(),
}));

describe("data.ts smoke tests", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports getPlayerNames", async () => {
    const mod = await import("./data");
    expect(mod.getPlayerNames).toBeDefined();
    expect(typeof mod.getPlayerNames).toBe("function");
  });

  it("exports getPlayerExists", async () => {
    const mod = await import("./data");
    expect(mod.getPlayerExists).toBeDefined();
    expect(typeof mod.getPlayerExists).toBe("function");
  });

  it("exports getTopScorersLastGame", async () => {
    const mod = await import("./data");
    expect(mod.getTopScorersLastGame).toBeDefined();
    expect(typeof mod.getTopScorersLastGame).toBe("function");
  });

  it("exports PlayerGameLog type via db schema", async () => {
    const schema = await import("@/db/schema");
    expect(schema.PLAYER_STAT_NAMES).toBeInstanceOf(Array);
    expect(schema.PLAYER_STAT_NAMES.length).toBeGreaterThan(0);
    expect(schema.PLAYER_STAT_NAMES).toContain("pts");
    expect(schema.PLAYER_STAT_NAMES).toContain("ast");
    expect(schema.PLAYER_STAT_NAMES).toContain("trb");
  });
});

describe("schema.ts smoke tests", () => {
  it("exports all expected tables", async () => {
    const schema = await import("@/db/schema");
    expect(schema.teams).toBeDefined();
    expect(schema.players).toBeDefined();
    expect(schema.games).toBeDefined();
    expect(schema.playerGameStats).toBeDefined();
    expect(schema.propMarkets).toBeDefined();
    expect(schema.playerProps).toBeDefined();
    expect(schema.subscribers).toBeDefined();
  });
});
