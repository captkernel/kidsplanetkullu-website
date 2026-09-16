import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { SCHOOL } from "@/lib/constants";
import { getSchoolJsonLd } from "@/lib/metadata";

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
    default: `${SCHOOL.name}, ${SCHOOL.motto}`,
    template: `%s | ${SCHOOL.name}`,
  },
  description:
    "Kids Planet is a Playgroup to Class 8 school in Dhalpur, Kullu, established in 2010. Small classes, patient teaching, and foundation years that shape a child. Admissions open for 2026-27.",
  keywords: [
    "Kids Planet",
    "school in Kullu",
    "Kullu Valley school",
    "playgroup Kullu",
    "best school Kullu",
    "Dhalpur school",
  ],
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
    title: `${SCHOOL.name}, ${SCHOOL.motto}`,
    description:
      "A Playgroup to Class 8 school in the Kullu Valley since 2010. Small classes and teachers who stay close to your child. Admissions open for 2026-27.",
    url: "https://kidsplanetkullu.com",
    locale: "en_IN",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${SCHOOL.name}` }],
  },
  alternates: { canonical: "https://kidsplanetkullu.com" },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getSchoolJsonLd()) }}
        />
      </body>
    </html>
  );
}
