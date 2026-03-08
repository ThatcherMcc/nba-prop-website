import Link from "next/link";

export default function LegalDisclaimerBar() {
  return (
    <div className="border-t border-pe-border/5 bg-pe-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
        <p className="text-[10px] text-pe-text-faint leading-relaxed">
          21+ &middot; Gambling Problem? Call{" "}
          <a
            href="tel:18005224700"
            className="underline underline-offset-2 hover:text-pe-text-muted transition-colors"
          >
            1-800-522-4700
          </a>{" "}
          &middot; For entertainment purposes only
        </p>
        <nav className="flex items-center gap-3 text-[10px] text-pe-text-faint flex-shrink-0">
          <Link
            href="/terms"
            className="hover:text-pe-text-muted transition-colors"
          >
            Terms
          </Link>
          <span aria-hidden="true">&middot;</span>
          <Link
            href="/privacy"
            className="hover:text-pe-text-muted transition-colors"
          >
            Privacy
          </Link>
          <span aria-hidden="true">&middot;</span>
          <Link
            href="/responsible-gambling"
            className="hover:text-pe-text-muted transition-colors"
          >
            Responsible Gambling
          </Link>
        </nav>
      </div>
    </div>
  );
}
