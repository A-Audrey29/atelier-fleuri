// Format dates en français, fuseau Guadeloupe (GMT-4, pas de DST)
// On force les valeurs comme étant en heure locale Guadeloupe.

const JOURS_COURTS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const JOURS_LONGS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MOIS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];
const MOIS_LONGS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/**
 * Les dates côté mock sont stockées comme ISO en "wall-clock" Guadeloupe (sans Z).
 * On parse les composants directement, pas de conversion timezone.
 */
function parseGP(d: string | Date): { y: number; mo: number; d: number; h: number; mi: number; dow: number } {
  if (d instanceof Date) {
    return { y: d.getFullYear(), mo: d.getMonth(), d: d.getDate(), h: d.getHours(), mi: d.getMinutes(), dow: d.getDay() };
  }
  // ISO sans Z : "2025-05-14T14:00"
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return { y: 0, mo: 0, d: 0, h: 0, mi: 0, dow: 0 };
  const y = +m[1], mo = +m[2] - 1, day = +m[3], h = +(m[4] ?? 0), mi = +(m[5] ?? 0);
  // Calcul jour de semaine via Date (UTC pour stabilité)
  const dow = new Date(Date.UTC(y, mo, day)).getUTCDay();
  return { y, mo, d: day, h, mi, dow };
}

export function fmtSeance(d: string | Date): string {
  const p = parseGP(d);
  const h = `${p.h}h${p.mi.toString().padStart(2, "0")}`;
  return `${JOURS_COURTS[p.dow]} ${p.d} ${MOIS[p.mo]} · ${h}`;
}

export function fmtDayLong(d: string | Date): string {
  const p = parseGP(d);
  return `${JOURS_LONGS[p.dow]} ${p.d} ${MOIS_LONGS[p.mo]} ${p.y}`;
}

export function fmtDayShort(d: string | Date): string {
  const p = parseGP(d);
  return `${JOURS_COURTS[p.dow]} ${p.d} ${MOIS[p.mo]}`;
}

export function fmtTime(d: string | Date): string {
  const p = parseGP(d);
  return `${p.h}h${p.mi.toString().padStart(2, "0")}`;
}

export function fmtTimeRange(start: string | Date, durationMin: number): string {
  const p = parseGP(start);
  const totalMin = p.h * 60 + p.mi + durationMin;
  const eh = Math.floor(totalMin / 60), em = totalMin % 60;
  return `${p.h}h${p.mi.toString().padStart(2, "0")} – ${eh}h${em.toString().padStart(2, "0")}`;
}

export function fmtMoney(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getDow(d: string | Date) {
  return parseGP(d).dow;
}

export function getDate(d: string | Date) {
  return parseGP(d);
}

/** Add days to an ISO wall-clock date, returns new ISO date (YYYY-MM-DD or with time preserved) */
export function addDaysISO(iso: string, days: number): string {
  const p = parseGP(iso);
  const d = new Date(Date.UTC(p.y, p.mo, p.d + days));
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const timePart = iso.includes("T") ? iso.slice(iso.indexOf("T")) : "";
  return `${y}-${mo}-${day}${timePart}`;
}

/** Lundi de la semaine d'une date (renvoie ISO YYYY-MM-DD) */
export function startOfWeekISO(iso: string): string {
  const p = parseGP(iso);
  // dow: 0=dim, 1=lun ... on veut lundi = 1
  const offset = p.dow === 0 ? -6 : 1 - p.dow;
  return addDaysISO(iso.slice(0, 10), offset);
}
