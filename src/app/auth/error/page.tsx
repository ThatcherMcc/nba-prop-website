import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In Error | PropEdge",
};

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration. Please contact support.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "There was a problem starting the sign-in flow. Please try again.",
  OAuthCallback: "There was a problem completing the sign-in. Please try again.",
  OAuthCreateAccount: "Could not create an account. Please try again.",
  EmailCreateAccount: "Could not create an account with this email. Please try again.",
  Callback: "There was a problem during sign-in. Please try again.",
  OAuthAccountNotLinked:
    "This email is already associated with another sign-in method. Please use the original method.",
  EmailSignin: "There was a problem sending the verification email. Please try again.",
  CredentialsSignin: "Sign in failed. Check your credentials and try again.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected error occurred. Please try again.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message =
    (error && ERROR_MESSAGES[error]) ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter flex items-center gap-2"
          >
            <span className="bg-pe-accent-strong p-2 rounded-xl text-base">
              &#127936;
            </span>
            PROP<span className="text-pe-accent">EDGE</span>
          </Link>
        </div>

        <div className="rounded-2xl bg-pe-surface-1 border border-pe-border/10 p-6 text-center">
          <div className="text-3xl mb-4">&#9888;</div>
          <h1 className="text-xl font-black text-pe-text-primary mb-2">
            Sign In Error
          </h1>
          <p className="text-sm text-pe-text-muted mb-6">{message}</p>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center justify-center rounded-xl bg-pe-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-pe-accent/90 transition-colors"
          >
            Try again
          </Link>
        </div>

        <p className="text-center text-xs text-pe-text-faint mt-6">
          <Link href="/" className="hover:text-pe-text-muted transition-colors underline underline-offset-2">
            Back to PropEdge
          </Link>
        </p>
      </div>
    </div>
  );
}
