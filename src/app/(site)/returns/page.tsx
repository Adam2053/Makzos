import { Policy, policyMetadata } from "@/components/shop/policy/Policy";

export const metadata = policyMetadata("returns");

export default function Page() {
  return <Policy slug="returns" />;
}
