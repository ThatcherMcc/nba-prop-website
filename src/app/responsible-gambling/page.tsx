import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Responsible Gambling | PropEdge",
  description:
    "Responsible gambling resources and crisis helplines. PropEdge is an analytics tool, not a sportsbook. If gambling is causing harm, help is available.",
  robots: { index: true, follow: true },
};

export default function ResponsibleGamblingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-black uppercase tracking-wide text-pe-text-primary mb-2">
          Responsible Gambling
        </h1>
        <p className="text-sm text-pe-text-secondary">
          If gambling is causing you or someone you know harm, help is available right now.
        </p>
      </div>

      {/* Crisis Resources — prominent amber callout */}
      <div className="mb-10 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6 space-y-5">
        <div>
          <h2 className="text-base font-black uppercase tracking-widest text-amber-400 mb-1">
            Crisis Resources
          </h2>
          <p className="text-xs text-pe-text-muted">
            Free, confidential, available 24/7.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
              National Problem Gambling Helpline
            </p>
            <a
              href="tel:18005224700"
              className="block text-xl font-black text-amber-400 hover:text-amber-300 transition-colors"
            >
              1-800-522-4700
            </a>
            <p className="text-xs text-pe-text-muted">Call or text. Free &amp; confidential.</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
              Gamblers Anonymous
            </p>
            <a
              href="https://www.gamblersanonymous.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-base font-bold text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2"
            >
              gamblersanonymous.org
            </a>
            <p className="text-xs text-pe-text-muted">Peer support &amp; meeting finder.</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
              SAMHSA National Helpline
            </p>
            <a
              href="tel:18006624357"
              className="block text-xl font-black text-amber-400 hover:text-amber-300 transition-colors"
            >
              1-800-662-4357
            </a>
            <p className="text-xs text-pe-text-muted">Substance use &amp; mental health.</p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            PropEdge Is Not a Sportsbook
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            PropEdge is a <strong className="text-pe-text-body">data analytics and statistics platform</strong>.
            We do not accept wagers, process payments, or operate as a gambling service in any
            capacity. All content on this Site is provided for informational and entertainment
            purposes only, and nothing here should be interpreted as an instruction or
            encouragement to gamble.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Use of this Site is restricted to individuals who are at least 21 years of age and
            located where sports betting is legal in their jurisdiction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            Signs of Problem Gambling
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Gambling can become problematic when it stops being entertainment. Common warning
            signs include:
          </p>
          <ul className="space-y-2 text-sm text-pe-text-secondary list-none">
            {[
              "Betting more money than you can afford to lose",
              "Chasing losses — placing more bets to win back money already lost",
              "Gambling interfering with work, relationships, or daily responsibilities",
              "Borrowing money or selling possessions to fund gambling",
              "Feeling restless or irritable when attempting to reduce or stop gambling",
              "Lying to friends or family about how much time or money you spend gambling",
              "Using gambling as a way to escape stress, anxiety, or depression",
              "Failed attempts to cut back or stop despite wanting to",
            ].map((sign) => (
              <li key={sign} className="flex items-start gap-2">
                <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500/70" aria-hidden="true" />
                {sign}
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            If any of these apply to you or someone you know, please reach out to a helpline above.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            Safe Gambling Practices
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            If you choose to bet on sports, consider these practices to keep gambling safe:
          </p>
          <ul className="space-y-2 text-sm text-pe-text-secondary list-none">
            {[
              "Set a strict budget before placing any bet and stick to it regardless of outcome",
              "Treat gambling losses as the cost of entertainment, not as money to be recovered",
              "Never bet money earmarked for rent, bills, food, or other necessities",
              "Never borrow money to gamble",
              "Set time limits for gambling sessions and take regular breaks",
              "Avoid gambling when emotionally distressed, tired, or under the influence",
              "Do not use analytics tools, including PropEdge, as guarantees of outcomes",
            ].map((practice) => (
              <li key={practice} className="flex items-start gap-2">
                <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500/70" aria-hidden="true" />
                {practice}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            Self-Exclusion Programs
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Most licensed sportsbooks offer <strong className="text-pe-text-body">self-exclusion programs</strong>{" "}
            that allow you to voluntarily ban yourself from their platform for a set period or
            permanently. These programs are free, easy to initiate, and legally enforceable in
            many jurisdictions.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Contact the customer support team of any sportsbook you use and ask about their
            self-exclusion or responsible gaming tools. Many also offer deposit limits, loss
            limits, and cool-off periods that can be set up without full exclusion.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            State-level self-exclusion registries are also available in many US states with
            legal sports betting. These registries can cover multiple operators simultaneously.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            Getting Help
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            There is no shame in reaching out. Problem gambling is a recognized health condition,
            and effective treatment is available. Counselors, peer support groups, and crisis
            lines exist specifically to help.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            The National Council on Problem Gambling helpline is free, confidential, and
            available around the clock:
          </p>
          <a
            href="tel:18005224700"
            className="inline-block mt-1 text-2xl font-black text-amber-400 hover:text-amber-300 transition-colors"
          >
            1-800-522-4700
          </a>
          <p className="text-xs text-pe-text-muted">Call or text, 24 hours a day, 7 days a week.</p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-pe-border/10 flex flex-wrap gap-4 text-xs text-pe-text-faint">
        <Link href="/terms" className="hover:text-pe-text-secondary transition-colors">
          Terms of Service
        </Link>
        <span aria-hidden="true">&middot;</span>
        <Link href="/privacy" className="hover:text-pe-text-secondary transition-colors">
          Privacy Policy
        </Link>
        <span aria-hidden="true">&middot;</span>
        <Link href="/" className="hover:text-pe-text-secondary transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
