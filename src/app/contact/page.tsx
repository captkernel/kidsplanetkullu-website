import type { Metadata } from "next";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { Constellation } from "@/components/Constellation";
import { InquiryForm } from "@/components/InquiryForm";
import { SCHOOL } from "@/lib/constants";
import { whatsappHref, telHref, mailHref } from "@/lib/links";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit or reach Kids Planet in Dhalpur, Kullu, Himachal Pradesh 175101. Call, email, or message on WhatsApp. Office hours Monday to Saturday.",
};

const CONTACTS = [
  {
    icon: MapPin,
    label: "Visit us",
    value: "Guru Behar, Dhalpur, Kullu, Himachal Pradesh 175101",
    href: SCHOOL.mapUrl,
    external: true,
  },
  {
    icon: Phone,
    label: "Call",
    value: SCHOOL.phoneDisplay,
    href: telHref,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Message the school office",
    href: whatsappHref("Hello, I would like to know more about Kids Planet."),
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: SCHOOL.email,
    href: mailHref,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title={
          <>
            Come and spend a{" "}
            <em className="italic text-primary">morning with us.</em>
          </>
        }
        intro="The best way to know Kids Planet is to walk the campus, meet a teacher, and watch an ordinary day unfold. Reach us however suits you, and we will help you plan a visit."
      />

      {/* Warm welcome + tie to place. Editorial split, one gold star accent. */}
      <Section tone="canvas">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <FadeIn className="relative order-last lg:order-first">
            <div className="overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/campus/building-exterior.jpg"
                alt="The Kids Planet campus in Dhalpur, Kullu"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
            <span aria-hidden className="absolute -left-3 -top-3 text-2xl text-gold">
              ✦
            </span>
          </FadeIn>

          <FadeIn delay={100}>
            <Eyebrow star>Find us at Dhalpur</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              At the heart of the valley.
            </h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-soft">
              <p>
                You will find us at Guru Behar in Dhalpur, on the same ground
                where the valley gathers for Kullu Dussehra each year. It is an
                easy place for families across Kullu town to reach.
              </p>
              <p>
                Call during office hours, send a WhatsApp message any time, or
                simply come by. A member of the office is always glad to show
                you around and answer whatever is on your mind.
              </p>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* Ways to reach us: four clear, real contact actions. */}
      <Section tone="surface" className="pt-6 md:pt-8">
        <div className="max-w-2xl">
          <Eyebrow>Ways to reach us</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            Whatever is easiest for you.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACTS.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeIn key={c.label} delay={i * 60}>
                <a
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-canvas p-6 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/8 text-primary">
                    <Icon strokeWidth={1.75} size={20} />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink-soft">
                    {c.label}
                  </h3>
                  <p className="mt-1.5 leading-snug text-ink group-hover:text-primary">
                    {c.value}
                  </p>
                </a>
              </FadeIn>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <FadeIn>
            <Card className="h-full p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/8 text-primary">
                <Clock strokeWidth={1.75} size={20} />
              </span>
              <h3 className="mt-4 font-display text-xl">Office hours</h3>
              <ul className="mt-3 space-y-1.5 text-ink-soft">
                <li>{SCHOOL.timings.weekday}</li>
                <li>{SCHOOL.timings.saturday}</li>
                <li>{SCHOOL.timings.sunday}</li>
              </ul>
              <dl className="mt-6 space-y-1 border-t border-line pt-4 text-sm text-ink-soft">
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink">Board:</dt>
                  <dd>{SCHOOL.board}</dd>
                </div>
              </dl>
            </Card>
          </FadeIn>

          <FadeIn delay={100} className="lg:col-span-2">
            <div className="h-full overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)]">
              <iframe
                src={SCHOOL.mapEmbedUrl}
                title="Kids Planet location on Google Maps"
                className="h-full min-h-[320px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </FadeIn>
        </div>
      </Section>

      <Constellation shape="lean-right" className="bg-surface pt-4" />

      {/* Inquiry form. */}
      <Section tone="canvas" id="enquire" className="pt-6 md:pt-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <FadeIn>
            <Eyebrow star>Send a message</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              Ask us anything.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Whether it is a question about a class, a visit time, or
              admissions, send it across and we will reply within one working
              day.
            </p>
          </FadeIn>
          <FadeIn delay={100}>
            <Card className="p-7 md:p-9">
              <InquiryForm />
            </Card>
          </FadeIn>
        </div>
      </Section>
    </>
  );
}
