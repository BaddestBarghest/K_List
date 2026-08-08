# K_List — Design Document

## Overview
A public, static kink-sorting app, all on one page. Every kink belongs to a category and can be assigned by the user to one of several personal lists (Favourite, Like, Okay, Dislike, plus any custom lists). An **Unassigned** section (search + category dropdowns) sits above the **Board** — one horizontally-stacked, vertically-scrollable column per list, showing only what's been assigned to it, grouped by category. There is no separate "master list" view; unassigned kinks simply aren't shown on the Board. Everything is client-side — no accounts, no backend — built with React + Ant Design, hosted on GitHub Pages.

## Goals
- Public, browsable, categorized list of kinks — no login required.
- Fast client-side fuzzy search over the Unassigned section.
- Per-kink assignment to a user list (Favourite/Like/Okay/Dislike/custom) via a scrollable dropdown in the Unassigned section; "None" = unassigned (kink has no list, so it doesn't appear on the Board).
- Board: one vertical, scrollable column per list, stacked horizontally, each showing only the kinks assigned to it, grouped by category (collapsible dropdowns), same hover-description behavior as the Unassigned section.
- Edit mode (toggle): add/remove/reorder/recolor lists; create/rename/delete/reorder categories; add custom kinks to any category (builtin or custom); manually reorder kinks via arrows — both in the Unassigned section and within each Board column. All edit-only controls hidden when edit mode is off.
- Export the board as an image; export the save data as an encrypted `.json`. Import that file back in.
- Dark mode, with a user-adjustable accent color.
- Ant Design component library throughout.
- Hosted on GitHub Pages (fully static, no server).

## Non-Goals
- No accounts, login, or server-side persistence — everything lives in `localStorage` plus manual export/import.
- No sharing/merging of one visitor's board with another's (no live multi-user compatibility matching in this scope).
- No drag-and-drop — reordering is via explicit up/down arrows in edit mode.

## Tech Stack
- **Framework:** React (via Vite).
- **UI library:** Ant Design (antd v5) — `ConfigProvider` with `theme.darkAlgorithm` for dark mode and a runtime-configurable `colorPrimary` token for the accent color.
- **Hosting:** GitHub Pages, built via GitHub Actions on push to `main`.
- **State/persistence:** `localStorage` — no backend, no database.
- **Data source:** Builtin kink list shipped as static JSON/TS data bundled into the app; user's custom kinks and list assignments layered on top in `localStorage`.
- **Image export:** `html-to-image` (or `dom-to-image`) to rasterize the Board view to PNG.
- **Encryption:** Web Crypto API (AES-GCM) with a fixed key embedded in the app — encrypt on export / decrypt on import fully automatically, no passphrase prompt. This is obfuscation, not real security (the key ships in the JS bundle, so it only prevents casual editing/viewing of the save file in a text editor) — documented as a known limitation, not a security guarantee.

## Layout

One page, top to bottom:

### 1. Unassigned section
- Search bar (fuzzy) filters across name / category / description.
- Categories rendered as collapsible dropdowns (Ant `Collapse`); only kinks with no list assignment are listed underneath.
- Hovering a kink shows its description (Ant `Tooltip`).
- Each kink has an assignment control: a scrollable dropdown (Ant `Select`) listing all current lists by name; selecting one assigns the kink to it (removing it from this section); "None" clears the assignment (returning it here). This dropdown's options are always alphabetical, independent of the lists' display order on the Board (see Edit mode below) — reordering is a display concern, not a selection concern.

### 2. Board
- One column per list (Favourite, Like, Okay, Dislike, + any custom lists), stacked horizontally in list order, each independently vertically scrollable.
- Within each column, only kinks currently assigned to that list are shown, grouped by category as collapsible dropdowns — same hover-description behavior as the Unassigned section.

### 3. Edit mode (toggle, e.g. Ant `Switch` in the header)
When on, additionally shows:
- **Manage lists:** add a new list (name + color via Ant `ColorPicker`), remove a list, reorder lists (arrows) — the horizontal order of Board columns.
- **Manage categories:** add a new category; rename/delete custom categories (delete blocked while any kink still uses it); reorder any category (builtin or custom) via arrows — a category's order is global, so reordering it in one place (Unassigned or any Board column) reorders it everywhere for consistency.
- **Custom kinks:** add a kink to any category, builtin or custom, via a form with an alphabetically-sorted category picker (name + description); edit/remove custom kinks inline.
- **Reorder kinks:** up/down arrow controls appear on every kink row, in both the Unassigned section and each Board column, to manually reorder kinks within their category. A kink's order is likewise global but only visibly matters within whichever subset (unassigned, or a given list's category) is currently displaying it, so reordering within one list's column doesn't disturb other lists or the Unassigned section.
- **Remove custom kinks:** an X button on custom kinks (builtin kinks can only be unassigned, not removed).
When off, all of the above controls are hidden; the app is browse/search/assign only.

