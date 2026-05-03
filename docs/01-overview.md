# 01 — Vue d'ensemble

## Pitch

**Asanblé** est un SaaS B2B qui aide les **centres sociaux de Guadeloupe** à
coordonner leurs **séances d'ateliers** entre :

- les **référents famille** (personnel du centre social qui crée et anime les
  besoins),
- les **prestataires intervenants** (psychologues, éducateurs, coachs sportifs,
  animateurs, artistes…),
- l'équipe **Asanblé** (admin) qui supervise dispositifs, prestataires et
  facturation.

Objectif : remplacer Excel + téléphone par un workflow clair (création →
demande → réponse → confirmation → facturation).

## Trois espaces métier

L'application est **un seul produit** avec trois espaces UI distincts. Le rôle
du compte connecté détermine l'espace par défaut.

| Espace | Préfixe URL | Brand label | Sidebar |
| --- | --- | --- | --- |
| Référent famille | `/app/*` | "Référent" | Mes tickets, Disponibilités, Mes séances, Prestataires, Nouvelle séance |
| Prestataire | `/pro/*` | "Prestataire" | Demandes, Mes dispos, Missions, Profil |
| Admin Asanblé | `/admin/*` | "Admin" | Triage, Dispositifs, Ateliers, Prestataires, Centres, Utilisateurs, Export |

Chaque espace utilise le composant partagé [`AppShell`](./04-shared-components.md#appshell).

## Glossaire métier

| Terme | Définition | Exemple |
| --- | --- | --- |
| **Atelier** (`Workshop`) | Template d'intervention catalogué par l'admin. Définit les rôles requis, le nombre de séances et la durée. | "Gestion des émotions" |
| **Centre social** (`Center`) | Structure cliente. Un référent y est rattaché. | "Centre social des Abymes" |
| **Session** (`Session`) | Instance d'un atelier dans un centre, pour un groupe précis. | "Gestion des émotions — Session 1" (Abymes, 8 ados) |
| **Séance** (`Seance`) | Occurrence datée d'une session. Numérotée 1..N. | "Séance 3/4 — mardi 14 mai 14h" |
| **Ticket** (`Ticket`) | Demande envoyée à un prestataire pour assurer **un rôle** sur **une séance**. | "Psychologue · Séance 3 · Marie-Laure Cadet · confirmed" |
| **Rôle** (`RoleName`) | Spécialité d'un intervenant. 9 valeurs énumérées. | "Psychologue", "Éducateur sportif pleine nature" |
| **Disponibilité** (`Availability`) | Plages horaires récurrentes (lun-dim) + exceptions ponctuelles, par prestataire. | Lun-Ven 9h-12h / 14h-18h |
| **Dispositif** | Programme financé qui regroupe plusieurs sessions sur plusieurs centres. | "REAAP 2025", "Sport-Santé Jeunesse 2025" |

## Parcours globaux

### 1. Cycle d'une séance (référent → prestataire → confirmation)

```text
[Référent] crée une séance
    │  workshop + n° session + n° séance + date + lieu + notes
    ▼
[Système] crée Session + Seance + N Tickets vides (1 par requiredRoles[i])
    │
    ▼
[Référent] depuis "Disponibilités prestataires" choisit
    un créneau et un prestataire pour chaque rôle
    │
    ▼
[Système] passe le Ticket de "empty" à "pending"
    │  (futur : envoie email/SMS au prestataire)
    ▼
[Prestataire] dans "Demandes" : Accepter / Refuser
    │
    ├── Accepter → Ticket "confirmed"
    └── Refuser  → Ticket "refused" → Référent doit réassigner
    │
    ▼
La veille (J-1) : rappel auto au prestataire (futur)
    │
    ▼
Une fois la séance passée : Ticket "done"
```

### 2. Réservation depuis le calendrier des disponibilités (parcours principal)

```text
[Référent] /app/availability
    │
    ├── filtre Atelier (verrouille les rôles requis)
    ├── filtre Rôle (si pas d'atelier sélectionné)
    │
    ▼
Vue Semaine : grille 7j × 11h (8h→18h)
  - chaque créneau coloré selon le nb de prestataires libres
  - pastilles colorées = rôles présents (couleur paramétrée par admin)
  - tooltip = "Rôle — Nom"
    │
    ▼
Clic sur un créneau → drawer "BookingDrawer"
  - prestataires regroupés par rôle (chaque rôle = pastille de sa couleur)
  - bouton "Demander →" envoie le Ticket
```

### 3. Supervision admin

```text
[Admin] /admin (Triage)
    │
    ├── Tickets bloqués (refused/blocked) → "Débloquer ›" → écran séance référent
    ├── SLA dépassés (pending > 24h)
    └── Sessions à risque (empty + refused)
```

## Spécificités produit

- **Locale** : `fr-FR` (intl + formats courts maison dans `src/lib/format.ts`).
- **Fuseau horaire** : Guadeloupe (GMT-4, **pas de DST**). Toutes les dates
  côté mock sont stockées en **wall-clock GP sans Z** (`"2025-05-14T14:00"`)
  pour éviter toute conversion. À conserver côté Postgres (colonne
  `timestamp without time zone` + colonne `timezone` séparée si jamais on
  étend hors GP).
- **Pas d'emoji**, **pas de gradient**, **pas d'icône superflue**. Aesthetic
  "papier/encre" sobre — voir [03-design-system](./03-design-system.md).
- **Pas de mode dark** (out of scope pour cette version).

## Hors périmètre actuel

- Auth réelle (toute connexion redirige vers `/app`).
- Vraies notifications email/SMS.
- Persistance serveur (tout en mémoire + `localStorage` pour commentaires).
- Paiement / facturation (existe en maquette `/admin/export` uniquement).
- Multilingue.
