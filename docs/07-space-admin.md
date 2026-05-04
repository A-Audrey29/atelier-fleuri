# 07 — Espace Admin Asanblé

URL préfixe : `/admin/*`. Layout : `src/routes/admin.tsx` (`AdminLayout`) qui
applique `setCurrentUserByRole("admin")` au mount.

## Sidebar

| Label | Route | Badge dynamique |
| --- | --- | --- |
| Triage | `/admin` (exact) | Nb tickets `refused | blocked` |
| Dispositifs | `/admin/projects` | — |
| Ateliers | `/admin/workshops` | — |
| Prestataires | `/admin/providers` | — |
| Centres | `/admin/centers` | — |
| Utilisateurs | `/admin/users` | — |
| Export compta | `/admin/export` | — |

---

## Écran : Triage (Tableau de bord)

![Triage admin — KPI et tickets bloqués](./screenshots/admin-triage.png)


- **Route** : `/admin` (exact)
- **Fichier** : `src/routes/admin.index.tsx`

### Sections

1. **Header** : "Triage" + sous-titre.
2. **3 stats KPI** (cartes colorées) :
   - Tickets bloqués (rouge `s-refused-*`).
   - SLA dépassés (jaune `s-pending-*`).
   - Sessions à risque (violet `s-override-*`).
3. **Tickets bloqués** : liste de cartes avec workshop + ville, séance + date
   + rôle (+ "refusé par <nom>" si applicable), `StatusChip`, lien
   "Débloquer ›" → `/app/sessions/$sessionId/seances/$n` (vue référent).

### Règles

- `blocked = tickets.filter(t => t.status === "refused" || t.status === "blocked")`.
- `pendingOver24h` = `tickets.filter(status === "pending")` (à raffiner avec
  `sentAt + 24h`).
- `sessionsAtRisk` = sessions ayant au moins un ticket `refused` ou `empty`.

### Évolutions

- Filtres : par centre, par dispositif, par dispositif financeur.
- Action "Forcer la confirmation" (status `override`) avec audit log.
- "Notifier le référent" en un clic.

---

## Écran : Dispositifs

- **Route** : `/admin/projects`
- **Fichier** : `src/routes/admin.projects.tsx`
- **Données** : `projectsStore`, `workshopsStore`, `centersStore`.

### Sections

1. **Header** : titre + compteur, sous-titre, CTA primaire **+ Nouveau dispositif**
   (ouvre `SideDrawer`).
2. **Liste** de cartes dispositif :
   - Nom + description (ex. "REAAP 2025 — Réseau Écoute Appui…").
   - Ligne meta : `<n> centres · Budget X € · Période JJ/MM/AAAA → JJ/MM/AAAA · Financeur …`.
   - Pills des ateliers rattachés (lecture seule).

### `SideDrawer` "Nouveau dispositif"

Champs (formulaire) :
- **Nom du dispositif** (required, ex. "REAAP 2026").
- **Description courte** (optionnelle).
- **Financeur** (texte libre : CAF, ARS, DRAC, Région…).
- **Budget** (number, en euros).
- Grille 2 colonnes : **Début** + **Fin** (date pickers natifs).
- **Centres concernés** : liste de checkboxes scrollable (`max-h-[160px]`),
  multi-sélection sur tous les centres du `centersStore`. Compteur dans le label.
