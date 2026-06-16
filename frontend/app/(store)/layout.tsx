import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { PageTransition } from "@/components/PageTransition";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <PageTransition>
        <main className="min-h-screen">{children}</main>
      </PageTransition>
      <Footer />
    </>
  );
}
