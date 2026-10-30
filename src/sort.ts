import { categoryOf } from './clothTypes';
import { effectiveFormality } from './formality';
import { effectiveSeasons, encodeSeasons } from './season';
import type { ClothItem } from './types';

export type SortKey = Exclude<keyof ClothItem, 'id'> | 'category';
export type SortDir = 'asc' | 'desc';

export const SORT_COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: 'name', label: 'Name' },
  { key: 'purchasedDate', label: 'Purchased' },
  { key: 'brand', label: 'Brand' },
  { key: 'category', label: 'Category' },
  { key: 'type', label: 'Type' },
  { key: 'color', label: 'Color' },
  { key: 'size', label: 'Size' },
  { key: 'formality', label: 'Formality' },
  { key: 'seasons', label: 'Season' },
  { key: 'cost', label: 'Cost (¥)', numeric: true },
];

const valueOf = (it: ClothItem, k: SortKey) =>
  k === 'category' ? categoryOf(it.type) : k === 'formality' ? effectiveFormality(it) : k === 'seasons' ? encodeSeasons(effectiveSeasons(it)) : it[k];

export function sortItems(items: ClothItem[], key: SortKey, dir: SortDir): ClothItem[] {
  const sign = dir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const x = valueOf(a, key);
    const y = valueOf(b, key);
    return (typeof x === 'number' ? x - (y as number) : String(x).localeCompare(String(y))) * sign;
  });
}
