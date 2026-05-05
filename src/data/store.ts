// Stores réactifs simples (mock client-side)
import { useSyncExternalStore } from "react";
import type { Workshop, Center, UserAccount, RoleName, Project, ProviderDocument } from "./types";
import { workshops as seedWorkshops, centers as seedCenters } from "./seed";

export const DEFAULT_ROLE_COLORS: Record<RoleName, string> = {
  "Psychologue":                     "#1f3a5f",
  "Éducateur":                       "#2f5d3a",
  "Coach sportif":                   "#a64b1f",
  "Animateur":                       "#b78a2a",
  "Éducateur sportif":               "#7a1f3a",
  "Éducateur sportif pleine nature": "#5d6b1f",
  "Artiste":                         "#5a2a6e",
  "Enseignant":                      "#3a4a55",
  "Intervenant numérique":           "#c4632f",
};

type Listener = () => void;

function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set: (next: T) => {
      state = next;
      listeners.forEach((l) => l());
    },
    update: (fn: (s: T) => T) => {
      state = fn(state);
      listeners.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export const workshopsStore = createStore<Workshop[]>([...seedWorkshops]);
export const centersStore = createStore<Center[]>([...seedCenters]);

const initialProjects: Project[] = [
  {
    id: "pr1", name: "REAAP 2025",
    description: "Réseau Écoute Appui Accompagnement Parents",
    funder: "CAF Guadeloupe", budget: 48000,
    startDate: "2025-01-01", endDate: "2025-12-31",
    centerIds: ["c1", "c2", "c3", "c4", "c5", "c6"],
    workshopIds: ["w1", "w2", "w3", "w6"],
    createdAt: "2024-12-01",
  },
  {
    id: "pr2", name: "Sport-Santé Jeunesse 2025",
    description: "Promotion de l'activité physique chez les 11-18 ans",
    funder: "ARS Guadeloupe", budget: 22000,
    startDate: "2025-03-01", endDate: "2025-09-30",
    centerIds: ["c1", "c3", "c5"],
    workshopIds: ["w4", "w5"],
    createdAt: "2025-01-20",
  },
];
export const projectsStore = createStore<Project[]>(initialProjects);

// Comptes utilisateur démo
const initialAccounts: UserAccount[] = [
  { id: "u1", firstName: "Mathilde", lastName: "Marival", email: "mathilde@cs-abymes.gp", role: "referent", centerId: "c1", createdAt: "2025-01-12" },
  { id: "u2", firstName: "Karine", lastName: "Lubin", email: "karine@cs-bm.gp", role: "referent", centerId: "c2", createdAt: "2025-01-15" },
  { id: "u3", firstName: "Stéphane", lastName: "Maillot", email: "stephane@cs-pap.gp", role: "referent", centerId: "c3", createdAt: "2025-02-02" },
  { id: "u4", firstName: "Marie-Laure", lastName: "Cadet", email: "ml.cadet@asanble.gp", role: "provider", providerId: "p1", createdAt: "2024-11-08" },
  { id: "u5", firstName: "Jean", lastName: "Bélizaire", email: "j.belizaire@asanble.gp", role: "provider", providerId: "p2", createdAt: "2024-11-10" },
  { id: "u6", firstName: "Sandra", lastName: "Nérée", email: "s.neree@asanble.gp", role: "provider", providerId: "p3", createdAt: "2024-12-01" },
  { id: "u7", firstName: "Équipe", lastName: "Asanblé", email: "admin@asanble.gp", role: "admin", createdAt: "2024-10-01" },
];
export const accountsStore = createStore<UserAccount[]>(initialAccounts);
export const roleColorsStore = createStore<Record<RoleName, string>>({ ...DEFAULT_ROLE_COLORS });

export const providerDocumentsStore = createStore<ProviderDocument[]>([
  {
    id: "doc1", providerId: "p1", name: "Diplôme État Psychologue.pdf",
    sizeBytes: 184320, mimeType: "application/pdf",
    dataUrl: "", uploadedBy: "u7", uploadedByName: "Équipe Asanblé",
    uploadedByRole: "admin", uploadedAt: "2025-02-12T10:00:00",
  },
  {
    id: "doc2", providerId: "p1", name: "RIB.pdf",
    sizeBytes: 56320, mimeType: "application/pdf",
    dataUrl: "", uploadedBy: "u4", uploadedByName: "Marie-Laure Cadet",
    uploadedByRole: "provider", uploadedAt: "2025-03-04T14:22:00",
  },
]);

// Compte "courant" (mock, change selon l'espace utilisé)
export const currentUserStore = createStore<UserAccount>(initialAccounts[0]);

export function useStore<T>(store: ReturnType<typeof createStore<T>>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function setCurrentUserByRole(role: "referent" | "provider" | "admin") {
  const accounts = accountsStore.get();
  const u = accounts.find((a) => a.role === role);
  if (u) currentUserStore.set(u);
}
