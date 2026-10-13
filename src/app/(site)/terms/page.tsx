import { Policy, policyMetadata } from "@/components/shop/policy/Policy";

export const metadata = policyMetadata("terms");

export default function Page() {
  return <Policy slug="terms" />;
}
