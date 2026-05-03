# 03 — Design system

Style "papier / encre". Sobre, professionnel, mid-fi, lisible, dense mais
respirant. **Pas d'emoji, pas de gradient, pas d'icône superflue.**

Source de vérité : `src/styles.css`.

## Tokens couleur (oklch)

Tous les tokens sont définis dans `:root` et exposés via `@theme inline`
pour être utilisables comme classes Tailwind (`bg-paper`, `text-ink-500`…).

### Palette neutre "encre sur papier"

| Token | Valeur | Usage |
| --- | --- | --- |
| `--paper` | `oklch(98.2% .005 90)` | Fond global de l'app |
| `--ink-50` | `oklch(96.4% .005 90)` | Hover doux, fond cellule calendrier |
| `--ink-150` | `oklch(92% .005 90)` | Bordures fines, séparateurs |
| `--ink-200` | `oklch(86% .006 90)` | Bordures inputs |
| `--ink-300` | `oklch(76% .007 90)` | Focus ring |
| `--ink-400` | `oklch(60% .008 90)` | Texte tertiaire, placeholders |
| `--ink-500` | `oklch(45% .008 90)` | Texte secondaire |
| `--ink-700` | `oklch(28% .008 90)` | Texte body fort |
| `--ink-900` | `oklch(15% .008 270)` | Texte primaire, boutons primaires |
| `--card` | `oklch(100% 0 0)` | Surface des cartes |
| `--sidebar` | `oklch(99% .003 90)` | Fond sidebar desktop |

### Accent (corail terracotta)

| Token | Usage |
| --- | --- |
| `--accent` | Couleur d'accent principale (badges actifs, focus de marque) |
| `--accent-soft` | Fond doux d'un badge ou d'une cellule "aujourd'hui" |
| `--accent-ink` | Texte sur fond `accent-soft`, liens d'action |

### Statuts (5 familles)

Chaque statut a un trio `bg / border / ink` :

| Statut | Token base | Sémantique |
| --- | --- | --- |
| `s-empty` | gris/papier | "Aucun prestataire" |
| `s-pending` | jaune/ocre | "En attente" |
| `s-confirmed` | vert | "Confirmé / Disponible" |
| `s-refused` | rouge | "Refusé / Bloqué" |
| `s-override` | violet | "Forcé par admin" |

Exemple : `bg-s-confirmed-bg border-s-confirmed-border text-s-confirmed-ink`.

### Règle d'usage

**Ne jamais écrire `text-white`, `bg-black`, `bg-blue-500` etc. en composant.**
Toujours passer par les tokens ci-dessus. Si une nouvelle couleur métier
émerge, l'ajouter d'abord dans `src/styles.css` et `@theme inline`.

## Typographie

- **Police** : Inter (variable, system fallback). Définie via `--font-sans`.
- **Features** : `cv02 cv03 cv04 cv11` (chiffres et `i` plus lisibles), antialias.
- **Échelle** :

| Taille | Token | Usage |
| --- | --- | --- |
| 10/11 | — | Tooltip, mention, captions |
| 11 | `text-t-xs` | Labels minuscule (`UPPERCASE TRACKING-WIDER`) |
| 12 | — | Sous-titres, métadonnées |
| 13 | `text-t-sm` | Body courant |
| 14 | `text-h-sm` | Titres de carte, items list |
| 15 | `text-h-md` | Titres de section |
| 18 | `text-h-lg` | Titres de modal |
| 22 | `text-h-xl` | Titre `/account` |
| 24 | `text-h-2xl` | Titre principal d'écran (`<h1>`) |
| 40-56 | inline | Hero landing uniquement |

- **Headings** (`h1..h4`) : `font-weight: 600`, `letter-spacing: -0.01em`.

## Composants standards (style)

### Boutons

| Variante | Style |
| --- | --- |
| **Primaire** | `h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700` |
| Secondaire | `h-9 px-3 rounded-md border border-ink-200 text-[13px] hover:bg-ink-50` |
| Tertiaire (lien) | `text-[12px] text-accent-ink hover:underline` |
| Icône carrée | `h-8 w-8 grid place-items-center rounded-md border border-ink-200 hover:bg-ink-50` |
| Disabled | ajouter `disabled:opacity-40 disabled:cursor-not-allowed` |

Hauteurs standard : **h-8 (32px)** pour barres d'actions, **h-9 (36px)** pour
formulaires, **h-10 (40px)** pour boutons hero/login.

### Inputs

```html
<input
  className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]
             focus:outline-none focus:ring-2 focus:ring-ink-300" />
```

