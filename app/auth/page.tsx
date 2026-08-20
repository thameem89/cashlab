import { AuthExperience } from "@/components/AuthExperience";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Account Access",
  "Cash Lab account registration and sign-in interface demonstration.",
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
