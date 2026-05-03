# 04 — Composants partagés

Tous dans `src/components/`. Utilisés à travers les 3 espaces.

## `AppShell`

Fichier : `src/components/AppShell.tsx`

Layout d'application (sidebar desktop + topbar mobile + tabbar mobile). Reçoit
en prop la liste des items de navigation, est utilisé par les 3 layouts
(`/app`, `/pro`, `/admin`).

### Props

```ts
interface NavItem {
  to: string;       // route TanStack
  label: string;    // texte sidebar / tabbar
  icon: ReactNode;  // SVG inline
  badge?: number;   // pastille rouge en haut à droite
  exact?: boolean;  // true → active uniquement si pathname === to
}

interface AppShellProps {
  brand: string;        // "Asanblé"
  spaceLabel: string;   // "Référent" | "Prestataire" | "Admin"
  userName: string;
  items: NavItem[];
  children: ReactNode;
}
```

### Comportement

- **Desktop (≥ md)** : sidebar fixe `w-60` (240px), avec :
  - Logo + label espace en haut (cliquable → `/`).
  - Liste des items (Link TanStack avec état actif).
  - Footer : "Changer d'espace" (lien `/`) + Avatar/nom (cliquable → `/account`).
- **Mobile (< md)** : topbar h-12 (logo + avatar), tabbar bas (icônes
  équiréparties).
- État actif d'un item : `pathname === to` ou `pathname.startsWith(to + "/")`
  sauf si `exact: true`.
- Le `<main>` ajoute `md:ml-60 pt-12 md:pt-0 pb-16 md:pb-0`.

## `SideDrawer`

Fichier : `src/components/SideDrawer.tsx`

Panneau latéral droit (overlay sombre + panel slide-in). Utilisé pour :
- Picker de prestataire (`/app`)
- Détail booking confirmé (`/pro/dispos`)
- Éditeur de disponibilités (`/pro/dispos`)
- Création atelier (`/admin/workshops`)
- Détail prestataire annuaire (`/app/providers`)
- Détail séance (`/app/calendar`)

### Props

```ts
interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  width?: number;      // défaut 420px
  footer?: ReactNode;  // rendu sticky en bas
  children: ReactNode;
}
```

### Comportement

- Animation : 200ms slide-in (cf. `src/styles.css`).
- Fermeture : clic sur l'overlay, touche `Esc` (à câbler), ou prop.
- Body scrollable, footer sticky.

## `Avatar`

Fichier : `src/components/Avatar.tsx`

Pastille ronde avec initiales colorées dérivées du nom (hash → couleur stable).

### Props

```ts
interface AvatarProps {
  name: string;       // "Marie-Laure Cadet" → "ML"
  size?: number;      // px, défaut 32
  className?: string;
}
```

Helper `initials(name)` exposé dans `src/lib/format.ts`.

## `StatusChip`

Fichier : `src/components/StatusChip.tsx`

Pastille colorée pour un `TicketStatus`. Utilise les tokens `s-*-bg/border/ink`.

### Props

```ts
interface StatusChipProps {
  status: TicketStatus;
}
```

### Mapping label FR

| status | label affiché |
| --- | --- |
| `draft` | "Brouillon" |
| `pending` | "En attente" |
| `confirmed` | "Confirmé" |
| `refused` | "Refusé" |
| `empty` | "Vide" |
| `partial` | "Partiel" |
| `blocked` | "Bloqué" |
| `done` | "Terminé" |
| `override` | "Forcé" |

## `CommentsThread`

Fichier : `src/components/CommentsThread.tsx`

Fil de commentaires d'une séance. Lit/écrit `src/data/comments.ts` (mémoire +
`localStorage`).

### Props

```ts
interface CommentsThreadProps {
  seanceId: string;
  currentRole: "referent" | "provider" | "admin";
  currentName: string;
}
```

### Comportement

- Liste les commentaires triés par `createdAt` croissant.
- Chaque commentaire affiche : avatar, nom + rôle, body, date courte, et —
  pour l'auteur — "Modifier" / "Supprimer".
- Formulaire en bas : `<textarea>` + bouton "Publier" (disabled si vide).
- Subscriptions : `subscribeComments(fn)` pour rafraîchir.
- API `comments.ts` :
  ```ts
  commentsForSeance(seanceId)
  commentCountForSeance(seanceId)
  addComment({ seanceId, authorRole, authorName, body })
  updateComment(id, body)
  deleteComment(id)
  subscribeComments(fn)
  ```

## `RoleDot` + `useRoleColor`

Fichier : `src/lib/roleColors.tsx`

Pastille de couleur pour un rôle. Couleur lue depuis `roleColorsStore`
(paramétrable par l'admin).

### Props

```ts
function RoleDot(props: {
  role: RoleName;
  size?: number;       // défaut 8
  outline?: boolean;   // ronde creuse au lieu de pleine
}): JSX.Element;

function useRoleColor(role: RoleName): string;
function getRoleColor(role: RoleName): string;
```

### Usage type

- Dans le calendrier `/app/availability` : 1 pastille par rôle disponible
  dans le créneau.
- Dans la légende du même écran.
- Dans le drawer "BookingDrawer" : préfixe le titre de chaque groupe rôle.
- Dans le panneau admin "Couleurs des rôles".

## Composants `ui/` (shadcn)

Présents dans `src/components/ui/` mais peu utilisés. Si tu en réintroduis,
**override les variants** pour matcher les tokens du design system (cf.
[03](./03-design-system.md)). Ne jamais utiliser les couleurs par défaut de
shadcn.
