"use server";

import { signIn, signOut } from "@/lib/auth";

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: callbackUrl ?? "/profile" });
}

export async function signInWithGitHub(callbackUrl?: string) {
  await signIn("github", { redirectTo: callbackUrl ?? "/profile" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
