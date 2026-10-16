export const SCHOOL = {
  name: "Kids Planet",
  motto: "Explore & Excel",
  tagline: "Explore & Excel · Since 2010",
  description:
    "Established in 2010 by Mrs. Neeta Parmar, Kids Planet is a Pre-Nursery to Class 8 English medium school in the heart of the Kullu Valley. 185 children, 14 teachers, small classes, and real personal attention for every family. Admissions open for 2027-28.",
  founded: 2010,
  // Single source of truth for admissions messaging across the site.
  admissionsYear: "2027-28",
  admissionsSession: "2027 to 2028",
  founder: "Mrs. Neeta Parmar",
  founderTitle: "Founder",
  // LEGACY DRAFT — every word subject to Karan's approval before deploy.
  founderBio:
    "Kids Planet was founded in 2010 by Mrs. Neeta Parmar, whose decades of teaching shaped a simple belief: every child in the valley deserves patient teaching and a high standard, side by side. Alongside Mr. Ranjeet Parmar, she grew a small playgroup into a Pre-Nursery to Class 8 school trusted by hundreds of Kullu families. We remember them with love. Their vision is carried forward today by the founding family's next generation.",
  address: "Kids Planet School, Gurubehar, Dhalpur, Kullu 175101",
  phone: "+919418023454",
  phoneDisplay: "+91 94180 23454",
  email: "kidsplanetkullu@gmail.com",
  whatsapp: "919418023454",
  board: "HP State Board (HPBOSE)",
  classes: "Pre-Nursery – Class 8",
  ageRange: "Ages 2–14",
  timings: {
    weekday: "Mon to Fri: 9:00 AM to 3:00 PM",
    saturday: "Saturday: 9:00 AM to 1:00 PM",
    sunday: "Sunday: Closed",
  },
  social: {
    facebook: "https://www.facebook.com/kidsplanet2010/",
    instagram: "https://www.instagram.com/kidsplanet_kullu/",
  },
  justdial:
    "https://www.justdial.com/Kullu/Kids-Planet-Above-Circuit-House-Miyanbehar-Dhalpur/9999P1902-1902-221104022902-R7X7_BZDET",
  justdialRating: "4.4",
  mapUrl: "https://maps.app.goo.gl/wPPZwpFfuFCcPHuB9",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3377.5!2d77.1072594!3d31.9536218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390479a3c0f6e0c7%3A0x7e3e98bda7e7b1a4!2sKids%20Planet!5e0!3m2!1sen!2sin!4v1711280000000",
  // Live numbers from the school database (updated 2026-09-16: 14 active
  // teachers in staff_profiles, ~187 students -> about 13 per teacher).
  stats: [
    { value: "16", label: "Years in Kullu" },
    { value: "14", label: "Teachers" },
    { value: "13:1", label: "Students per Teacher" },
  ],
} as const;

// Journey-first navigation: prospective parents (Learning→Admissions),
// current parents (News), everyone (Contact). URLs unchanged for SEO.
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Learning" },
  { href: "/daily-life", label: "School Life" },
  { href: "/admissions", label: "Admissions" },
  { href: "/announcements", label: "News" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/programs", label: "Programs" },
  { href: "/faculty", label: "Our Faculty" },
  { href: "/daily-life", label: "School Life" },
  { href: "/admissions", label: "Admissions" },
  { href: "/achievements", label: "Achievements" },
  { href: "/gallery", label: "Gallery" },
  { href: "/announcements", label: "Announcements" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy & Child Safety" },
  { href: "/child-safety", label: "Child Safety & POSH" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/PlanetStudio", label: "Planet Studio" },
] as const;
