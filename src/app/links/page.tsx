import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { SCHOOL } from "@/lib/constants";
import { LinkHub } from "@/components/LinkHub";

// Link-in-bio page for Instagram and Facebook: kidsplanetkullu.com/links/
// Shown without the site header, footer and bottom bar (see [data-bare-page] in globals.css).
// Kept out of search results and the sitemap: it repeats links, it is not a page of its own.
export const metadata: Metadata = {
  ...pageMetadata({
    path: "/links/",
    title: `Kids Planet School, Kullu: admissions ${SCHOOL.admissionsYear}`,
    description:
      "Admissions, the online application, a school visit, WhatsApp and the parent profile for Kids Planet School, Dhalpur, Kullu.",
  }),
  title: { absolute: "Kids Planet School, Kullu: admissions and links" },
  robots: { index: false, follow: true },
};

export default function LinksPage() {
  return <LinkHub />;
}
