// Kids Planet copy hard-rule: ZERO em-dashes in rendered text.
// Some reused JSON content (testimonials, announcements) carries em/en dashes
// from their original sources. Sanitize on display so quoted copy still reads
// naturally without the #1 AI tell leaking through.
export function clean(text: string): string {
  return text
    .replace(/\s*[—–]\s*/g, ", ") // em/en dash -> comma pause
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}
