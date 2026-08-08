import categoriesJson from "./categories.json";
import kinksJson from "./kinks.json";
import type { Category, Kink } from "../types";

export const builtinCategories = categoriesJson as Category[];
export const builtinKinks = kinksJson as Kink[];
