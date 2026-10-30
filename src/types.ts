import type { Season } from './season';

export interface ClothItem {
  id: number;
  name: string;
  purchasedDate: string; // YYYY-MM-DD
  brand: string;
  type: string;
  color: string;
  seasons: Season[] | null; // null = not entered, taken from the type
  formality: number | null; // -2 (very casual) .. 2 (very formal); null = not entered, computed from type and color
  size: string; // optional, '' if none (e.g. M, 30, 26.5)
  cost: number; // yen
  image: string; // data URL, '' if none
  url: string; // product page, '' if none
}

export type NewClothItem = Omit<ClothItem, 'id'>;
