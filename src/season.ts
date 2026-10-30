import type { Key } from './i18n';
import type { ClothItem } from './types';

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type Season = (typeof SEASONS)[number];

export const seasonKey = (s: Season): Key => `season.${s}` as Key;

const ALL: Season[] = [...SEASONS];

/** Seasons each type is normally worn in. Types not listed are worn all year. */
export const TYPE_SEASONS: Record<string, Season[]> = {
  'T-shirt': ['spring', 'summer', 'autumn'],
  'Long T-shirt': ['spring', 'autumn', 'winter'],
  'Polo shirt': ['spring', 'summer'],
  Shirt: ['spring', 'autumn'],
  Sweatshirt: ['spring', 'autumn', 'winter'],
  Knit: ['autumn', 'winter'],
  Jacket: ['spring', 'autumn', 'winter'],
  Coat: ['autumn', 'winter'],
  Hoodie: ['spring', 'autumn', 'winter'],
  'Short pants': ['summer'],
  'Long pants': ['spring', 'autumn', 'winter'],
  Jeans: ['spring', 'autumn', 'winter'],
  Sweatpants: ['spring', 'autumn', 'winter'],
  Skirt: ['spring', 'summer', 'autumn'],
  Hat: ['spring', 'summer'],
  Scarf: ['autumn', 'winter'],
  Gloves: ['autumn', 'winter'],
  Eyewear: ['spring', 'summer'],
  'One-piece': ['spring', 'summer'],
};

export const autoSeasons = (type: string): Season[] => TYPE_SEASONS[type] ?? ALL;

/** The entered seasons, or the ones for the type when none were entered (seasons is null). */
export const effectiveSeasons = (it: Pick<ClothItem, 'type' | 'seasons'>): Season[] =>
  it.seasons ?? autoSeasons(it.type);

export const sortSeasons = (list: Season[]): Season[] =>
  [...list].sort((a, b) => SEASONS.indexOf(a) - SEASONS.indexOf(b));

// stored as a bit mask: spring = 1, summer = 2, autumn = 4, winter = 8
export const encodeSeasons = (list: Season[]): number =>
  list.reduce((m, s) => m | (1 << SEASONS.indexOf(s)), 0);

export const decodeSeasons = (mask: number): Season[] => SEASONS.filter((_, i) => mask & (1 << i));

const JA: Record<string, Season> = { 春: 'spring', 夏: 'summer', 秋: 'autumn', 冬: 'winter' };

/** Read a list of seasons from an AI reply (English or Japanese names); null if there is nothing usable. */
export function toSeasons(v: unknown): Season[] | null {
  if (!Array.isArray(v)) return null;
  const found = v
    .map((x) => String(x ?? '').trim())
    .map((x) => SEASONS.find((s) => s === x.toLowerCase()) ?? JA[x.replace(/[季]$/, '')])
    .filter((s): s is Season => Boolean(s));
  return found.length ? sortSeasons([...new Set(found)]) : null;
}

/** Season of the year in Japan: spring Mar-May, summer Jun-Aug, autumn Sep-Nov, winter Dec-Feb. */
export function currentSeason(d: Date = new Date()): Season {
  const m = d.getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}
