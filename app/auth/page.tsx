import { AuthExperience } from "@/components/AuthExperience";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Account Access",
  "Create or access your Cash Lab account with secure email verification.",
);

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <AuthExperience initialMode={tab === "login" ? "login" : "register"} />
  );
}
