import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { ParentPortal } from "@/components/admissions/ParentPortal";

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/parent/",
    title: "Parent profile",
    description:
      "Sign in to your Kids Planet School parent profile to follow your child's admission, add documents and keep your contact details up to date.",
  }),
  robots: { index: false },
};

export default function ParentPage() {
  return (
    <>
      <PageHero
        eyebrow="For parents"
        title="Your parent profile."
        intro="Read updates from the school about your child and class, follow an admission, add documents, and keep your phone number and email up to date. Sign in with your mobile number or email."
      />
      <Section tone="canvas" className="!py-12 md:!py-16">
        <ParentPortal />
      </Section>
    </>
  );
}
