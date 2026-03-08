"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "pe_cookie_consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== "accepted" && stored !== "dismissed") {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-pe-surface-1 border-t border-pe-border/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <p className="flex-1 text-xs text-pe-text-muted leading-relaxed">
          PropEdge uses cookies and local storage to save your preferences
          (theme, layout). We do not sell your data or use third-party
          tracking.{" "}
          <Link href="/privacy" className="underline text-pe-text-secondary hover:text-pe-text-primary transition-colors">
            Privacy Policy
          </Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={accept}
            className="bg-pe-accent text-white rounded px-3 py-1 text-xs font-medium hover:bg-pe-accent-strong transition-colors"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="text-pe-text-faint text-xs underline hover:text-pe-text-muted transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
