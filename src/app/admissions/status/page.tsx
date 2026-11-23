import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { StatusLookup } from "@/components/admissions/StatusLookup";

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/admissions/status/",
    title: "Check your application",
    description:
      "Check the progress of your admission application to Kids Planet School, Kullu, with your reference and mobile number.",
  }),
  robots: { index: false },
};

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Admissions"
        title="Check your application."
        intro="Enter the reference we gave you when you applied, and the mobile number you used."
      />
      <Section tone="canvas" className="!py-12 md:!py-16">
        <Card className="max-w-3xl p-6 md:p-9">
          <StatusLookup />
        </Card>
      </Section>
    </>
  );
}
