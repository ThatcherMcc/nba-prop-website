import type { MetadataRoute } from "next";
import { getPlayerNames, getAvailableInsightWeeks } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://propedge.bet";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  let playerPages: MetadataRoute.Sitemap = [];
  try {
    const playerNames = await getPlayerNames();
    playerPages = playerNames.map((name) => ({
      url: `${baseUrl}/player/${encodeURIComponent(name)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch {
    // If DB is unavailable, return static pages only
  }

  let insightPages: MetadataRoute.Sitemap = [];
  try {
    const weeks = await getAvailableInsightWeeks();
    insightPages = weeks.map((w) => ({
      url: `${baseUrl}/insights/week-${w.weekStart}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // If DB is unavailable, skip insight pages
  }

  return [...staticPages, ...playerPages, ...insightPages];
}
