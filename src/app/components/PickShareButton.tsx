"use client";

import { useState } from "react";

interface PickShareButtonProps {
  playerName: string;
  market: string;
  line: number;
  direction: "OVER" | "UNDER";
  confidence?: number;
}

const BASE_URL = "https://propedge.bet";

export default function PickShareButton({
  playerName,
  market,
  line,
  direction,
  confidence,
}: PickShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const params = new URLSearchParams({
    player: playerName,
    market,
    line: String(line),
    direction,
  });
  if (confidence !== undefined) {
    params.set("confidence", String(confidence));
  }

  const shareUrl = `${BASE_URL}/slate?${params.toString()}`;
  const confStr = confidence !== undefined ? ` (${Math.round(confidence * 100)}% conf)` : "";
  const shareText = `${playerName} ${direction} ${line} ${market}${confStr} — PropEdge AI Pick`;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl });
        return;
      } catch {
        // cancelled or not supported — fall through
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard failed silently
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share ${playerName} ${direction} ${line} ${market} pick`}
      className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-pe-text-faint hover:text-pe-text-muted hover:bg-pe-surface-2/60 transition-colors"
      title={copied ? "Copied!" : "Share pick"}
    >
      {copied ? (
        /* checkmark */
        <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        /* share / upload icon */
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  );
}
