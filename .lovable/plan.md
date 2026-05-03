## Objectif

Produire une **spec dev complète** d'Asanblé sous forme de documentation markdown découpée, telle qu'un développeur (front + back) puisse reconstruire l'application **de zéro** sans deviner. La doc reflète l'existant codé (mock client-side, stores en mémoire) et signale les **évolutions évidentes** à câbler quand le vrai backend sera branché (auth, persistance, notifications).

## Livrables

Création d'un dossier `docs/` à la racine du projet avec 8 fichiers :

```text
docs/
  README.md                     -- sommaire + parcours de lecture
  01-overview.md                -- contexte produit, rôles, glossaire, parcours globaux
  02-data-model.md              -- entités, champs, relations, statuts, règles métier
  03-design-system.md           -- tokens, typographie, composants partagés, conventions UI
  04-shared-components.md       -- AppShell, SideDrawer, Avatar, StatusChip, CommentsThread
  05-space-referent.md          -- espace référent famille, écran par écran
  06-space-provider.md          -- espace prestataire, écran par écran
  07-space-admin.md             -- espace admin Asanblé, écran par écran
  08-public-and-account.md      -- landing, login, signup, mot de passe oublié, /account
  09-evolutions.md              -- évolutions évidentes (auth, Supabase, notifs, RLS)
  assets/                       -- captures clés
    landing.png
    referent-home.png
    referent-new-seance.png
    referent-availability.png
    referent-session-detail.png
    provider-home.png
    provider-dispos.png
    admin-home.png
    admin-workshops.png
    admin-providers.png
```

## Structure d'un fichier "écran"

Chaque écran (≈25 au total) suit le même gabarit, pour qu'un dev puisse le coder isolément :

```text
### Écran : <Nom>            (ex. "Référent — Nouvelle séance")
- Route                       -- /app/sessions/new
- Fichier                     -- src/routes/app.sessions.new.tsx
- Accès                       -- rôle référent uniquement, depuis menu latéral
- Données lues                -- workshops, centers, providers (filtrés par requiredRoles)
- Données écrites             -- sessionsStore.add, seancesStore.add, ticketsStore.add
- Layout                      -- 1 colonne, max-w 720, padding 24
- Sections (de haut en bas)
  1. Header : titre, sous-titre, fil d'ariane
  2. Bloc "Atelier" : select workshops -> auto-remplit nom
  3. Bloc "Numérotation" : N° session + N° séance -> compose fullName
  4. Bloc "Quand" : date picker + heure début + durée (préremplie)
  5. Bloc "Où" : salle, audience, notes
  6. CTA "Créer la séance" + lien "Annuler"
- Boutons / actions
  - "Créer la séance" -> validation Zod, crée Session + Seance + Tickets vides, redirige /app/sessions/$id
  - "Annuler" -> retour /app
- États
  - vide (par défaut)
  - validation en cours (bouton disabled)
  - erreur (toast inline rouge sous champ)
- Règles métier
  - Le centre social est imposé par currentUser.centerId (pas demandé)
  - Tickets créés automatiquement : 1 par requiredRoles[i] avec status "empty"
  - fullName = `${workshop.name} — Session ${nSession} · Séance ${nSeance}`
- Composants UI utilisés
  - SideDrawer (non), Field, RoleDot
- Évolutions
  - Brancher mutation Supabase via createServerFn (.../sessions.functions.ts)
  - Email automatique aux prestataires "Nouvelle demande"
```

## Contenu détaillé prévu par fichier

### 01-overview.md (≈3K)
- Pitch produit : SaaS B2B pour centres sociaux en Guadeloupe.
- 3 espaces : Référent, Prestataire, Admin Asanblé. Chaque espace = même app, sidebar et écrans propres.
- Glossaire métier : **Atelier** (template, ex. "Gestion des émotions"), **Session** (instance d'un atelier dans un centre, ex. "Gestion des émotions — Session 1"), **Séance** (occurrence datée d'une session, ex. "Séance 3/4 le mar. 14 mai 14h"), **Ticket** (demande envoyée à un prestataire pour un rôle sur une séance).
- Parcours globaux (texte + ASCII) :
  - Création d'une séance → demandes → réponses → confirmation.
  - Réservation prestataire depuis le calendrier des dispos.
  - Supervision et déblocage admin.