- **Ateliers du dispositif** : multi-toggle pills (mêmes interactions que
  l'écran Ateliers). Compteur dans le label.

Footer : "Créer le dispositif" (disabled si nom vide) / "Annuler". Sortie ou
fermeture → reset complet du formulaire.

### Règles métier

- À la création : push dans `projectsStore`, `id = pr${Date.now()}`,
  `createdAt = today (YYYY-MM-DD)`. Aucune validation de doublon.
- `centerIds` et `workshopIds` peuvent être vides à la création (un dispositif
  peut être instruit avant que les centres/ateliers ne soient connus).

### Évolutions

- Édition / archivage d'un dispositif existant.
- Page détail : sessions actives par centre, taux de couverture, dépenses
  consolidées vs budget, exports comptables filtrés par dispositif.
- Lier les sessions à un dispositif (champ `projectId` sur `Session`) pour
  agréger automatiquement séances et tickets.
- Validation d'unicité du nom + plage de dates cohérente (`startDate <= endDate`).

---

## Écran : Ateliers

![Ateliers + panneau Couleurs des rôles](./screenshots/admin-workshops.png)


- **Route** : `/admin/workshops`
- **Fichier** : `src/routes/admin.workshops.tsx`
- **Données** : `workshopsStore`, `roleColorsStore`.

### Sections

1. **Header** : titre + compteur, CTA primaire **+ Nouvel atelier** (ouvre
   `SideDrawer`).
2. **Grille 2 colonnes** de cartes ateliers (nom, "<n> séances · <durée>
   min", liste des rôles requis en pills).
3. **Panneau "Couleurs des rôles"** :
   - Header : titre + "Réinitialiser" (rétablit `DEFAULT_ROLE_COLORS`).
   - Liste à 2 colonnes ; chaque ligne :
     - `RoleDot` (preview live)
     - Nom du rôle
     - `<input type="color">`
     - Code hexa en `<code>`
   - Modification immédiatement répercutée dans `/app/availability`.

### `SideDrawer` "Nouvel atelier"

Champs (formulaire) :
- Nom de l'atelier (required).
- Grille 2 colonnes : Nombre de séances (number 1..50, défaut 4),
  Durée en min (number step 15, défaut 90).
- Rôles requis : multi-toggle (pills cliquables) parmi les 9 rôles.

Footer : "Créer l'atelier" (disabled si nom vide) / "Annuler".

### Règles

- À la création : push dans `workshopsStore`. Pas de validation des doublons
  (à ajouter).

### Évolutions

- Édition / archivage d'un atelier existant.
- Lier l'atelier à un dispositif (financeur).
- Validation : `requiredRoles.length >= 1`.

---

## Écran : Prestataires

- **Route** : `/admin/providers`
- **Fichier** : `src/routes/admin.providers.tsx`

### Sections

1. **Header** : titre + compteur, CTA **+ Inviter** (ouvre une modale centrée).
2. **Liste plate** (1 colonne) : avatar, nom, "<rôles> · <ville>",
   badge "Validé" (vert).

### Modale "Inviter un prestataire"

Champs :
- Nom complet.
- Email + Téléphone (grille 2 cols).
- Commune.
- **Rôles** : checkbox multi-sélection dans une zone scrollable
  `max-h-[180px]`, listant les 9 rôles (besoins du projet).

Footer : "Envoyer l'invitation" (disabled si nom vide ou aucun rôle) / "Annuler".

### Évolutions

- Vraie invitation par email avec magic link.
- Statuts prestataire : invited / active / archived.
- Page détail prestataire (historique missions, taux d'acceptation, notation).

---

## Écran : Centres sociaux

- **Route** : `/admin/centers`
- **Fichier** : `src/routes/admin.centers.tsx`

### Sections

1. **Header** : titre + compteur, CTA "+ Ajouter" (non câblé).
2. **Grille 2 colonnes** de cartes centres : nom, adresse, "Référent · <nom>",
   téléphone (`tel:` link) + email (`mailto:` link, si présent).

### Évolutions

- Câbler "+ Ajouter" sur un drawer/formulaire.
- Édition (nom, adresse, contact, email).

---

## Écran : Utilisateurs

![Utilisateurs — tableau filtrable](./screenshots/admin-users.png)


- **Route** : `/admin/users`
- **Fichier** : `src/routes/admin.users.tsx`
- **Données** : `accountsStore`, `centersStore`.

### Sections

1. **Header** : titre + compteur, CTA primaire **+ Nouvel utilisateur** (ouvre modale).
2. **Filtres** : recherche texte (nom/email) + select rôle (Tous /
   Référents / Prestataires / Admins).
3. **Tableau** : Utilisateur (avatar + nom), Email, Rôle (pill), Centre
   affilié, Date de création, action "Modifier" (non câblée).

### Modale "Nouvel utilisateur"

Champs :
- Prénom + Nom (grille 2 cols).
- Email.
- Rôle (select : Référent famille / Prestataire / Admin).
- Centre social affilié (select dynamique, **affiché uniquement si rôle ===
  "referent"**).

Footer : "Créer le compte" (disabled si prénom/nom/email vide) / "Annuler".

### Règles

- À la création : push dans `accountsStore`, `id = u${Date.now()}`,
  `createdAt = today`.
- `centerId` est conservé uniquement si `role === "referent"`.

### Évolutions

- Champ "Prestataire associé" si `role === "provider"`.
- Génération auto du mot de passe + envoi par email d'activation.
- Action "Modifier" : drawer édition.
- Désactivation / suppression d'un compte.

---

## Écran : Export comptable

- **Route** : `/admin/export`
- **Fichier** : `src/routes/admin.export.tsx`
- **État** : maquette statique.

### Sections

Formulaire :
- Période (deux date pickers).
- Centre social (select).
- Prestataire (select).
- Format (CSV / XLSX, deux boutons toggle).
- Bouton primaire pleine largeur "Générer l'export".

### Évolutions

- Server function streamée (CSV ou XLSX via SheetJS côté serveur).
- Colonnes : Centre, Atelier, Session, Séance, Date, Prestataire, Rôle,
  Durée, Statut, Tarif horaire, Total HT.
