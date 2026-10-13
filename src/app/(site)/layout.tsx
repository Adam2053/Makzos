import { Header } from "@/components/home/Header";
import { SiteFooter } from "@/components/home/SiteFooter";
import { CartDrawer } from "@/components/home/CartDrawer";

/** The shop's frame: one header, one footer and the bag drawer. The bag itself lives in the root layout. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <SiteFooter />
      <CartDrawer />
    </>
  );
}
