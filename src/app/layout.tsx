import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { Analytics } from "@/components/Analytics";
import { SCHOOL } from "@/lib/constants";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

// Display serif. Newsreader is a distinctive warm serif; Taste flags Fraunces
// as an over-used tell. A 16-year-old heritage school justifies a serif.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kidsplanetkullu.com"),
  title: {
    default: "Kids Planet School, Dhalpur Kullu: Pre-Nursery to Class 8",
    template: `%s | ${SCHOOL.name} School, Kullu`,
  },
  description:
    "English-medium Pre-Nursery to Class 8 school in Dhalpur, Kullu since 2010. Small classes, teachers who know every child. Admissions open 2027-28.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/tab-logo.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: SCHOOL.name,
    title: "Kids Planet School, Dhalpur Kullu",
    description:
      "A Pre-Nursery to Class 8 school in the Kullu Valley since 2010. Small classes, thirteen children to every teacher. Admissions open for 2027-28.",
    url: "/",
    locale: "en_IN",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${SCHOOL.name}` }],
  },
};

export const viewport: Viewport = {
  themeColor: "#2d5016",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${newsreader.variable}`}>
      <body className="min-h-[100dvh] antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-canvas"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyMobileCTA />
        <Analytics />
      </body>
    </html>
  );
}
