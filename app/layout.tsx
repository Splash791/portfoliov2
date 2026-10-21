import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Cursor from "@/components/ui/Cursor";
import PageTransition from "@/components/ui/PageTransition";
import SmoothScroll from "@/components/ui/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// TODO: large kinetic headline accents only (section 3) — not for body copy.
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // TODO: section 12 — the real domain isn't named anywhere in the plan
  // (just "already owned, connect to Vercel at deploy"); this placeholder
  // just resolves OG/Twitter image URLs correctly in the meantime.
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Tyler Quach",
    template: "%s",
  },
  description:
    "Tyler Quach — CS @ Oregon State University. Projects, ML research, and travel + tech notes.",
  openGraph: {
    title: "Tyler Quach",
    description:
      "Tyler Quach — CS @ Oregon State University. Projects, ML research, and travel + tech notes.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // `snap-mandatory`: always resolves to a section boundary (never
      // stuck between). Only feels right with Lenis off on this route
      // (see SmoothScroll.tsx) -- Lenis's JS wheel smoothing fighting
      // mandatory snap is what made an earlier version feel like an
      // abrupt full jump on every tick. Harmless on routes with no
      // snap-start descendants (/blog, /blog/[slug]).
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased snap-y snap-mandatory`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        <SmoothScroll />
        <Cursor />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
