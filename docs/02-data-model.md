# 02 — Modèle de données

Source de vérité actuelle : `src/data/types.ts`, `src/data/seed.ts`,
`src/data/store.ts`, `src/data/comments.ts`.

## Énumérations

### `RoleName` (9 valeurs)

```ts
type RoleName =
  | "Psychologue"
  | "Éducateur"
  | "Coach sportif"
  | "Animateur"
  | "Éducateur sportif"
  | "Éducateur sportif pleine nature"
  | "Artiste"
  | "Enseignant"
  | "Intervenant numérique";
```

Liste centralisée : `ALL_ROLES_LIST` dans `src/lib/roleColors.tsx`.

### `TicketStatus` (9 valeurs)

```ts
type TicketStatus =
  | "draft"      // brouillon non envoyé
  | "pending"    // demande envoyée au prestataire, en attente de réponse
  | "confirmed"  // accepté par le prestataire
  | "refused"    // refusé par le prestataire
  | "empty"      // slot rôle non encore assigné
  | "partial"    // (statut séance dérivé) certains rôles confirmés, d'autres non
  | "blocked"    // (statut séance dérivé) au moins un refused + un empty
  | "done"       // séance passée et tickets confirmés au moment de la séance
  | "override";  // confirmation forcée par l'admin
```

### `CommentAuthorRole`

```ts
type CommentAuthorRole = "referent" | "provider" | "admin";
```

## Entités

### `Workshop`

```ts
interface Workshop {
  id: string;
  name: string;
  description?: string;
  requiredRoles: RoleName[]; // ex. ["Psychologue", "Éducateur"]
  seancesCount?: number;     // nb de séances par session, ex. 4
  durationMin?: number;      // durée d'une séance en minutes, ex. 120
}
```

### `Center`

```ts
interface Center {
  id: string;
  name: string;
  city: string;
  address: string;
  contactName: string;   // référent principal du centre
  contactPhone: string;
  contactEmail?: string;
}
```

### `UserAccount`

```ts
interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "referent" | "provider" | "admin";
  centerId?: string;     // requis si role = "referent"
  providerId?: string;   // requis si role = "provider"
  createdAt: string;     // YYYY-MM-DD
}
```

### `Provider`

```ts
interface Provider {
  id: string;
  fullName: string;
  roles: RoleName[];     // un prestataire peut cumuler plusieurs rôles
  city: string;
  phone?: string;
  email?: string;
}
```

### `Session`

```ts
interface Session {
  id: string;
  workshopId: string;
  centerId: string;
  groupLabel: string;    // ex. "Groupe 1", "Groupe Collège"
  referentName: string;
  notes?: string;
  room?: string;
  audience?: string;     // ex. "8 adolescents 13-16 ans"
}
```

### `Seance`

```ts
interface Seance {
  id: string;
  sessionId: string;
  index: number;         // 1, 2, 3...
  start: string;         // ISO wall-clock GP "YYYY-MM-DDTHH:MM" (sans Z)
  durationMin: number;
}
```

### `Ticket`

```ts
interface Ticket {
  id: string;
  seanceId: string;
  role: RoleName;
  providerId: string | null;  // null tant que pas assigné
  status: TicketStatus;
  sentAt?: string;
  respondedAt?: string;
}
```

### `Availability`

```ts
interface Availability {
  providerId: string;
  // dow: 1=lun .. 7=dim, ranges en "HH:MM-HH:MM"
  recurring: Array<{ dow: number; ranges: string[] }>;
  blockedDates: string[]; // YYYY-MM-DD
}
```

Côté éditeur prestataire (`/pro/dispos`), une 2e structure plus riche est
utilisée localement :

```ts
interface RecurringRange { start: string; end: string }
interface RecurringDay { enabled: boolean; ranges: RecurringRange[] }
type Exception =
  | { date: string; type: "blocked" }
  | { date: string; type: "extra"; ranges: RecurringRange[] };
```

À unifier côté backend en une seule représentation canonique.

### `SeanceComment`

```ts
interface SeanceComment {
  id: string;
  seanceId: string;
  authorRole: CommentAuthorRole;
  authorName: string;
  body: string;
  createdAt: string; // ISO court
  editedAt?: string;
}
```

Persistance actuelle : `localStorage` clé `asanble.comments.v1`.

## Relations

```text
Workshop  1 ──── n  Session
Center    1 ──── n  Session
Session   1 ──── n  Seance
Seance    1 ──── n  Ticket
Ticket    n ──── 1  Provider     (nullable)
Provider  1 ──── 1  Availability
Seance    1 ──── n  SeanceComment

UserAccount n ──── 1  Center     (si role=referent)
UserAccount 1 ──── 1  Provider   (si role=provider)
```

Indices recommandés (futur Postgres) :
- `tickets(seance_id)`, `tickets(provider_id, status)`
- `seances(session_id)`, `seances(start)`
- `sessions(center_id)`
- `comments(seance_id)`

## Machines à états

### Ticket

