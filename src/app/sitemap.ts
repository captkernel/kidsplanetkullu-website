import type { MetadataRoute } from "next";

// Required for `output: export` in Next 16. Paths use the trailing slash the site serves
// (trailingSlash: true), so sitemap URLs never hit a 301. No lastModified/priority: Google
// ignores priority/changefreq, and a lastmod that changes on every build is noise.
export const dynamic = "force-static";

const BASE = "https://kidsplanetkullu.com";
const PATHS = ["/", "/about/", "/programs/", "/admissions/", "/faculty/", "/contact/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({ url: `${BASE}${path}` }));
}
