import type { Metadata } from "next";
import { ContactView } from "./ContactView";
import { Business } from "./Business";

export const metadata: Metadata = { title: "Contact us — Makzo's" };

export default function ContactPage() {
  return (
    <>
      <ContactView />
      <Business />
    </>
  );
}
