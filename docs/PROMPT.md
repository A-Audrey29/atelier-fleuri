# Prompt maître — Asanblé (SaaS de coordination d'ateliers)

> Ce document est un **prompt prêt à l'emploi** pour briefer une IA (ou un nouvel
> intervenant) sur l'ensemble du produit : sa raison d'être, ses utilisateurs,
> ses espaces et ses fonctionnalités métier en détail. Il sert de source unique
> pour générer du code, des écrans, des spécifications ou de la documentation
> cohérente avec l'existant.

---

## 1. Contexte produit

**Asanblé** est un SaaS B2B qui aide les **centres sociaux de Guadeloupe** à
organiser les **séances d'ateliers** qu'ils proposent aux familles
(parentalité, sport-santé, médiation, expression artistique, etc.).

Le produit remplace un workflow fait d'Excel, d'appels et de SMS par un flux
clair :

```
Création d'une séance → Recherche d'un prestataire dispo →
Envoi d'une demande → Réponse du prestataire → Confirmation →
Réalisation → Facturation
```

**Principes produit :**
- Locale `fr-FR`, fuseau **Guadeloupe (GMT-4, pas de DST)**, dates en
  wall-clock local sans `Z`.
- Esthétique sobre « papier / encre » : pas d'emoji, pas de gradient, pas
  d'icône décorative, pas de mode dark.
- Un seul produit, **trois espaces UI** distincts selon le rôle connecté.
- Multi-projets : l'admin peut gérer plusieurs programmes (REAAP, Sport-Santé,
  etc.) totalement isolés.

---

## 2. Acteurs et espaces

| Acteur | Espace | Préfixe URL | Mission |
| --- | --- | --- | --- |
| Référent famille (centre social) | Référent | `/app/*` | Crée des séances et trouve un prestataire pour chaque rôle |
| Prestataire intervenant | Prestataire | `/pro/*` | Déclare ses dispos, accepte/refuse les demandes, gère ses missions et documents |
| Équipe Asanblé | Admin | `/admin/*` | Supervise projets, ateliers, prestataires, centres, utilisateurs et facturation |
| Visiteur | Public | `/`, `/login`, `/signup`, `/account` | Se connecte, crée un compte, gère son profil |

Tous les espaces partagent le composant `AppShell` (sidebar + brand label).

---

## 3. Glossaire métier (à respecter strictement)

| Terme | Description |
| --- | --- |
| **Projet** | Programme financé qui regroupe sessions, centres et budgets (ex. « REAAP 2025 »). L'admin peut basculer d'un projet à l'autre. |
| **Centre social** (`Center`) | Structure cliente. Un référent y est rattaché. |
| **Atelier** (`Workshop`) | Template d'intervention catalogué : nombre de séances, durée, **RoleSlots** requis. |
| **RoleSlot** | Besoin fonctionnel d'un atelier sous forme `{ label, acceptedRoles[] }`. Permet le « OU » : ex. *Animateur = Animateur extérieur OU Animateur jardin*. |
| **Session** (`Session`) | Instance d'un atelier dans un centre, pour un groupe précis. |
| **Séance** (`Seance`) | Occurrence datée d'une session, numérotée 1..N. |
| **Ticket** | Demande envoyée à un prestataire pour assurer **un rôle** sur **une séance**. |
| **Rôle** (`RoleName`) | Spécialité d'intervenant (énumération fermée : Psychologue, Éducateur sportif, Animateur jardin, etc.). |
| **Disponibilité** | Créneaux récurrents (lun-dim) + exceptions ponctuelles, par prestataire. |
| **SLA** | Service Level Agreement — délai attendu de réponse prestataire (24 h par défaut). |

**Statuts de Ticket :** `empty` → `pending` → `confirmed` → `done` ; alternatifs
`refused`, `blocked`, `skipped` (rôle décoché à la création), `override`
(forçage admin).

---

## 4. Espace Référent (`/app/*`) — fonctionnalités détaillées

**Sidebar :** Mes tickets · Disponibilités · Mes séances · Prestataires · Nouvelle séance.

### 4.1 Création d'une séance (`/app/sessions/new`)
1. **Choix de l'atelier** dans le catalogue (filtré par projet).
2. Le système affiche les **RoleSlots** de l'atelier. Le référent peut
   **décocher** les slots non requis pour cette séance précise → le ticket
   correspondant sera créé avec le statut `skipped` (visible mais inactif dans
   le calendrier).
3. Saisie : n° de session, n° de séance, date/heure, lieu, notes, taille du
   groupe.
4. À la soumission, le système crée `Session` + `Seance` + N `Tickets`
   (un par RoleSlot actif, statut `empty`).

