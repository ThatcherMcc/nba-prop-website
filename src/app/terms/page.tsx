import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | PropEdge",
  description:
    "Terms of Service for PropEdge — NBA player prop analytics for informational and entertainment purposes only.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-black uppercase tracking-wide text-pe-text-primary mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-pe-text-faint">Effective Date: March 2026</p>
      </div>

      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            1. Acceptance of Terms
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            By accessing or using PropEdge (&#8220;the Site&#8221;), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, do not use the Site.
            Your continued use of the Site after any changes to these terms constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            2. Nature of the Service
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            PropEdge provides NBA player statistics, prop line trends, and data-driven
            analytics strictly for <strong className="text-pe-text-body">informational and entertainment purposes only</strong>.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            PropEdge is <strong className="text-pe-text-body">not</strong> a sportsbook, betting
            operator, gambling platform, or financial advisor. We do not accept wagers, process
            transactions, or hold funds of any kind. Nothing on this Site constitutes gambling
            advice, financial advice, or a recommendation to place any bet.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            All content, including model outputs, trend indicators, and edge scores, is provided
            as-is for analytical interest. The decision to gamble is solely yours, and PropEdge
            bears no responsibility for the outcome of any wager.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            3. Age Requirement
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            You must be at least <strong className="text-pe-text-body">21 years of age</strong> to
            use this Site. By accessing PropEdge, you represent and warrant that you meet this
            age requirement. If you are under 21, you are not permitted to use this Site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            4. Accuracy of Data
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Statistical data displayed on PropEdge is sourced from Basketball Reference and
            other third-party data providers. While we update data daily and make reasonable
            efforts to ensure accuracy, we make <strong className="text-pe-text-body">no guarantees</strong> regarding
            the completeness, correctness, or timeliness of any data on the Site.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Data may contain errors, omissions, or delays. PropEdge is not responsible for
            decisions made based on inaccurate or outdated information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            5. Model Performance
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Any win rates, accuracy figures, or return-on-investment metrics displayed on this
            Site reflect <strong className="text-pe-text-body">back-tested historical results</strong> derived
            from past data. These figures are provided for transparency and research interest only.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            <strong className="text-pe-text-body">Past performance is not indicative of future results.</strong>{" "}
            Statistical models may perform differently in live conditions than they did on
            historical data. No guarantee of future accuracy, profitability, or outcomes is
            made or implied.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            6. Limitation of Liability
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            To the fullest extent permitted by applicable law, PropEdge and its operators shall
            not be liable for any direct, indirect, incidental, special, or consequential damages
            arising from your use of the Site, including but not limited to any financial losses
            from gambling or betting decisions informed by content on this Site.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            You use the Site entirely at your own risk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            7. Intellectual Property
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            The Site design, code, branding, written content, and analytical methodologies are
            the proprietary work of PropEdge. You may not reproduce, distribute, or create
            derivative works from any part of the Site without express written permission.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            NBA statistics and player data are sourced from Basketball Reference and remain
            subject to their respective ownership and licensing terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            8. Changes to Terms
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            PropEdge reserves the right to modify these Terms of Service at any time without
            prior notice. Changes will be reflected by an updated effective date at the top of
            this page. Your continued use of the Site following any changes constitutes your
            acceptance of the revised terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            9. Contact
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            For questions regarding these Terms of Service, contact us at{" "}
            <a
              href="mailto:support@propedge.bet"
              className="text-pe-accent hover:underline underline-offset-2 transition-colors"
            >
              support@propedge.bet
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-pe-border/10 flex flex-wrap gap-4 text-xs text-pe-text-faint">
        <Link href="/privacy" className="hover:text-pe-text-secondary transition-colors">
          Privacy Policy
        </Link>
        <span aria-hidden="true">&middot;</span>
        <Link href="/responsible-gambling" className="hover:text-pe-text-secondary transition-colors">
          Responsible Gambling
        </Link>
        <span aria-hidden="true">&middot;</span>
        <Link href="/" className="hover:text-pe-text-secondary transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