```text
       ┌─────────┐
       │  draft  │  (préremplissage non envoyé)
       └────┬────┘
            │ envoi
            ▼
┌─────────┐ assign ┌──────────┐ accept ┌──────────────┐  séance passée  ┌────────┐
│  empty  │───────▶│ pending  │───────▶│  confirmed   │────────────────▶│  done  │
└─────────┘        └────┬─────┘        └──────────────┘                 └────────┘
                        │ refuse
                        ▼
                   ┌──────────┐
                   │ refused  │ (le référent doit réassigner)
                   └──────────┘

  override : l'admin force la confirmation depuis le triage
```

### Statut dérivé d'une séance — `seanceStatus(seanceId)`

Implémenté dans `src/data/seed.ts`. Règles, dans cet ordre :

```text
1. tickets vide → "empty"
2. tous "done" → "done"
3. tous "confirmed" ou "done" → "confirmed"
4. au moins un "refused" ET au moins un "empty" → "blocked"
5. au moins un "confirmed" ou "done" → "partial"
6. au moins un "pending" → "pending"
7. sinon → "empty"
```

### Statut dérivé d'une session

Non implémenté pour l'instant. Règle suggérée pour l'admin :

```text
- toutes séances "done"            → "completed"
- au moins une "blocked"           → "at-risk"
- toutes "confirmed"/"done"        → "ready"
- au moins une "partial"/"pending" → "in-progress"
- sinon                            → "draft"
```

## Couleurs métier

### Couleurs de session (calendrier prestataire)

`src/data/seed.ts` exporte `colorForSession(sessionId)` qui hash l'id et
renvoie une palette parmi 6 (corail, bleu lagon, vert kaki, rose, bleu froid,
beige). Utilisé pour différencier visuellement les sessions superposées dans
le calendrier `/pro/dispos` et `/app/calendar`.

### Couleurs de rôle (calendrier référent)

`roleColorsStore` dans `src/data/store.ts` — **paramétrable par l'admin**
depuis `/admin/workshops` (panneau "Couleurs des rôles"). Valeurs par défaut :

| Rôle | Couleur défaut |
| --- | --- |
| Psychologue | `#1f3a5f` |
| Éducateur | `#2f5d3a` |
| Coach sportif | `#a64b1f` |
| Animateur | `#b78a2a` |
| Éducateur sportif | `#7a1f3a` |
| Éducateur sportif pleine nature | `#5d6b1f` |
| Artiste | `#5a2a6e` |
| Enseignant | `#3a4a55` |
| Intervenant numérique | `#c4632f` |

Consommé via `RoleDot` / `useRoleColor` (`src/lib/roleColors.tsx`).

## Helpers exportés

Dans `src/data/seed.ts` :

```ts
getWorkshop(id)
getCenter(id)
getProvider(id | null)
getSession(id)
getSeance(id)
ticketsForSeance(seanceId)
seancesForSession(sessionId)
bookingsForProvider(providerId)
seanceStatus(seanceId)
suggestionsForRole(role, excludeIds)  // top 2 prestataires du bon rôle
colorForSession(sessionId)
```

Dans `src/lib/format.ts` :

```ts
fmtSeance(d)        // "Mar. 14 mai · 14h00"
fmtDayLong(d)       // "Mardi 14 mai 2025"
fmtDayShort(d)      // "Mar. 14 mai"
fmtTime(d)          // "14h00"
fmtTimeRange(start, durationMin)  // "14h00 – 16h00"
fmtMoney(n)         // "1 200 €"
initials(name)      // "ML"
addDaysISO(iso, n)
startOfWeekISO(iso) // lundi de la semaine
getDow(d) / getDate(d)
```

## Données de seed (référence rapide)

- **6 ateliers** (`w1`..`w6`) — voir `seed.ts`.
- **6 centres** (`c1`..`c6`) — communes Guadeloupe.
- **10 prestataires** (`p1`..`p10`) avec rôles variés.
- **4 sessions** (`s1`..`s4`) réparties sur 4 centres.
- **11 séances** (`se1`..`se11`) avec dates relatives à `today` (passées et
  futures, génère une mixité de statuts).
- **24 tickets** (`t1`..`t24`) couvrant tous les statuts (`done`, `confirmed`,
  `pending`, `empty`, `refused`).
- **7 comptes** (`u1`..`u7`) : 3 référents, 3 prestataires, 1 admin.
- **4 commentaires** de seed (`co1`..`co4`).

## Évolutions

- Migrer vers Postgres (Supabase) avec une table par entité.
- **Table `user_roles` séparée** + fonction `has_role(user_id, role)` SECURITY
  DEFINER (voir [09-evolutions](./09-evolutions.md#rôles--rls)).
- Colonne `created_at` / `updated_at` partout.
- Centraliser le format de disponibilités (récurrent + exceptions) en JSONB
  unique côté `providers.availability`.
- Ajouter `Workshop.color` ou conserver le mapping global ? Décision : garder
  global (un rôle = une couleur, indépendante de l'atelier).