- Spécificités : locale fr-FR, fuseau Guadeloupe (GMT-4 sans DST), pas d'emoji ni gradient ni icône superflue.

### 02-data-model.md (≈4K)
- Toutes les entités TypeScript (`Workshop`, `Center`, `Provider`, `UserAccount`, `Session`, `Seance`, `Ticket`, `Availability`, `SeanceComment`) avec types et relations sous forme ASCII :

```text
Workshop 1 ── n Session
Center   1 ── n Session
Session  1 ── n Seance
Seance   1 ── n Ticket
Ticket   n ── 1 Provider (nullable)
Provider 1 ── 1 Availability
Seance   1 ── n SeanceComment
UserAccount n ── 1 Center  (référent)
UserAccount 1 ── 1 Provider (prestataire)
```

- Énumérations : `RoleName` (9 valeurs), `TicketStatus` (9 valeurs), `CommentAuthorRole`.
- **Machine à états des tickets** :

```text
empty ──assign──▶ pending ──accept──▶ confirmed ──séance passée──▶ done
                          └─refuse──▶ refused
override : admin force la confirmation
draft : préremplissage non envoyé
```

- **Statut dérivé d'une séance** (`seanceStatus`) : règles exactes (done si tous done, confirmed si tous confirmed/done, blocked si un refused + un empty, partial si au moins un confirmed, pending si au moins un pending, sinon empty).
- **Statut dérivé d'une session** : agrégat des séances.
- Couleurs : 6 palettes session (`SESSION_COLORS`) pour calendrier prestataire ; 9 couleurs rôles paramétrables (`roleColorsStore`) pour calendrier référent.
- Données de seed : 6 ateliers, 6 centres, 10 prestataires, 4 sessions, 11 séances, 24 tickets — listés intégralement.

### 03-design-system.md (≈2K)
- Tokens `src/styles.css` : `--paper`, `--ink-50..900`, `--accent`, `--card`, `--sidebar`. Toujours `oklch`.
- Typographie : Inter, échelle 11/12/13/14/16/24, tracking-tight pour les titres.
- Conventions : pas d'emoji, pas de gradient, pas d'icône superflue. Boutons primaires `bg-ink-900 text-paper`. Hauteurs standard h-8 / h-9. Radius `rounded-md`.
- Patterns : header de page `flex justify-between items-end`, listes en `grid sm:grid-cols-2 gap-2`, cartes en `rounded-lg border border-ink-150 bg-card p-4`.

### 04-shared-components.md (≈2K)
Pour chacun : props, comportement, dépendances, variantes.
- `AppShell` (sidebar desktop + topbar mobile + tabbar mobile + main).
- `SideDrawer` (panneau latéral droit avec header, body scrollable, footer optionnel).
- `Avatar` (initiales colorées par hash du nom).
- `StatusChip` (mappe `TicketStatus` → label FR + couleur).
- `CommentsThread` (lit/écrit `comments.ts`, formulaire en bas, autorise édition/suppression du même auteur).
- `RoleDot` + `useRoleColor` (lit `roleColorsStore`).

