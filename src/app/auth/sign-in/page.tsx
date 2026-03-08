import type { Metadata } from "next";
import Link from "next/link";
import { signInWithGoogle, signInWithGitHub } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Sign In | PropEdge",
  description: "Sign in to PropEdge to access your profile and saved preferences.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;

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

        {/* Card */}
        <div className="rounded-2xl bg-pe-surface-1 border border-pe-border/10 p-6">
          <h1 className="text-xl font-black text-pe-text-primary text-center mb-1">
            Sign in to PropEdge
          </h1>
          <p className="text-sm text-pe-text-muted text-center mb-6">
            Access your profile, saved preferences, and picks.
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 text-center">
              {error === "OAuthAccountNotLinked"
                ? "This email is already linked to another provider. Try a different sign-in method."
                : "Something went wrong. Please try again."}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* Google */}
            <form
              action={async () => {
                "use server";
                await signInWithGoogle(callbackUrl);
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-pe-surface-2 border border-pe-border/10 px-4 py-3 text-sm font-semibold text-pe-text-primary hover:bg-pe-surface-2/80 hover:border-pe-border/20 transition-colors"
              >
                {/* Google SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </form>

            {/* GitHub */}
            <form
              action={async () => {
                "use server";
                await signInWithGitHub(callbackUrl);
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-pe-surface-2 border border-pe-border/10 px-4 py-3 text-sm font-semibold text-pe-text-primary hover:bg-pe-surface-2/80 hover:border-pe-border/20 transition-colors"
              >
                {/* GitHub SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </form>
          </div>
        </div>

        {/* Back to home */}
        <p className="text-center text-xs text-pe-text-faint mt-6">
          <Link href="/" className="hover:text-pe-text-muted transition-colors underline underline-offset-2">
            Back to PropEdge
          </Link>
        </p>
      </div>
    </div>
  );
}