### 4.2 Recherche de disponibilités (`/app/availability`)
- Vue **Semaine** : grille 7 j × 11 h (8h→18h).
- Filtres : Atelier (verrouille les rôles), sinon Rôle libre.
- Pour un slot multi-rôles, le filtre prend l'**union** des `acceptedRoles`.
- Couleur du créneau = nombre de prestataires libres ; pastilles = rôles
  présents (couleurs configurées par l'admin).
- Clic créneau → `BookingDrawer` regroupant les prestataires par rôle, avec
  bouton **Demander →** qui passe le ticket de `empty` à `pending`.

### 4.3 Mes tickets (`/app/tickets`)
Liste des tickets émis avec statut, relances possibles, accès au détail
séance.

### 4.4 Mes séances (`/app/sessions`)
Calendrier global des séances du référent, code couleur par statut agrégé.

### 4.5 Annuaire prestataires (`/app/providers`)
Lecture seule : fiches publiques des prestataires (rôles, bio, zone d'action).

---

## 5. Espace Prestataire (`/pro/*`) — fonctionnalités détaillées

**Sidebar :** Demandes · Mes dispos · Missions · Documents · Profil.

### 5.1 Demandes (`/pro`)
Tableau des tickets `pending` reçus. Actions **Accepter** (→ `confirmed`) ou
**Refuser** (→ `refused`, retour au référent). SLA visible (compte à rebours
24 h).

### 5.2 Mes dispos (`/pro/dispos`)
- Édition des **plages récurrentes** par jour de la semaine.
- **Exceptions** ponctuelles (indispo ou dispo exceptionnelle à une date).
- Vue Semaine de prévisualisation.

### 5.3 Missions (`/pro/missions`)
Historique des tickets `confirmed`/`done` avec détails séance et lieu.

### 5.4 Documents (`/pro/documents`)
Espace de fichiers partagés avec l'admin :
- **Upload** (PDF, images, justificatifs).
- **Téléchargement** de tout document partagé.
- **Suppression** : uniquement les documents que **le prestataire a
  lui-même uploadés**. L'admin peut supprimer n'importe lequel.

### 5.5 Profil (`/pro/profile`)
Bio publique, rôles assurés, zone géographique, photo, contact.

---

## 6. Espace Admin (`/admin/*`) — fonctionnalités détaillées

**Sidebar :** Dashboard · Projets · Ateliers · Prestataires · Centres ·
Utilisateurs · Export.

### 6.1 Dashboard (`/admin`)
KPIs et alertes du projet courant :
- **Tickets bloqués** (`refused`/`blocked`) — accès direct à l'écran de
  réassignation.
- **SLA dépassés** (`pending` > 24 h) — relance manuelle possible.
- **Sessions à risque** (au moins un ticket `empty` ou `refused` à J-3).
- Volumétrie : séances de la semaine, taux d'acceptation, top prestataires.

### 6.2 Projets (`/admin/projects`)
- Création / édition / suppression d'un **Projet** complet et indépendant
  (couleurs, période, budget global).
- Clic sur un projet → **workspace contextuel** `/projects/:projectId` avec
  sidebar dédiée : Vue d'ensemble · Centres · Ateliers · Sessions · Paramètres.
- Permet de basculer d'un projet à l'autre sans quitter l'espace admin.

### 6.3 Ateliers (`/admin/workshops`)
CRUD des templates d'ateliers :
- Métadonnées (titre, description, durée, nombre de séances).
- Édition des **RoleSlots** (label + liste de `acceptedRoles`) → c'est ce
  qui pilote le « OU » de rôles côté référent.

### 6.4 Prestataires (`/admin/providers`)
- Annuaire complet, ajout/édition, rôles couverts, statut d'activité.
- Sous-page **Documents** par prestataire (upload, suppression sans
  restriction côté admin).

### 6.5 Centres (`/admin/centers`)
CRUD des structures clientes et rattachement des référents.

### 6.6 Utilisateurs (`/admin/users`)
Gestion des comptes (référents, prestataires, admins), rôles, invitations.

### 6.7 Export (`/admin/export`)
Export comptable / facturation (CSV, période, filtres projet & centre).

---

## 7. Espace public et compte

- `/` Landing produit.
- `/login`, `/signup`, `/forgot-password` : auth (mock actuellement, tout
  redirige vers l'espace par défaut du rôle).
- `/account` : édition du profil utilisateur (nom, email, mot de passe, avatar).

---

## 8. Règles transverses

- **Sécurité rôles :** stocker les rôles dans une table dédiée `user_roles`
  (jamais sur `profiles`), avec fonction `has_role()` SECURITY DEFINER.
- **Notifications** (futur) : email/SMS au passage `pending`, rappel J-1,
  alerte SLA dépassé.
- **Audit** : chaque changement de statut de ticket conserve auteur + date.
- **Isolation projet** : toutes les vues admin (sauf Utilisateurs et
  Prestataires globaux) sont scopées au projet actif.
- **Hors périmètre actuel** : auth réelle, persistance serveur, paiement en
  ligne, multilingue, mode dark.

---

## 9. Comment utiliser ce prompt

Pour générer une nouvelle fonctionnalité, copier le bloc ci-dessous en tête
de votre demande :

> Tu interviens sur **Asanblé**, un SaaS de coordination de séances
> d'ateliers pour centres sociaux de Guadeloupe. Trois espaces : Référent
> (`/app`), Prestataire (`/pro`), Admin (`/admin`). Respecte le glossaire
> (Projet → Atelier → Session → Séance → Ticket ; RoleSlot avec
> `acceptedRoles[]` pour les rôles « OU »). Statuts ticket : empty, pending,
> confirmed, done, refused, blocked, skipped, override. Esthétique sobre,
> locale `fr-FR`, fuseau Guadeloupe sans DST, design tokens depuis
> `src/styles.css`. Voir `docs/PROMPT.md` pour le détail métier complet.
