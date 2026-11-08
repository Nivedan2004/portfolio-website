import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/header";
import { ScrollReveals } from "@/components/scroll-reveals";
import { Footer } from "@/components/footer";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Software engineering × Security | Nivedan B R",
    template: "%s | Nivedan B R",
  },
  description:
    "I like building things—and figuring out what could go wrong before they ship. Software engineering, security, and a little Simba.",
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="site-shell">
          <Header />
          {children}
          <Footer />
          <ScrollReveals />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
