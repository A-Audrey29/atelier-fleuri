# Asanblé — Spécification développeur

> Documentation complète permettant à un développeur (front + back) de
> reconstruire l'application Asanblé **de zéro**.
>
> Reflète l'**existant codé** (mock client-side, stores en mémoire) et signale
> en fin de chaque fichier les **évolutions évidentes** à câbler quand le vrai
> backend sera branché (auth, persistance, notifications).

## Sommaire

| #   | Fichier | Contenu |
| --- | --- | --- |
| 01  | [overview](./01-overview.md) | Pitch, rôles, glossaire métier, parcours globaux |
| 02  | [data-model](./02-data-model.md) | Entités TypeScript, relations, machines à états, seed |
| 03  | [design-system](./03-design-system.md) | Tokens CSS, typographie, conventions UI, responsive |
| 04  | [shared-components](./04-shared-components.md) | AppShell, SideDrawer, Avatar, StatusChip, CommentsThread, RoleDot |
| 05  | [space-referent](./05-space-referent.md) | Espace référent famille — écrans, actions, règles |
| 06  | [space-provider](./06-space-provider.md) | Espace prestataire — écrans, actions, règles |
| 07  | [space-admin](./07-space-admin.md) | Espace admin Asanblé — écrans, actions, règles |
| 08  | [public-and-account](./08-public-and-account.md) | Landing, login, signup, mot de passe oublié, /account |
| 09  | [evolutions](./09-evolutions.md) | Évolutions évidentes (auth réelle, Supabase, RLS, notifications) |

## Stack technique

- **TanStack Start v1** (React 19, Vite 7, SSR Cloudflare Worker)
- **TanStack Router** (file-based routing dans `src/routes/`)
- **Tailwind CSS v4** (tokens dans `src/styles.css`, oklch)
- **TypeScript strict**
- État local : stores réactifs maison (`useSyncExternalStore`) + `localStorage`
  pour les commentaires.

Pas de backend dans cette version : toute la donnée vient de
`src/data/seed.ts` et `src/data/store.ts`. La cible est Lovable Cloud
(Supabase managé) — voir [09-evolutions](./09-evolutions.md).

## Parcours de lecture conseillé

1. [overview](./01-overview.md) puis [data-model](./02-data-model.md) pour
   comprendre le métier.
2. [design-system](./03-design-system.md) et
   [shared-components](./04-shared-components.md) avant tout code UI.
3. Les 3 espaces métier (05/06/07) écran par écran selon ce que tu
   reconstruis.
4. [evolutions](./09-evolutions.md) quand tu attaques le backend.

## Conventions de la doc

Chaque écran suit le **même gabarit** :

```
### Écran : <Nom>
- Route                       (ex. /app/sessions/new)
- Fichier                     (chemin source)
- Accès                       (rôles autorisés)
- Données lues / écrites
- Layout
- Sections (de haut en bas)
- Boutons / actions
- États (vide, chargement, erreur, …)
- Règles métier
- Composants UI utilisés
- Évolutions à venir
```