## Data Model (draft)

```ts
interface Category {
  id: string;
  name: string;
  source: "builtin" | "custom";
  order: number;   // global display order; user-reorderable regardless of source
}
// Builtin categories: fixed set shipped in data/categories.json (includes a "custom" bucket
// as one option among many, not a mandatory destination). Custom categories are user-created
// in edit mode, renamable/deletable (delete blocked while any kink still references it).

interface Kink {
  id: string;              // stable id (slug or uuid)
  name: string;
  category: string;        // any category id, builtin or custom
  description?: string;
  source: "builtin" | "custom";
  order: number;            // manual order within its category (global, see Edit mode)
}

interface ListDef {
  id: string;
  name: string;             // user-editable; e.g. "Favourite", "Like", "Okay", "Dislike", or custom
  color: string;             // hex, used for column header / accent
  order: number;             // horizontal position on the Board
}
// Max 6 ListDefs at once (enforced in the "add list" UI); all lists, default or custom, are
// renamable/recolorable/reorderable/removable — no special-cased permanent lists.

// kinkId -> listId | null (null/absent = unassigned)
type Assignments = Record<string, string | null>;
```

`localStorage` schema (draft):
```ts
{
  version: 1,
  customKinks: Kink[],
  lists: ListDef[],
  assignments: Assignments,
  theme: { darkMode: boolean, accentColor: string }
}
```

## Export / Import
- **Image export:** renders the current Board view to a PNG via `html-to-image`, triggers a file download.
- **Data export:** serializes the full `localStorage` state (see schema above) to JSON, encrypts it with the app's built-in key (AES-GCM, no user interaction), downloads as `.json`.
- **Data import:** file picker, decrypts automatically, validates shape/version, then fully replaces current `localStorage` state (with a confirmation prompt before overwriting).

## Decisions
- **Default lists are fully editable:** Favourite/Like/Okay/Dislike can be renamed, recolored, reordered, and removed in edit mode, same as custom lists — no special-cased "permanent" lists. Every list has a user-editable name.
- **Import replaces** current `localStorage` state entirely (no merge). Importing is a destructive, whole-state restore — the UI should confirm before overwriting.
- **Board columns are independently vertically scrollable**, stacked horizontally.
- **Search is fuzzy** (Levenshtein-distance based, not exact substring) over the Master List. Selecting a search result expands the category `Collapse` panel containing that kink and scrolls to / highlights it (brief highlight animation, e.g. Ant `Typography` + a temporary background flash).
- **NSFW/age gate:** first-time visitors see a content-warning / age-confirmation screen before the app content is shown (e.g. a full-screen Ant `Modal` or dedicated route, gating render of the rest of the app; a `localStorage` flag remembers confirmation so it isn't shown every visit).
- **Starter dataset:** authored by us as static JSON — see `data/categories.json` and `data/kinks.json`.
- **List cap:** maximum of 6 lists at once (default 4 + up to 2 custom, or any mix once defaults are editable/removable). No cap on number of kinks.
- **Save encryption:** obfuscation only, via an app-embedded key — no user-facing passphrase. See Tech Stack / Export & Import above for the caveat.

## Deployment
- Vite build output published to GitHub Pages from the `K_List` repo via a GitHub Actions workflow on push to `main`.
