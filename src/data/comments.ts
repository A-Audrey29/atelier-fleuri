// Commentaires laissés sur une séance (référent ↔ prestataire ↔ admin)
// Stockage en mémoire + persistance localStorage côté client.

export type CommentAuthorRole = "referent" | "provider" | "admin";

export interface SeanceComment {
  id: string;
  seanceId: string;
  authorRole: CommentAuthorRole;
  authorName: string;
  body: string;
  createdAt: string; // ISO
  editedAt?: string;
}

const STORAGE_KEY = "asanble.comments.v1";

const initial: SeanceComment[] = [
  {
    id: "co1",
    seanceId: "se3",
    authorRole: "referent",
    authorName: "Mathilde Marival",
    body: "Merci d'arriver 15 min en avance, l'accès au 1er étage demande un badge à récupérer à l'accueil.",
    createdAt: "2025-04-22T09:30",
  },
  {
    id: "co2",
    seanceId: "se3",
    authorRole: "provider",
    authorName: "Marie-Laure Cadet",
    body: "Bien noté pour le badge. Je préparerai un atelier autour de la gestion du stress (test).",
    createdAt: "2025-04-22T11:05",
  },
  {
    id: "co3",
    seanceId: "se4",
    authorRole: "referent",
    authorName: "Mathilde Marival",
    body: "Le coach sportif initialement prévu a refusé. Si possible, prévoir un binôme alternatif.",
    createdAt: "2025-04-23T14:10",
  },
  {
    id: "co4",
    seanceId: "se5",
    authorRole: "referent",
    authorName: "Karine Lubin",
    body: "Le groupe de collégiens est sensible — merci d'éviter les mises en situation publiques en début de séance.",
    createdAt: "2025-04-20T08:45",
  },
];

function load(): SeanceComment[] {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    return JSON.parse(raw) as SeanceComment[];
  } catch {
    return initial;
  }
}

function save(list: SeanceComment[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

let store: SeanceComment[] = load();
const listeners = new Set<() => void>();

function emit() {
  save(store);
  listeners.forEach((fn) => fn());
}

export function subscribeComments(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function commentsForSeance(seanceId: string): SeanceComment[] {
  return store
    .filter((c) => c.seanceId === seanceId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function commentCountForSeance(seanceId: string): number {
  return store.filter((c) => c.seanceId === seanceId).length;
}

export function addComment(input: Omit<SeanceComment, "id" | "createdAt">): SeanceComment {
  const c: SeanceComment = {
    ...input,
    id: `co${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 16),
  };
  store = [...store, c];
  emit();
  return c;
}

export function updateComment(id: string, body: string) {
  store = store.map((c) =>
    c.id === id ? { ...c, body, editedAt: new Date().toISOString().slice(0, 16) } : c,
  );
  emit();
}

export function deleteComment(id: string) {
  store = store.filter((c) => c.id !== id);
  emit();
}
