/* Kids Planet School: teachers on the sharing pages (/marketing/).
   ONE place to change a teacher's name, role, subjects or qualifications on her cards.

   name     the full name printed on her cards. Change it here and every card is redrawn with it.
   onCards  the name already printed in the ready-made pictures in img/<slug>/. Leave it alone.
            When name and onCards differ, the page draws the cards itself with the new name.
   first    how the page greets her ("Hello, <first> Ma'am").
   short    her short link: kidsplanetkullu.com/t/<short>/wa (WhatsApp), /fb, /ig. Lowercase letters only, one per person.
            Never change it once she has shared it: old posts point to it. After adding or changing one,
            run node scripts/short-links.mjs to make the short-link pages.

   Source: Kids Planet portal (staff_profiles), exported in src/data/faculty.generated.json.
   Five teachers were recorded there by first name only. Madhavi Singh confirmed by the school (24 Nov 2026);
   still first name only: Anju, Poonam, Ravina, Santosh —
   add their surnames to `name` below once the school confirms them. */
window.KP_PEOPLE = {
  "alpana-gautam":         { short: "alpana",   name: "Alpana Gautam",         onCards: "Alpana Gautam",         first: "Alpana",  role: "Teacher",        subjects: "English · Games · Hindi · History/Civics/Geography", qual: "B.A., B.Ed, PdPet, DIT, TET" },
  "anju":                  { short: "anju",     name: "Anju",                  onCards: "Anju",                  first: "Anju",    role: "Teacher",        subjects: "G.K. · Hindi · Moral Science", qual: "" },
  "broniya-jambal-sharma": { short: "broniya",  name: "Broniya Jambal Sharma", onCards: "Broniya Jambal Sharma", first: "Broniya", role: "Teacher",        subjects: "Moral Science", qual: "MA, B.Ed, PdPet, TET, NTT" },
  "divya-thakur":          { short: "divya",    name: "Divya Thakur",          onCards: "Divya Thakur",          first: "Divya",   role: "Vice Principal", subjects: "English · Maths · Spoken English", qual: "BBA, D.El.Ed" },
  "kanika-sharma":         { short: "kanika",   name: "Kanika Sharma",         onCards: "Kanika Sharma",         first: "Kanika",  role: "Teacher",        subjects: "Maths · Science", qual: "" },
  "madhavi":               { short: "madhavi",  name: "Madhavi Singh",         onCards: "Madhavi Singh",         first: "Madhavi",role: "Teacher",        subjects: "Spoken English", qual: "" },
  "meenu-bala":            { short: "meenu",    name: "Meenu Bala",            onCards: "Meenu Bala",            first: "Meenu",   role: "Teacher",        subjects: "EVS · English · G.K. · Hindi · Maths", qual: "" },
  "poonam":                { short: "poonam",   name: "Poonam",                onCards: "Poonam",                first: "Poonam",  role: "Teacher",        subjects: "Games · Him Lok Sanskriti · Hindi", qual: "" },
  "pragya-sharma":         { short: "pragya",   name: "Pragya Sharma",         onCards: "Pragya Sharma",         first: "Pragya",  role: "Teacher",        subjects: "Computer · G.K. · Moral Science", qual: "MBA, PGDCA" },
  "ravina":                { short: "ravina",   name: "Ravina",                onCards: "Ravina",                first: "Ravina",  role: "Teacher",        subjects: "EVS · G.K. · Games · Hindi", qual: "" },
  "santosh":               { short: "santosh",  name: "Santosh",               onCards: "Santosh",               first: "Santosh", role: "Teacher",        subjects: "English · Games · Maths", qual: "" },
  "vipasha-bhardwaj":      { short: "vipasha",  name: "Vipasha Bhardwaj",      onCards: "Vipasha Bhardwaj",      first: "Vipasha", role: "Teacher",        subjects: "", qual: "" },
  "yamika-chaudhary":      { short: "yamika",   name: "Yamika Chaudhary",      onCards: "Yamika Chaudhary",      first: "Yamika",  role: "Teacher",        subjects: "EVS · English · G.K. · Maths", qual: "MA (English), B.Ed, Pd.Pet, CCA, TET" },
  /* School staff who share the school-wide pictures (not teachers: no personal cards). */
  "karan":                 { short: "karan",    name: "Karan Parmar",          onCards: "Karan Parmar",          first: "Karan",   role: "", subjects: "", qual: "", staff: true },
  "social-media":          { short: "school",   name: "Social media",          onCards: "Social media",          first: "",        role: "", subjects: "", qual: "", staff: true }
};
