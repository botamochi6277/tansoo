import { categoryOf } from './clothTypes';
import { effectiveFormality } from './formality';
import type { ClothItem } from './types';

export interface Filters {
  text: string;
  categories: string[];
  colors: string[];
  brands: string[];
  /** formality scores as strings, e.g. "-2", "1" */
  formalities: string[];
}

export const NO_FILTERS: Filters = { text: '', categories: [], colors: [], brands: [], formalities: [] };

export const isFiltering = (f: Filters): boolean =>
  f.text.trim() !== '' || f.categories.length > 0 || f.colors.length > 0 || f.brands.length > 0 || f.formalities.length > 0;

/** An empty list means "any"; selected values within one list are OR-ed, lists are AND-ed. */
export function filterItems(items: ClothItem[], f: Filters): ClothItem[] {
  const q = f.text.trim().toLowerCase();
  return items.filter((it) => {
    if (f.categories.length && !f.categories.includes(categoryOf(it.type))) return false;
    if (f.colors.length && !f.colors.includes(it.color)) return false;
    if (f.brands.length && !f.brands.includes(it.brand)) return false;
    if (f.formalities.length && !f.formalities.includes(String(effectiveFormality(it)))) return false;
    if (q) {
      const hay = [it.name, it.brand, it.type, it.color, it.size].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
