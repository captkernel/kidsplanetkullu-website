import type { Metadata } from "next";
import { SCHOOL } from "./constants";

export const SITE_URL = "https://kidsplanetkullu.com";

/**
 * Per-page metadata with a self-referencing canonical and matching og:url.
 * `path` uses the site's trailing-slash form ("/about/"). Without this every page
 * inherited the root layout's canonical and told Google it was a copy of the homepage.
 */
export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SCHOOL.name,
      title,
      description,
      url: path,
      locale: "en_IN",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SCHOOL.name }],
    },
  };
}

// Structured data for the homepage only. Follows Google's local-business and organization
// docs (see SEO_RESEARCH.md §2.4). Deliberately NOT included:
//   - aggregateRating: self-serving / copied from JustDial = against Google's review policy
//   - opening hours: Google Business Profile asks schools not to list hours
//   - FAQPage / HowTo / BreadcrumbList: no rich result for a site like this
export function getSchoolJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": ["School", "LocalBusiness"],
      "@id": `${SITE_URL}/#school`,
      name: "Kids Planet School",
      alternateName: ["Kids Planet", "Kids Planet Kullu"],
      description: SCHOOL.description,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/kp-logo.png`,
      image: [`${SITE_URL}/og-image.png`],
      telephone: SCHOOL.phone,
      email: SCHOOL.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Gurubehar, Dhalpur",
        addressLocality: "Kullu",
        addressRegion: "Himachal Pradesh",
        postalCode: "175101",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 31.95362,
        longitude: 77.10726,
      },
      hasMap: SCHOOL.mapUrl,
      areaServed: { "@type": "City", name: "Kullu" },
      foundingDate: "2010",
      founder: { "@type": "Person", name: SCHOOL.founder },
      sameAs: [SCHOOL.social.facebook, SCHOOL.social.instagram, SCHOOL.justdial],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Kids Planet School",
      alternateName: "Kids Planet Kullu",
      url: `${SITE_URL}/`,
      publisher: { "@id": `${SITE_URL}/#school` },
    },
  ];
}
