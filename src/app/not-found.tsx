import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MisspeltRedirect } from "@/components/MisspeltRedirect";

// GitHub Pages serves this for any address that does not exist. Common misspellings
// (from shared or printed links, e.g. /admsslons) are sent on to the right page.
export default function NotFound() {
  return (
    <section className="bg-surface py-20 md:py-28">
      <Container>
        <MisspeltRedirect />
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Page not found</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">That page is not here.</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          The link may have a typing mistake. These are the pages most parents look for:
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/admissions/" className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 font-semibold text-canvas">
            Admissions 2027-28
          </Link>
          <Link href="/programs/" className="inline-flex items-center justify-center rounded-full border border-primary/40 px-7 py-3.5 font-semibold text-primary">
            Classes
          </Link>
          <Link href="/contact/" className="inline-flex items-center justify-center rounded-full border border-primary/40 px-7 py-3.5 font-semibold text-primary">
            Contact the school
          </Link>
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-primary/40 px-7 py-3.5 font-semibold text-primary">
            Home
          </Link>
        </div>
      </Container>
    </section>
  );
}
