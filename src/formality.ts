import type { Key } from './i18n';
import type { ClothItem } from './types';

export const FORMALITY_LEVELS = [-2, -1, 0, 1, 2] as const;

export const formalityKey = (n: number): Key => `formality.${n}` as Key;

/** "+1", "0", "-2" */
export const signed = (n: number): string => (n > 0 ? `+${n}` : String(n));

/** Clamp and round to a valid score; anything unreadable is neutral. */
export const toFormality = (v: unknown): number => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(-2, Math.min(2, n)) : 0;
};

/** How formal each type is on its own. Types not listed count as 0. */
export const TYPE_FORMALITY: Record<string, number> = {
  Suit: 2,
  Shirt: 1,
  Jacket: 1,
  Coat: 1,
  Slacks: 1,
  'Polo shirt': 0,
  Knit: 0,
  'Long pants': 0,
  Skirt: 0,
  'Long T-shirt': -1,
  Jeans: -1,
  Hat: -1,
  'T-shirt': -2,
  Sweatshirt: -2,
  Hoodie: -2,
  'Short pants': -2,
  Sweatpants: -2,
  Loungewear: -2,
};

/** How much a color pushes the outfit: dark, quiet colors are more formal, loud ones more casual. Colors not listed count as 0. */
export const COLOR_FORMALITY: Record<string, number> = {
  Black: 1,
  Navy: 1,
  Yellow: -1,
  Orange: -1,
  Pink: -1,
  Red: -1,
};

/** Score used when the user did not enter one: type + color, kept within -2..2. */
export const autoFormality = (type: string, color: string): number =>
  toFormality((TYPE_FORMALITY[type] ?? 0) + (COLOR_FORMALITY[color] ?? 0));

/** The entered score, or the automatic one when none was entered (formality is null). */
export const effectiveFormality = (it: Pick<ClothItem, 'type' | 'color' | 'formality'>): number =>
  it.formality ?? autoFormality(it.type, it.color);
