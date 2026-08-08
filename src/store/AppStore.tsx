import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { v4 as uuid } from "uuid";
import type { AppState, Category, Kink, ListDef } from "../types";
import { MAX_LISTS } from "../types";
import { builtinKinks } from "../data";

const STORAGE_KEY = "klist:v1";

const DEFAULT_LISTS: ListDef[] = [
  { id: "favourite", name: "Favourite", color: "#eb2f96", order: 0 },
  { id: "like", name: "Like", color: "#52c41a", order: 1 },
  { id: "okay", name: "Okay", color: "#faad14", order: 2 },
  { id: "dislike", name: "Dislike", color: "#8c8c8c", order: 3 },
];

function defaultState(): AppState {
  return {
    version: 1,
    customKinks: [],
    customCategories: [],
    lists: DEFAULT_LISTS,
    assignments: {},
    theme: { darkMode: true, accentColor: "#eb2f96" },
    ageConfirmed: false,
    orderOverrides: {},
    categoryOrderOverrides: {},
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

type Action =
  | { type: "ADD_CUSTOM_KINK"; name: string; category: string; description?: string }
  | { type: "UPDATE_KINK"; id: string; patch: Partial<Pick<Kink, "name" | "description" | "category">> }
  | { type: "DELETE_CUSTOM_KINK"; id: string }
  | { type: "REORDER_KINK"; id: string; direction: "up" | "down"; categoryKinks: Kink[] }
  | { type: "ASSIGN_KINK"; kinkId: string; listId: string | null }
  | { type: "ADD_LIST"; name: string; color: string }
  | { type: "UPDATE_LIST"; id: string; patch: Partial<Pick<ListDef, "name" | "color">> }
  | { type: "DELETE_LIST"; id: string }
  | { type: "REORDER_LIST"; id: string; direction: "up" | "down" }
  | { type: "ADD_CATEGORY"; name: string }
  | { type: "RENAME_CATEGORY"; id: string; name: string }
  | { type: "DELETE_CATEGORY"; id: string }
  | { type: "REORDER_CATEGORY"; id: string; direction: "up" | "down"; categories: Category[] }
  | { type: "SET_THEME"; patch: Partial<AppState["theme"]> }
  | { type: "CONFIRM_AGE" }
  | { type: "REPLACE_STATE"; state: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_CUSTOM_KINK": {
      const maxOrder = state.customKinks.reduce((m, k) => Math.max(m, k.order), -1);
      const kink: Kink = {
        id: uuid(),
        name: action.name,
        category: action.category,
        description: action.description,
        source: "custom",
        order: maxOrder + 1,
      };
      return { ...state, customKinks: [...state.customKinks, kink] };
    }
    case "UPDATE_KINK":
      return {
        ...state,
        customKinks: state.customKinks.map((k) =>
          k.id === action.id ? { ...k, ...action.patch } : k,
        ),
      };
    case "DELETE_CUSTOM_KINK": {
      const { [action.id]: _removed, ...assignments } = state.assignments;
      return {
        ...state,
        customKinks: state.customKinks.filter((k) => k.id !== action.id),
        assignments,
      };
    }
    case "REORDER_KINK": {
      const sorted = [...action.categoryKinks].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((k) => k.id === action.id);
      const swapWith = action.direction === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || swapWith < 0 || swapWith >= sorted.length) return state;
      const a = sorted[idx];
      const b = sorted[swapWith];
      return {
        ...state,
        orderOverrides: { ...state.orderOverrides, [a.id]: b.order, [b.id]: a.order },
      };
    }
    case "ASSIGN_KINK":
      return {
        ...state,
        assignments: { ...state.assignments, [action.kinkId]: action.listId },
      };
    case "ADD_LIST": {
      if (state.lists.length >= MAX_LISTS) return state;
      const maxOrder = state.lists.reduce((m, l) => Math.max(m, l.order), -1);
      const list: ListDef = { id: uuid(), name: action.name, color: action.color, order: maxOrder + 1 };
      return { ...state, lists: [...state.lists, list] };
    }
    case "UPDATE_LIST":
      return {
        ...state,
        lists: state.lists.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l)),
      };
    case "DELETE_LIST": {
      const assignments = { ...state.assignments };
      for (const key of Object.keys(assignments)) {
        if (assignments[key] === action.id) assignments[key] = null;
      }
      return { ...state, lists: state.lists.filter((l) => l.id !== action.id), assignments };
    }
    case "REORDER_LIST": {
      const sorted = [...state.lists].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((l) => l.id === action.id);
      const swapWith = action.direction === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || swapWith < 0 || swapWith >= sorted.length) return state;
      const a = sorted[idx];
      const b = sorted[swapWith];
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === a.id ? { ...l, order: b.order } : l.id === b.id ? { ...l, order: a.order } : l,
        ),
      };
    }
    case "ADD_CATEGORY": {
      const allOrders = [
        ...state.customCategories.map((c) => c.order),
        ...(state.categoryOrderOverrides ? Object.values(state.categoryOrderOverrides) : []),
      ];
      const maxOrder = allOrders.reduce((m, o) => Math.max(m, o), 12);
      const category: Category = { id: uuid(), name: action.name, source: "custom", order: maxOrder + 1 };
      return { ...state, customCategories: [...state.customCategories, category] };
    }
    case "RENAME_CATEGORY":
      return {
        ...state,
        customCategories: state.customCategories.map((c) =>
          c.id === action.id ? { ...c, name: action.name } : c,
        ),
      };
    case "DELETE_CATEGORY": {
      const inUse =
        [...builtinKinks, ...state.customKinks].some((k) => k.category === action.id);
      if (inUse) return state;
      return { ...state, customCategories: state.customCategories.filter((c) => c.id !== action.id) };
    }
    case "REORDER_CATEGORY": {
      const sorted = [...action.categories].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((c) => c.id === action.id);
      const swapWith = action.direction === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || swapWith < 0 || swapWith >= sorted.length) return state;
      const a = sorted[idx];
      const b = sorted[swapWith];
      return {
        ...state,
        categoryOrderOverrides: { ...state.categoryOrderOverrides, [a.id]: b.order, [b.id]: a.order },
      };
    }
    case "SET_THEME":
      return { ...state, theme: { ...state.theme, ...action.patch } };
    case "CONFIRM_AGE":
      return { ...state, ageConfirmed: true };
    case "REPLACE_STATE":
      return action.state;
    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
