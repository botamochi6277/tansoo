export interface ClothItem {
  id: number;
  name: string;
  purchasedDate: string; // YYYY-MM-DD
  brand: string;
  type: string;
  color: string;
  size: string; // optional, '' if none (e.g. M, 30, 26.5)
  cost: number; // yen
  image: string; // data URL, '' if none
  url: string; // product page, '' if none
}

export type NewClothItem = Omit<ClothItem, 'id'>;
