import type { Metadata } from "next";
import ProfilePageContent from "@/app/components/ProfilePageContent";

export const metadata: Metadata = {
  title: "Profile | PropEdge",
  description: "Customize your PropEdge experience.",
};

export default function ProfilePage() {
  return <ProfilePageContent />;
}
