import { useMemo } from "react";
import { builtinKinks, builtinCategories } from "../data";
import { useAppStore } from "../store/AppStore";
import type { Category, Kink } from "../types";

export function useAllKinks(): Kink[] {
  const { state } = useAppStore();
  return useMemo(() => {
    const merged = [...builtinKinks, ...state.customKinks].map((k) => ({
      ...k,
      order: state.orderOverrides[k.id] ?? k.order,
    }));
    return merged.sort((a, b) => a.order - b.order);
  }, [state.customKinks, state.orderOverrides]);
}

function groupByCategory(kinks: Kink[]): Map<string, Kink[]> {
  const map = new Map<string, Kink[]>();
  for (const kink of kinks) {
    const list = map.get(kink.category) ?? [];
    list.push(kink);
    map.set(kink.category, list);
  }
  return map;
}

export function useKinksByCategory(): Map<string, Kink[]> {
  const kinks = useAllKinks();
  return useMemo(() => groupByCategory(kinks), [kinks]);
}

export function useCategories(): Category[] {
  const { state } = useAppStore();
  return useMemo(() => {
    const merged = [...builtinCategories, ...state.customCategories].map((c) => ({
      ...c,
      order: state.categoryOrderOverrides[c.id] ?? c.order,
    }));
    return merged.sort((a, b) => a.order - b.order);
  }, [state.customCategories, state.categoryOrderOverrides]);
}
