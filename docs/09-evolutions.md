# 09 — Évolutions évidentes

Ce fichier liste ce qui doit être fait quand on quitte la maquette pour
brancher un vrai backend. Tout est à la portée de Lovable Cloud (Supabase
managé) + TanStack Server Functions.

## Authentification

- Activer **Lovable Cloud** (login email/password + Google / Apple managés).
- Remplacer `setCurrentUserByRole(...)` par la vraie session :
  ```ts
  const { data: { user } } = await supabase.auth.getUser();
  ```
- Remplacer `currentUserStore` par un loader sur `__root.tsx` qui hydrate
  l'utilisateur côté SSR + un context provider.
- Login → redirige vers `/app | /pro | /admin` selon `user_roles`.
- `/account` change-password : appeler `supabase.auth.updateUser({ password })`,
  exiger le mot de passe actuel via `signInWithPassword` d'abord.
- Pas de signup public en production : la création de compte se fait par
  invitation depuis `/admin/users` ou `/admin/providers` (cf. correction
  utilisateur sur la landing).

## Persistance — schéma Supabase

Une table par entité métier (cf. [02-data-model](./02-data-model.md)) :
`workshops`, `centers`, `providers`, `provider_availability`, `sessions`,
`seances`, `tickets`, `seance_comments`, `profiles`.

Particularités :
- `seances.start` : `timestamp without time zone` (heure GP imposée). Si on
  étend hors GP, ajouter `timezone text not null default 'America/Guadeloupe'`.
- `tickets.status` : enum Postgres (les 9 valeurs).
- `tickets(provider_id, status)` : index pour les requêtes prestataire.
- `provider_availability` : `provider_id uuid pk` + `recurring jsonb` +
  `blocked_dates date[]` (ou table fille).
- `seance_comments` : trigger `updated_at` ; pas de soft delete au début.

## Rôles & RLS

**Critique** — table `user_roles` séparée :

```sql
create type public.app_role as enum ('referent','provider','admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;
```

Fonction `has_role` SECURITY DEFINER (cf. directive globale du projet) :

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;
```

Politiques type :

| Table | Politique select |
| --- | --- |
| `sessions` | référent : `center_id = (select center_id from profiles where id = auth.uid())` ; provider : visible via join sur tickets ; admin : tout |
| `tickets` | provider : `provider_id = auth.uid_provider()` ; référent : `seance_id in (sélection des séances de ses sessions)` ; admin : tout |
| `seance_comments` | mêmes règles que `tickets` (qui peut voir la séance peut commenter) |
| `centers`, `workshops`, `providers` | select pour tous les utilisateurs auth ; insert/update : admin uniquement (`has_role(auth.uid(), 'admin')`) |
| `user_roles` | select : son propre user_id ; insert/update/delete : admin uniquement |

## Server functions

À créer sous `src/server/*.functions.ts` (cf. directive `server-function-authoring`) :

| Fonction | Rôle |
| --- | --- |
| `createSession({ workshopId, sessionNumber, notes })` | crée Session + N Seance + tickets vides |
| `bookProvider({ ticketId, providerId })` | passe `empty → pending`, envoie email |
| `respondTicket({ ticketId, response })` | passe `pending → confirmed | refused`, notifie référent |
| `overrideTicket({ ticketId })` | admin uniquement, passe en `override` |
| `inviteUser({ email, role, centerId?, providerId? })` | admin uniquement, envoie magic link |
| `inviteProvider({ form })` | admin uniquement, crée Provider + UserAccount |
| `updateAvailability({ recurring, exceptions })` | provider uniquement |
| `addComment({ seanceId, body })` | tout participant à la séance |
| `exportAccounting({ from, to, centerId?, providerId?, format })` | admin uniquement, streame CSV/XLSX |

Toutes avec `inputValidator` Zod.

## Notifications

Email transactionnel (Resend ou Postmark via edge function) :

| Trigger | Destinataire | Sujet |
| --- | --- | --- |
| Ticket `pending` | prestataire | "Nouvelle demande Asanblé — <atelier> le <date>" |
| Ticket `confirmed` | référent | "<prestataire> a accepté la séance N" |
| Ticket `refused` | référent | "<prestataire> a refusé — pensez à réassigner" |
| Rappel J-1 | prestataire + référent | "Demain : <atelier> à <heure>" |
| Invitation utilisateur | nouvel user | "Activez votre compte Asanblé" |
| Mention dans un commentaire | (cible mentionnée) | optionnel, plus tard |

## Realtime

- `seance_comments` : channel Supabase Realtime → rafraîchir le
  `CommentsThread` automatiquement.
- `tickets` : refetch sur changement de statut pour synchroniser le triage
  admin et les écrans référent.

## Audit log

Table `audit_log(id, user_id, action, entity, entity_id, payload jsonb,
created_at)`. Tracer obligatoirement : `overrideTicket`, suppressions,
modifications de rôle, modification des couleurs (`roleColorsStore`).

## Couleurs des rôles

- Persister `role_colors` dans une table `app_settings(key text pk, value jsonb)`.
- Charger une fois côté SSR via loader root et injecter dans
  `roleColorsStore` au mount.
- Édition réservée admin (RLS).

## Exports CSV / XLSX

- Server function streamée (cf. tableau plus haut).
- Format **wall-clock** pour les colonnes "Date séance" (jamais d'UTC dans
  les exports comptables).

## Performance

- Préférer des **loaders TanStack** plutôt que `useStore` côté composant pour
  hydrater au SSR.
- Pagination obligatoire sur `/admin/users`, `/admin/providers`,
  `/app/providers` (>50 items).
- Index Postgres listés dans [02](./02-data-model.md#relations).

## Tests à prévoir

- Unitaires : `seanceStatus`, `isAvail`, `suggestionsForRole`, helpers de
  format.
- Intégration : machines à états (Ticket, Seance dérivée).
- E2E (Playwright) : parcours "Référent crée séance → réserve prestataire →
  prestataire accepte → admin voit la session passer en ready".

## Hors périmètre court terme

- Mode dark.
- Multilingue.
- Application mobile native.
- Paiement / facturation in-app (l'export comptable suffit pour l'instant).
- Signature électronique des conventions.
