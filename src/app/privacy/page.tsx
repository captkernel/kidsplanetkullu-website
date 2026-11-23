import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { SCHOOL } from "@/lib/constants";
import { mailHref, telHref } from "@/lib/links";

export const metadata: Metadata = pageMetadata({
  path: "/privacy/",
  title: "How we look after your details",
  description:
    "What Kids Planet School, Kullu collects when you enquire or apply online, why, who sees it, how long it is kept, and how to have it corrected or deleted.",
});

const ROWS: [string, string][] = [
  [
    "What we ask for",
    "Your child's name, date of birth and class sought. Your name and mobile number. If you continue the application: parents' names, mobile numbers and occupations, your address, the last school attended, anything about your child's health you choose to tell us, and photos of the documents you choose to add.",
  ],
  [
    "What we do not ask for online",
    "Aadhaar numbers, bank details or payment. We never ask for a fee on this website.",
  ],
  [
    "Why we ask",
    "Only to process your enquiry or admission application, to call you about it, and to prepare your child's school record if they join.",
  ],
  [
    "Who sees it",
    "The school office and the Principal. We do not sell or share your details, and we do not use them for advertising.",
  ],
  [
    "Where it is kept",
    "Your form travels over an encrypted connection to a private store run for the school, where documents have no public link. The office then moves it into the school's own records and removes the documents from the online store.",
  ],
  [
    "How long we keep it",
    "A form you start but do not send is deleted after 30 days. If your child does not join, the application and its documents are deleted within 90 days of being closed. If your child joins, the details become part of the school record.",
  ],
  [
    "Parent profiles",
    "You can open a profile with or without applying. We keep your name, mobile number and email so you can sign in, and, if you tell us, the first name, date of birth and class of a child you are considering. Until your mobile number is confirmed (by an application reference, a message from that number, or the office), a profile shows only updates meant for all parents. A profile with no application and no child at the school is deleted one year after your last visit. Your password is stored in a scrambled form that even the school cannot read, and we check it against lists of passwords known to have leaked elsewhere, without the password ever leaving our system. If you forget it, the office can give you a temporary one.",
  ],
  [
    "Parents of children at the school",
    "If your child is at Kids Planet, the office may create a profile for you with your name, your mobile number, and your child's first name and class, so that you can read updates meant for your child's class or for your family. Nothing else from the school record is placed online. Ask the office and the profile will be removed.",
  ],
  [
    "Keeping the forms safe",
    "A Cloudflare check helps confirm that a person, not an automated program, is sending each form. We keep a record of enquiries, forms started, and every sign-in attempt on a profile (time, type of phone or browser, and the mobile number typed), so the office can help a parent who got stuck and can spot misuse. You can see the recent activity on your own profile. This record is kept for one year.",
  ],
  [
    "Messages from us",
    "We may send an acknowledgement, updates on your application, or a one-time code to your mobile number on WhatsApp, or to your email if you gave one. We do not send advertising.",
  ],
  [
    "Your choices",
    "You can ask to see, correct or delete what you have given, or withdraw your consent, at any time. Call or write to the office and we will do it within seven working days.",
  ],
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="How we look after your details."
        intro="When you enquire or apply online you are trusting us with information about your child. This is exactly what we do with it."
      />
      <Section tone="canvas" className="!py-12 md:!py-16">
        <dl className="max-w-3xl divide-y divide-line">
          {ROWS.map(([k, v]) => (
            <div key={k} className="grid gap-2 py-6 md:grid-cols-[14rem_1fr] md:gap-8">
              <dt className="font-display text-xl text-primary">{k}</dt>
              <dd className="leading-relaxed text-ink-soft">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 max-w-3xl leading-relaxed text-ink">
          Questions, corrections or a request to delete: call{" "}
          <a href={telHref} className="font-semibold text-primary">{SCHOOL.phoneDisplay}</a>{" "}
          or write to{" "}
          <a href={mailHref} className="font-semibold text-primary">{SCHOOL.email}</a>.
          Only a parent or guardian should fill in the forms on this website.
        </p>
        <p className="mt-4 text-sm text-ink-soft">{SCHOOL.address}</p>
      </Section>
    </>
  );
}