### 05-space-referent.md (≈6K)
Sidebar 4 entrées : **Accueil**, **Nouvelle séance**, **Disponibilités prestataires**, **Calendrier**.
Écrans documentés avec gabarit complet :
- `/app` — Accueil : KPIs, séances à venir 7j, séances bloquées, raccourcis.
- `/app/sessions/new` — Nouvelle séance (atelier → numérotation → quand → où).
- `/app/sessions/$sessionId` — Détail session : timeline des séances, statuts, accès séances.
- `/app/sessions/$sessionId/seances/$n` — Détail séance : tickets par rôle, suggestions de remplacement, commentaires.
- `/app/availability` — Calendrier des dispos prestataires : vues Semaine et Mois, filtres rôle/atelier, légende, drawer de réservation groupé par rôle, pastilles colorées.
- `/app/calendar` — Calendrier des séances de mon centre : vue semaine, drawer détail.
- `/app/providers` — Annuaire prestataires (lecture).

### 06-space-provider.md (≈3K)
Sidebar 4 entrées : **Accueil**, **Mes interventions**, **Mes disponibilités**, **Mon profil**.
- `/pro` — Accueil : prochaines interventions, demandes en attente.
- `/pro/missions` — Liste interventions confirmées et passées.
- `/pro/dispos` — Édition récurrent (lun-dim × plages horaires) + exceptions multi-plages par date + calendrier propre coloré par session, fil de commentaires.
- `/pro/profile` — Identité, rôles, contact.

### 07-space-admin.md (≈5K)
Sidebar 7 entrées : **Tableau de bord**, **Projets**, **Centres**, **Ateliers**, **Prestataires**, **Utilisateurs**, **Export**.
- `/admin` — KPIs globaux, alertes, séances bloquées.
- `/admin/projects` — Vue par projet/atelier (sessions actives, taux de couverture).
- `/admin/centers` — Liste + adresse + contact + email + bouton ajouter.
- `/admin/workshops` — Catalogue + formulaire création (nom / nb séances / durée / rôles requis) + **panneau "Couleurs des rôles"** (color picker par rôle, reset).
- `/admin/providers` — Annuaire + formulaire "+ Inviter" avec multi-sélection rôles.
- `/admin/users` — Tous les comptes, formulaire "+ Nouvel utilisateur" (rôle, centre affilié, prestataire lié).
- `/admin/export` — Exports CSV (séances, tickets, prestataires).

### 08-public-and-account.md (≈2K)
- `/` Landing : hero "Asanblé", 3 cartes d'entrée par espace, CTA unique "Se connecter".
- `/login`, `/signup`, `/forgot-password` : formulaires démo.
- `/account` : prénom, nom, email, centre affilié (référent), changement de mot de passe.

### 09-evolutions.md (≈2K)
Évolutions évidentes à brancher après la maquette :
- Auth réelle via Lovable Cloud (email + password, magic link optionnel).
- Persistance Supabase : 1 table par entité, **table user_roles séparée**, fonction `has_role`, RLS strictes :
  - Référent voit uniquement les sessions de son `centerId`.
  - Prestataire voit uniquement les tickets où `providerId = me`.
  - Admin voit tout.
- Server functions (`src/server/*.functions.ts`) : `createSeance`, `respondTicket`, `bookProvider`, `inviteUser`.
- Notifications : email transactionnel sur `pending`, `confirmed`, `refused`, rappel J-1.
- Audit log des actions admin (override, déblocage).
- Export CSV server-side (streaming).
- Realtime sur statuts de tickets et commentaires.

## Captures clés (10 images)

Capturées via le preview, écran par écran, intégrées dans les fichiers correspondants :
landing, accueil référent, nouvelle séance, dispos prestataires (vue semaine avec pastilles), détail session, accueil prestataire, dispos prestataire, accueil admin, ateliers (avec panneau couleurs), prestataires.

## Hors périmètre

- Pas de schéma SQL Supabase complet (mentionné en évolutions, pas généré).
- Pas de mock-up Figma.
- Pas de scénarios de tests automatisés.
- Pas de captures exhaustives des états vides/erreurs.

## Question résiduelle

Souhaites-tu que je documente aussi le **comportement responsive** (breakpoint md à 768px : sidebar → tabbar mobile, drawers full-height) écran par écran, ou est-ce qu'une note globale dans `03-design-system.md` suffit ?
