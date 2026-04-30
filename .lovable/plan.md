## Objectif

Dans `/app/availability` (espace référent), aujourd'hui chaque créneau affiche uniquement un nombre (compte de prestataires dispo) avec une intensité de fond. Impossible de savoir **quels rôles** sont disponibles à ce moment. On va ajouter une visualisation des rôles directement dans le calendrier.

## Principe : un point coloré par rôle

Chaque rôle métier reçoit une **pastille de couleur stable** (palette neutre type encre/papier, pas de gradient, pas d'emoji, conforme au style Asanblé) :

```text
Psychologue                       ●  bleu nuit
Éducateur                         ●  vert sapin
Coach sportif                     ●  rouille
Animateur                         ●  ocre
Éducateur sportif                 ●  bordeaux
Éducateur sportif pleine nature   ●  olive
Artiste                           ●  prune
Enseignant                        ●  ardoise
Intervenant numérique             ●  terracotta
```

Mappage centralisé dans `src/lib/roleColors.ts` (nouveau) — réutilisable ailleurs (drawer, fiches prestataires).

## Vue Semaine

Dans chaque cellule horaire :
- Le nombre actuel reste en haut à gauche, plus discret.
- En bas de la cellule, une **rangée de pastilles** (Ø ~6px) — une par rôle dispo à ce créneau, sans doublon. Si plusieurs prestataires du même rôle, la pastille porte un petit `×N` en exposant uniquement si N>1.
- Tooltip natif (`title`) listant `Rôle — Nom prénom` pour chaque dispo (déjà du texte, pas d'icône).

```text
┌──────────────┐
│ 3            │   ← nombre total (texte gris fin)
│              │
│ ● ● ●        │   ← pastilles rôles
└──────────────┘
```

## Vue Mois

Sous le `Xh dispo` actuel, ajouter la même rangée de pastilles agrégeant les rôles couverts dans la journée (uniques). Limite visuelle à 6 pastilles ; au-delà, `+N`.

## Légende

Au-dessus du calendrier, à droite des filtres existants, un bouton discret **« Légende »** ouvrant un petit popover (ou affiché en ligne quand un atelier est sélectionné) listant les rôles avec leur pastille. Quand un atelier est filtré, la légende ne montre que les `requiredRoles` de cet atelier — cohérent avec le filtre déjà en place.

## Filtre atelier — renforcement visuel

Quand un atelier est sélectionné : les pastilles correspondant aux `requiredRoles` sont pleines, les autres rôles dispo (s'il en reste) sont affichés en pastilles **contour seul** pour indiquer qu'ils ne comptent pas pour cet atelier mais existent. (Optionnel — on peut aussi simplement les masquer ; à confirmer.)

## Drawer de réservation

Le drawer en bas à droite (`picked`) liste actuellement le 1er prestataire libre. On va :
- Lister **tous** les prestataires libres au créneau choisi, regroupés par rôle, avec la pastille du rôle devant le nom.
- Le référent clique sur un nom pour cibler la demande à ce prestataire précis.

## Fichiers touchés

- **Nouveau** `src/lib/roleColors.ts` — map `RoleName → { dot, ink, label }` + helper `<RoleDot role="..." />`.
- **Modifié** `src/routes/app.availability.tsx` :
  - Calculer pour chaque cellule la liste des rôles uniques dispo.
  - Rendre les pastilles dans la vue Semaine et la vue Mois.
  - Étendre le drawer pour lister les prestataires groupés par rôle.
  - Ajouter la légende inline / popover.
- **Aucun changement** au modèle de données (`types.ts`, `seed.ts`).

## Hors périmètre

- Pas de changement au filtre rôle déroulant (déjà en place).
- Pas de changement à la vue prestataire (`/pro/dispos`) — elle gère déjà ses couleurs par session.
- Pas de persistance/Supabase dans ce lot.

## Question pour toi

Quand un atelier est sélectionné, pour les rôles **non requis** par cet atelier mais quand même disponibles au créneau : préfères-tu **les masquer** (ne montrer que les rôles utiles) ou **les afficher en contour** (info contextuelle « il y a aussi… ») ? Par défaut je pars sur **masqués** — plus simple et plus lisible.
