// Types métier Asanblé

export type RoleName =
  | "Psychologue"
  | "Éducateur"
  | "Coach sportif"
  | "Animateur"
  | "Éducateur sportif"
  | "Éducateur sportif pleine nature"
  | "Artiste"
  | "Enseignant"
  | "Intervenant numérique";

export type TicketStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "refused"
  | "empty"
  | "partial"
  | "blocked"
  | "done"
  | "override"
  | "skipped";    // slot décoché à la création — trace conservée, inactif

export interface Project {
  id: string;
  name: string;
  description?: string;
  funder?: string;
  budget?: number;            // en euros
  startDate?: string;         // YYYY-MM-DD
  endDate?: string;           // YYYY-MM-DD
  centerIds: string[];
  workshopIds: string[];
  createdAt: string;
}

/**
 * Un slot de rôle requis sur un atelier.
 * `label` = libellé fonctionnel affiché au référent (ex. "Animateur").
 * `acceptedRoles` = rôles réels qui peuvent satisfaire ce slot
 *   (ex. ["Animateur extérieur", "Animateur jardin"]).
 *   Le calendrier et les disponibilités restent filtrés par `acceptedRoles`.
 */
export interface RoleSlot {
  label: string;
  acceptedRoles: RoleName[];
}

export interface Workshop {
  id: string;
  name: string;
  description?: string;
  requiredRoles: RoleSlot[];
  seancesCount?: number;
  durationMin?: number;
}

export interface Center {
  id: string;
  name: string;
  city: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
}

export interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "referent" | "provider" | "admin";
  centerId?: string;
  providerId?: string;
  createdAt: string;
}

export interface Provider {
  id: string;
  fullName: string;
  roles: RoleName[];
  city: string;
  phone?: string;
  email?: string;
}

export interface Session {
  id: string;
  workshopId: string;
  centerId: string;
  groupLabel: string; // "Groupe 1"
  referentName: string;
  notes?: string;
  room?: string;
  audience?: string;
}

export interface Seance {
  id: string;
  sessionId: string;
  index: number;       // 1, 2, 3
  start: string;       // ISO wall-clock GP "2025-05-14T14:00"
  durationMin: number;
}

export interface Ticket {
  id: string;
  seanceId: string;
  role: RoleName;
  providerId: string | null;
  status: TicketStatus;
  sentAt?: string;
  respondedAt?: string;
}

export interface Availability {
  providerId: string;
  // Récurrent: dow 1..7 (lun..dim), slots ["09:00-12:00", "14:00-17:00"]
  recurring: Array<{ dow: number; ranges: string[] }>;
  // Exceptions: dates bloquées (YYYY-MM-DD)
  blockedDates: string[];
}

export interface ProviderDocument {
  id: string;
  providerId: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  dataUrl: string;        // mock storage (base64)
  uploadedBy: string;     // userId of uploader
  uploadedByName: string;
  uploadedByRole: "admin" | "provider";
  uploadedAt: string;     // ISO
}
