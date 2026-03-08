"use client";

import { useState } from "react";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface Props {
  url: string;
  text: string;
}

export default function ShareButtons({ url, text }: Props) {
  const [copied, setCopied] = useState(false);

  function handleTwitterShare() {
    trackEvent(EVENTS.SHARE_CLICK, { method: "twitter" });
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  }

  async function handleCopyLink() {
    // Try native share sheet first (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch {
        // User cancelled or share not supported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      trackEvent(EVENTS.SHARE_CLICK, { method: "copy" });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed silently
    }
  }

  const btnClass =
    "text-xs font-bold px-3 py-1.5 rounded-lg border border-pe-border/10 bg-pe-surface-1 text-pe-text-secondary hover:text-pe-text-primary hover:border-pe-border/20 transition-colors";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleTwitterShare}
        className={btnClass}
        aria-label="Share on X (Twitter)"
      >
        Share on X
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        className={btnClass}
        aria-label="Copy link to clipboard"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
