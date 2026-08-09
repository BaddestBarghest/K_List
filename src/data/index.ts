import categoriesJson from "./categories.json";
import type { Category, Kink } from "../types";

const kinkModules = import.meta.glob("./kinks/*.json", { eager: true });

export const builtinCategories = categoriesJson as Category[];
export const builtinKinks = Object.values(kinkModules).flatMap(
  (mod) => (mod as { default: Kink[] }).default,
);
