import type {
  Workshop, Center, Provider, Session, Seance, Ticket, Availability, RoleName,
} from "./types";

export const workshops: Workshop[] = [
  { id: "w1", name: "Gestion des émotions", requiredRoles: ["Psychologue", "Éducateur", "Coach sportif"], seancesCount: 4, durationMin: 120 },
  { id: "w2", name: "Communication parents-enfants", requiredRoles: ["Animateur"], seancesCount: 2, durationMin: 120 },
  { id: "w3", name: "Soutien émotionnel scolaire", requiredRoles: ["Animateur", "Psychologue"], seancesCount: 3, durationMin: 90 },
  { id: "w4", name: "Pratique d'activité physique", requiredRoles: ["Éducateur sportif pleine nature"], seancesCount: 6, durationMin: 90 },
  { id: "w5", name: "Découverte Sport/Étude", requiredRoles: ["Animateur", "Éducateur sportif"], seancesCount: 2, durationMin: 90 },
  { id: "w6", name: "Parole des aînés", requiredRoles: ["Animateur", "Éducateur"], seancesCount: 4, durationMin: 90 },
];

export const centers: Center[] = [
  { id: "c1", name: "Centre social des Abymes", city: "Abymes", address: "12 rue Schœlcher, 97139 Les Abymes", contactName: "Mathilde Marival", contactPhone: "0690 12 34 56", contactEmail: "contact@cs-abymes.gp" },
  { id: "c2", name: "Centre social de Baie-Mahault", city: "Baie-Mahault", address: "5 av. de la Libération, 97122 Baie-Mahault", contactName: "Karine Lubin", contactPhone: "0690 22 11 88", contactEmail: "contact@cs-bm.gp" },
  { id: "c3", name: "Centre social de Pointe-à-Pitre", city: "Pointe-à-Pitre", address: "8 rue Frébault, 97110 Pointe-à-Pitre", contactName: "Stéphane Maillot", contactPhone: "0690 33 44 12", contactEmail: "contact@cs-pap.gp" },
  { id: "c4", name: "Centre social de Sainte-Anne", city: "Sainte-Anne", address: "Place de la Mairie, 97180 Sainte-Anne", contactName: "Lydia Bernus", contactPhone: "0690 55 66 21", contactEmail: "contact@cs-stanne.gp" },
  { id: "c5", name: "Centre social du Gosier", city: "Le Gosier", address: "Bd Amédée Clara, 97190 Le Gosier", contactName: "Yann Pétro", contactPhone: "0690 77 88 33", contactEmail: "contact@cs-gosier.gp" },
  { id: "c6", name: "Centre social de Capesterre", city: "Capesterre-Belle-Eau", address: "1 rue de la Cascade, 97130 Capesterre-Belle-Eau", contactName: "Nathalie Sully", contactPhone: "0690 99 12 45", contactEmail: "contact@cs-capesterre.gp" },
];

export const providers: Provider[] = [
  { id: "p1", fullName: "Marie-Laure Cadet", roles: ["Psychologue"], city: "Pointe-à-Pitre", phone: "0690 10 20 30" },
  { id: "p2", fullName: "Jean Bélizaire", roles: ["Animateur"], city: "Abymes", phone: "0690 21 32 43" },
  { id: "p3", fullName: "Sandra Nérée", roles: ["Éducateur", "Éducateur sportif"], city: "Le Gosier", phone: "0690 32 43 54" },
  { id: "p4", fullName: "Frédéric Larifla", roles: ["Animateur", "Éducateur"], city: "Baie-Mahault", phone: "0690 43 54 65" },
  { id: "p5", fullName: "Isabelle Zou", roles: ["Psychologue"], city: "Sainte-Anne", phone: "0690 54 65 76" },
  { id: "p6", fullName: "Patrick Ramdine", roles: ["Coach sportif"], city: "Capesterre-Belle-Eau", phone: "0690 65 76 87" },
  { id: "p7", fullName: "Nadège Valère", roles: ["Artiste"], city: "Pointe-à-Pitre", phone: "0690 76 87 98" },
  { id: "p8", fullName: "Olivier Jalton", roles: ["Enseignant"], city: "Abymes", phone: "0690 87 98 09" },
  { id: "p9", fullName: "Aline Saint-Ruf", roles: ["Intervenant numérique"], city: "Baie-Mahault", phone: "0690 98 09 10" },
  { id: "p10", fullName: "Hugo Taillefer", roles: ["Éducateur sportif pleine nature"], city: "Le Gosier", phone: "0690 09 10 21" },
];

