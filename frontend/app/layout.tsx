import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AnimatedCursor } from "@/components/AnimatedCursor";
import { ScrollProgress } from "@/components/ScrollProgress";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "WABIL — Premium Ladies Suits",
  description: "Dress Like Royalty. Premium ladies suits, bridal & couture.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${dmSans.variable} font-body`}>
        <Providers>
          <ScrollProgress />
          <AnimatedCursor />
          {children}
        </Providers>
      </body>
    </html>
  );
}
