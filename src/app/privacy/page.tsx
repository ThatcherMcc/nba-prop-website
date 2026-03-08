import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | PropEdge",
  description:
    "Privacy Policy for PropEdge — we do not collect or sell personal data. Theme preferences stored locally on your device only.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-black uppercase tracking-wide text-pe-text-primary mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-pe-text-faint">Last Updated: March 2026</p>
      </div>

      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            1. What We Collect
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            PropEdge collects minimal data. We may collect anonymous, aggregated usage data
            through analytics tooling (such as page view counts and general traffic patterns)
            to understand how the Site is used and improve its features. This data does not
            identify you personally and is not linked to any account.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Your theme selection and layout preferences are stored exclusively in your
            browser&#39;s <strong className="text-pe-text-body">localStorage</strong>. This data
            never leaves your device and is not transmitted to our servers.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            We do not require account registration. We do not collect names, email addresses,
            or any other personally identifiable information (PII) through normal use of the Site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            2. Cookies and Local Storage
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            PropEdge uses <strong className="text-pe-text-body">localStorage</strong> (not
            cookies) to persist your display preferences, such as color theme and layout choice,
            between visits. No third-party tracking cookies are set by PropEdge.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Third-party services embedded in the Site (such as hosting infrastructure or CDN
            providers) may set their own technical cookies necessary for delivery of the service.
            These are strictly functional and do not involve behavioral advertising.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            3. Data Sharing
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            PropEdge does <strong className="text-pe-text-body">not sell, rent, or share</strong> personal
            data with third parties. Because we collect no PII, there is no personal data to
            share with advertisers, data brokers, or other commercial entities.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            We may disclose aggregated, non-identifiable usage data to service providers who
            assist in operating the Site (such as hosting or analytics platforms), solely for
            the purpose of providing those services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            4. Data Retention
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Our database stores NBA game statistics, player game logs, and prop line data
            sourced from Basketball Reference and third-party sports data providers. This is
            public sports data &#8212; it does not include user-generated data or personal information.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Display preferences stored in localStorage are retained on your device until you
            clear your browser data. You can remove them at any time through your browser settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            5. Your Rights
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            Because PropEdge collects no personally identifiable information, GDPR, CCPA, and
            similar privacy rights (such as the right to access, correct, or delete personal
            data) are trivially satisfied &#8212; there is no personal data on our servers
            associated with you.
          </p>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            If you believe we have inadvertently collected data about you, please contact us
            at{" "}
            <a
              href="mailto:support@propedge.bet"
              className="text-pe-accent hover:underline underline-offset-2 transition-colors"
            >
              support@propedge.bet
            </a>{" "}
            and we will investigate and respond promptly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            6. Children
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            PropEdge is not directed to persons under the age of 21. We do not knowingly collect
            information from minors. If you believe a minor has accessed the Site, please contact
            us and we will take appropriate steps.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            7. Changes to This Policy
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            We may update this Privacy Policy from time to time. Any changes will be reflected
            by an updated &#8220;Last Updated&#8221; date at the top of this page. Continued use
            of the Site after changes are posted constitutes acceptance of the revised policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-pe-text-primary">
            8. Contact
          </h2>
          <p className="text-sm leading-relaxed text-pe-text-secondary">
            For questions or concerns about this Privacy Policy, contact us at{" "}
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
        <Link href="/terms" className="hover:text-pe-text-secondary transition-colors">
          Terms of Service
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
