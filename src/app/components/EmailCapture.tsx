"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading" || status === "success") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else if (res.status === 400) {
        setErrorMessage("Please enter a valid email address.");
        setStatus("error");
      } else if (res.status === 409) {
        setErrorMessage("That email is already subscribed.");
        setStatus("error");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="bg-pe-surface-1/60 border border-pe-border/5 rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-base font-black text-pe-text-primary mb-1">
          Get The Edge in Your Inbox
        </h3>
        <p className="text-sm text-pe-text-muted">
          Weekly prop insights delivered every Monday.
        </p>
      </div>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold py-2.5">
          <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">
            +
          </span>
          You&apos;re in!
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="your@email.com"
            required
            disabled={status === "loading"}
            className="flex-1 bg-pe-surface-2 border border-pe-border/10 rounded-xl px-4 py-2.5 text-sm text-pe-text-primary placeholder:text-pe-text-faint focus:outline-none focus:border-pe-border/30 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-pe-accent hover:bg-pe-accent/80 text-white font-bold rounded-xl px-6 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      )}

      {status === "error" && errorMessage && (
        <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
      )}
    </div>
  );
}
