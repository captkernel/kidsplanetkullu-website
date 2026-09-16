import { SCHOOL } from "./constants";

// Prospective-parent journey. Kept lean for a one-line nav <= 80px tall.
export const PRIMARY_NAV = [
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/faculty", label: "Faculty" },
  { href: "/contact", label: "Contact" },
] as const;

export const whatsappHref = (message?: string) =>
  `https://wa.me/${SCHOOL.whatsapp}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

export const telHref = `tel:${SCHOOL.phone}`;
export const mailHref = `mailto:${SCHOOL.email}`;
