import { Policy, policyMetadata } from "@/components/shop/policy/Policy";

export const metadata = policyMetadata("shipping");

export default function Page() {
  return <Policy slug="shipping" />;
}