// Sessions : 1 par centre × atelier sélectionné
export const sessions: Session[] = [
  {
    id: "s1", workshopId: "w1", centerId: "c1", groupLabel: "Groupe 1",
    referentName: "Mathilde Marival",
    notes: "Public adolescents 13-16 ans, 8 participants. Salle calme requise.",
    room: "Salle Mahogany — 1er étage",
    audience: "8 adolescents 13-16 ans",
  },
  {
    id: "s2", workshopId: "w3", centerId: "c2", groupLabel: "Groupe Collège",
    referentName: "Karine Lubin",
    notes: "Travail avec collégiens en décrochage. Prévoir matériel d'écriture.",
    room: "Salle Polyvalente",
    audience: "12 collégiens 11-14 ans",
  },
  {
    id: "s3", workshopId: "w5", centerId: "c5", groupLabel: "Groupe 2",
    referentName: "Yann Pétro",
    notes: "Lien sport-scolarité. Prévoir baskets pour les exercices.",
    room: "Cour + salle Caraïbes",
    audience: "10 enfants 9-12 ans",
  },
  {
    id: "s4", workshopId: "w2", centerId: "c4", groupLabel: "Groupe Parents",
    referentName: "Lydia Bernus",
    notes: "Cycle court 4 séances, parents en difficulté éducative.",
    room: "Salle des Familles",
    audience: "6 familles",
  },
];

