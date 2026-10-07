import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/home/Header";
import { SiteFooter } from "@/components/home/SiteFooter";
import { CartDrawer } from "@/components/home/CartDrawer";

/** The shop's frame: one header, one footer and one bag, kept across the home, shop and story pages. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  );
}
