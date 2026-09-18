import type { Lang } from './routes';

export type Bilingual = { en: string; es: string };

/** YAML fields are either a bilingual pair or a language-neutral proper noun. */
export function pick(value: string | Bilingual, lang: Lang): string {
  return typeof value === 'string' ? value : value[lang];
}

const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
};

/**
 * Agenda dates are ISO and may be day-less ('2027-09'). A multi-day run
 * ('2027-10-22' + '2027-10-24') prints as a range when it stays in one month.
 */
export function formatEventDate(date: string, endDate: string | undefined, lang: Lang) {
  const [y, m, d] = date.split('-');
  const month = MONTHS[lang][Number(m) - 1].toUpperCase();
  let day = d ? String(Number(d)).padStart(2, '0') : undefined;
  if (day && endDate) {
    const [, em, ed] = endDate.split('-');
    if (em === m && ed) day = `${day}–${String(Number(ed)).padStart(2, '0')}`;
  }
  return { day, month, year: y };
}

/**
 * Upcoming = the last day of the engagement is today or later. ISO prefixes
 * compare correctly as strings; a day-less month ('2027-09') is padded to its
 * last possible day so the whole month counts as upcoming until it is over.
 */
export function isUpcoming(date: string, endDate: string | undefined, today: string): boolean {
  let end = endDate ?? date;
  if (end.length === 7) end = `${end}-31`;
  return end >= today;
}