Pour `<textarea>` : remplacer `h-9` par `py-2`. Toujours wrapper dans un
`<label>` avec `<span className="block text-[12px] text-ink-500 mb-1">…</span>`.

### Cartes

```html
<div className="rounded-lg border border-ink-150 bg-card p-4">…</div>
<!-- ou rounded-xl pour une carte principale d'écran -->
```

### Badges / pastilles

```html
<span className="text-[11px] bg-ink-50 border border-ink-150 rounded-full px-2 py-0.5">…</span>
```

Pour un badge accent :
```html
<span className="text-[11px] text-accent-ink bg-accent-soft border border-accent/30 rounded-full px-2.5 py-1">…</span>
```

### Header de page

Pattern récurrent en haut de chaque écran :

```tsx
<header className="mb-5 flex items-end justify-between gap-3 flex-wrap">
  <div>
    <h1 className="text-[24px] font-semibold tracking-tight">Titre</h1>
    <p className="text-[13px] text-ink-500 mt-1">Sous-titre / compteur</p>
  </div>
  <button className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">
    + Action principale
  </button>
</header>
```

### Tabs

Underline simple, pas de pill :

```tsx
<div className="flex gap-1 mb-5 border-b border-ink-150">
  {tabs.map(t => (
    <button
      onClick={() => setTab(t.id)}
      className={`relative px-3 py-2 text-[13px] font-medium ${active ? "text-ink-900" : "text-ink-400 hover:text-ink-700"}`}>
      {t.label}
      {active && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-ink-900" />}
    </button>
  ))}
</div>
```

### Toggle bicolore (Semaine / Mois, etc.)

```tsx
<div className="inline-flex rounded-md border border-ink-200 bg-card overflow-hidden">
  {options.map(o => (
    <button className={`px-3 h-8 text-[12px] font-medium ${active ? "bg-ink-900 text-paper" : "text-ink-500 hover:bg-ink-50"}`}>
      {o.label}
    </button>
  ))}
</div>
```

## Layout & responsive

### Container des écrans

```tsx
<div className="px-4 md:px-8 py-6 md:py-8 max-w-[1100px] mx-auto">…</div>
```

`max-w` selon densité :

| Type | max-w |
| --- | --- |
| Formulaire centré | 760 |
| Détail entité | 900 |
| Liste / dashboard | 1000-1100 |
| Calendrier | 1300 |

### Breakpoint clé

Un seul breakpoint significatif : **`md` (768px)**.

- **≥ md** : sidebar fixe à gauche (largeur 240px / `w-60`), contenu en
  `md:ml-60`. Topbar et tabbar mobiles cachées.
- **< md** : topbar fixe en haut (h-12), tabbar fixe en bas (icônes + label),
  contenu en `pt-12 pb-16`.

Drawers (`SideDrawer`) :
- desktop : panneau latéral droit (largeur 420px par défaut, modifiable),
  hauteur pleine.
- mobile : full-width, sticky bottom-aligned ; le drawer "BookingDrawer" du
  calendrier est en `fixed bottom-4 left-4 right-4` sur mobile.

## Animations

Définies dans `src/styles.css` :

```css
@keyframes drawer-in        { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes drawer-overlay-in { from { opacity: 0; } to { opacity: 1; } }
.drawer-panel   { animation: drawer-in 200ms cubic-bezier(.32,.72,0,1); }
.drawer-overlay { animation: drawer-overlay-in 200ms ease-out; }
```

Pas d'autre animation. Pas de framer-motion installé.

## Accessibilité

- Labels `<label>` toujours liés aux inputs.
- `aria-label` sur les boutons icône (`×`, navigation calendrier).
- `aria-expanded` sur les accordéons.
- `aria-hidden` sur les pastilles décoratives.
- `title` (tooltip natif) sur les cellules calendrier denses.
- Focus ring visible : `focus:ring-2 focus:ring-ink-300`.

## Conventions code (UI)

- Utiliser `cn()` (`src/lib/utils.ts`) pour combiner classes conditionnelles.
- Les composants UI shadcn (`src/components/ui/`) sont disponibles mais
  **peu utilisés** ici — on préfère du Tailwind direct stylé avec les tokens
  pour rester cohérent avec le design system papier/encre. Si shadcn est
  utilisé, customiser les variants pour respecter les tokens.
- Pas d'icônes `lucide-react` importées : SVG inline minimaliste (1.6 stroke,
  rounded), exemple :

```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
     strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
  <path d="M12 5v14M5 12h14" />
</svg>
```
