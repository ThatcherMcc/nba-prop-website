import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import ProfilePageContent from "@/app/components/ProfilePageContent";

export const metadata: Metadata = {
  title: "Profile | PropEdge",
  description: "Customize your PropEdge experience.",
};

export default async function ProfilePage() {
  const session = await auth();
  return <ProfilePageContent session={session} />;
}