// Séances — dates en heure locale Guadeloupe (sans Z), futures
const today = new Date();
const yyyy = today.getFullYear();
const mo = today.getMonth();
function nextDate(daysAhead: number, hour: number) {
  const d = new Date(yyyy, mo, today.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}T${String(hour).padStart(2, "0")}:00`;
}

export const seances: Seance[] = [
  // Session s1 — Gestion des émotions, Abymes — 4 séances
  { id: "se1", sessionId: "s1", index: 1, start: nextDate(-14, 14), durationMin: 120 },
  { id: "se2", sessionId: "s1", index: 2, start: nextDate(-7, 14), durationMin: 120 },
  { id: "se3", sessionId: "s1", index: 3, start: nextDate(2, 14), durationMin: 120 },
  { id: "se4", sessionId: "s1", index: 4, start: nextDate(9, 14), durationMin: 120 },
  // Session s2 — Soutien émotionnel scolaire, Baie-Mahault — 3 séances
  { id: "se5", sessionId: "s2", index: 1, start: nextDate(1, 10), durationMin: 90 },
  { id: "se6", sessionId: "s2", index: 2, start: nextDate(8, 10), durationMin: 90 },
  { id: "se7", sessionId: "s2", index: 3, start: nextDate(15, 10), durationMin: 90 },
  // Session s3 — Découverte Sport/Étude, Le Gosier — 2 séances
  { id: "se8", sessionId: "s3", index: 1, start: nextDate(3, 16), durationMin: 90 },
  { id: "se9", sessionId: "s3", index: 2, start: nextDate(10, 16), durationMin: 90 },
  // Session s4 — Communication parents-enfants — 2 séances
  { id: "se10", sessionId: "s4", index: 1, start: nextDate(4, 9), durationMin: 120 },
  { id: "se11", sessionId: "s4", index: 2, start: nextDate(11, 9), durationMin: 120 },
];

export const tickets: Ticket[] = [
  // s1 séance 1 (passée) — toutes confirmées (done)
  { id: "t1", seanceId: "se1", role: "Psychologue", providerId: "p1", status: "done" },
  { id: "t2", seanceId: "se1", role: "Éducateur", providerId: "p3", status: "done" },
  { id: "t3", seanceId: "se1", role: "Coach sportif", providerId: "p6", status: "done" },
  // s1 séance 2 (passée)
  { id: "t4", seanceId: "se2", role: "Psychologue", providerId: "p1", status: "done" },
  { id: "t5", seanceId: "se2", role: "Éducateur", providerId: "p3", status: "done" },
  { id: "t6", seanceId: "se2", role: "Coach sportif", providerId: "p6", status: "done" },
  // s1 séance 3 (à venir, partielle)
  { id: "t7", seanceId: "se3", role: "Psychologue", providerId: "p1", status: "confirmed" },
  { id: "t8", seanceId: "se3", role: "Éducateur", providerId: "p3", status: "pending", sentAt: nextDate(-1, 9) },
  { id: "t9", seanceId: "se3", role: "Coach sportif", providerId: null, status: "empty" },
  // s1 séance 4 (vide)
  { id: "t10", seanceId: "se4", role: "Psychologue", providerId: "p1", status: "pending", sentAt: nextDate(-1, 10) },
  { id: "t11", seanceId: "se4", role: "Éducateur", providerId: null, status: "empty" },
  { id: "t12", seanceId: "se4", role: "Coach sportif", providerId: "p6", status: "refused", respondedAt: nextDate(-1, 14) },
  // s2 toutes les séances
  { id: "t13", seanceId: "se5", role: "Animateur", providerId: "p2", status: "confirmed" },
  { id: "t14", seanceId: "se5", role: "Psychologue", providerId: "p5", status: "confirmed" },
  { id: "t15", seanceId: "se6", role: "Animateur", providerId: "p2", status: "confirmed" },
  { id: "t16", seanceId: "se6", role: "Psychologue", providerId: "p5", status: "pending" },
  { id: "t17", seanceId: "se7", role: "Animateur", providerId: "p2", status: "pending" },
  { id: "t18", seanceId: "se7", role: "Psychologue", providerId: null, status: "empty" },
  // s3
  { id: "t19", seanceId: "se8", role: "Animateur", providerId: "p4", status: "confirmed" },
  { id: "t20", seanceId: "se8", role: "Éducateur sportif", providerId: "p3", status: "confirmed" },
  { id: "t21", seanceId: "se9", role: "Animateur", providerId: "p4", status: "pending" },
  { id: "t22", seanceId: "se9", role: "Éducateur sportif", providerId: "p3", status: "confirmed" },
  // s4
  { id: "t23", seanceId: "se10", role: "Animateur", providerId: "p2", status: "confirmed" },
  { id: "t24", seanceId: "se11", role: "Animateur", providerId: "p2", status: "pending" },
];

// Disponibilités prestataires (récurrent simple : lun-ven 9h-18h)
export const availabilities: Availability[] = providers.map((p) => ({
  providerId: p.id,
  recurring: [1, 2, 3, 4, 5].map((dow) => ({ dow, ranges: ["09:00-12:00", "14:00-18:00"] })),
  blockedDates: [],
}));

// --- Helpers ---

export function getWorkshop(id: string) { return workshops.find((w) => w.id === id)!; }
export function getCenter(id: string) { return centers.find((c) => c.id === id)!; }
export function getProvider(id: string | null | undefined) {
  return id ? providers.find((p) => p.id === id) ?? null : null;
}
export function getSession(id: string) { return sessions.find((s) => s.id === id)!; }
export function getSeance(id: string) { return seances.find((se) => se.id === id)!; }
export function ticketsForSeance(seanceId: string) {
  return tickets.filter((t) => t.seanceId === seanceId);
}
export function seancesForSession(sessionId: string) {
  return seances.filter((se) => se.sessionId === sessionId).sort((a, b) => a.index - b.index);
}
export function bookingsForProvider(providerId: string) {
  return tickets
    .filter((t) => t.providerId === providerId && (t.status === "confirmed" || t.status === "done" || t.status === "pending"))
    .map((t) => {
      const se = getSeance(t.seanceId);
      const sess = getSession(se.sessionId);
      const center = getCenter(sess.centerId);
      const workshop = getWorkshop(sess.workshopId);
      return { ticket: t, seance: se, session: sess, center, workshop };
    });
}

/** Statut global d'une séance dérivé de ses tickets */
export function seanceStatus(seanceId: string): "done" | "confirmed" | "partial" | "pending" | "empty" | "blocked" {
  const ts = ticketsForSeance(seanceId);
  if (ts.length === 0) return "empty";
  if (ts.every((t) => t.status === "done")) return "done";
  if (ts.every((t) => t.status === "confirmed" || t.status === "done")) return "confirmed";
  if (ts.some((t) => t.status === "refused") && ts.some((t) => t.status === "empty")) return "blocked";
  if (ts.some((t) => t.status === "confirmed" || t.status === "done")) return "partial";
  if (ts.some((t) => t.status === "pending")) return "pending";
  return "empty";
}

/** Suggestions de prestataires pour un rôle (top 2 du bon rôle) */
export function suggestionsForRole(role: RoleName, excludeIds: string[] = []) {
  return providers.filter((p) => p.roles.includes(role) && !excludeIds.includes(p.id)).slice(0, 2);
}

/** Couleur stable par session (pour calendrier prestataire) */
const SESSION_COLORS = [
  { bg: "#fde7d4", border: "#f0a86e", ink: "#7a3a14" }, // corail
  { bg: "#dceef5", border: "#7ab4cc", ink: "#1f4a5e" }, // bleu lagon
  { bg: "#e6e9d4", border: "#a8b074", ink: "#4d5325" }, // vert kaki
  { bg: "#f0d4e6", border: "#cc7ab4", ink: "#5e1f4a" }, // rose
  { bg: "#d4e6f0", border: "#7aa8cc", ink: "#1f3e5e" },
  { bg: "#f5e7d4", border: "#cca87a", ink: "#5e3e1f" },
];
export function colorForSession(sessionId: string) {
  const idx = parseInt(sessionId.replace(/\D/g, ""), 10) % SESSION_COLORS.length;
  return SESSION_COLORS[idx];
}
