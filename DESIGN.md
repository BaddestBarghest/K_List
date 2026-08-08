# K_List — Design Document

## Overview
A public, static kink-sorting app. Every kink belongs to a category and can be assigned by the user to one of several personal lists (Favourite, Like, Okay, Dislike, plus any custom lists). Sorting happens in a **Master List** view; a **Board** view shows the results as horizontally-stacked columns, one per list. Everything is client-side — no accounts, no backend — built with React + Ant Design, hosted on GitHub Pages.

## Goals
- Public, browsable, categorized list of kinks — no login required.
- Fast client-side search/filter over the master list.
- Per-kink assignment to a user list (Favourite/Like/Okay/Dislike/custom) via a scrollable dropdown; "None" = unassigned.
- Board view: one vertical, scrollable column per list, stacked horizontally, each showing only the kinks assigned to it, grouped by category (collapsible dropdowns), same hover-description behavior as the master list.
- Edit mode (toggle): add/remove/reorder lists, recolor lists, add/edit custom kinks (single "Custom" category), manually reorder kinks within a category via arrows. All edit-only controls hidden when edit mode is off.
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

## Views

### 1. Master List (browse + sort)
- Search bar filters across name / category / description.
- Categories rendered as collapsible dropdowns (Ant `Collapse`); kinks listed underneath.
- Hovering a kink shows its description (Ant `Tooltip`).
- Each kink has an assignment control: a scrollable dropdown (Ant `Select`) listing all current lists by name; selecting one assigns the kink to it; "None" clears the assignment.
- This is the only place assignment happens.

### 2. Board (sorted result)
- One column per list (Favourite, Like, Okay, Dislike, + any custom lists), stacked horizontally in list order, each independently vertically scrollable.
- Within each column, only kinks currently assigned to that list are shown, grouped by category as collapsible dropdowns — same hover-description behavior as the Master List.
- Unassigned kinks appear in neither column; they're only visible/assignable from the Master List.
- Small screens: columns become horizontally scrollable rather than wrapping/stacking vertically (TBD in implementation, see Open Questions).

### 3. Edit mode (toggle, e.g. Ant `Switch` in the header)
When on, additionally shows:
- **Manage lists:** add a new list (name + color via Ant `ColorPicker`), remove a list, reorder lists (arrows) — the horizontal order of Board columns.
- **Custom kinks:** add/edit kinks under a single fixed "Custom" category (name + description).
- **Reorder kinks:** up/down arrow controls to manually reorder kinks within a category (in the Master List, which then reflects into the Board's per-category ordering).
- **Recolor lists:** change a list's accent color, used for its column header in the Board.
When off, all of the above controls are hidden; the app is browse/search/assign only.

## Data Model (draft)

```ts
interface Kink {
  id: string;              // stable id (slug or uuid)
  name: string;
  category: string;        // category id/name; "custom" for user-added kinks
  description?: string;
  source: "builtin" | "custom";
  order: number;            // manual order within its category
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
