import { Policy, policyMetadata } from "@/components/shop/policy/Policy";

export const metadata = policyMetadata("privacy");

export default function Page() {
  return <Policy slug="privacy" />;
}
