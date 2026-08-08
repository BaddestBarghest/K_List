export interface Category {
  id: string;
  name: string;
  source: "builtin" | "custom";
  order: number;
}

export interface Kink {
  id: string;
  name: string;
  category: string;
  description?: string;
  source: "builtin" | "custom";
  order: number;
}

export interface ListDef {
  id: string;
  name: string;
  color: string;
  order: number;
}

export type Assignments = Record<string, string | null>;

export interface ThemeState {
  darkMode: boolean;
  accentColor: string;
}

export interface AppState {
  version: 1;
  customKinks: Kink[];
  customCategories: Category[];
  lists: ListDef[];
  assignments: Assignments;
  theme: ThemeState;
  ageConfirmed: boolean;
  orderOverrides: Record<string, number>;
  categoryOrderOverrides: Record<string, number>;
}

export const MAX_LISTS = 6;
