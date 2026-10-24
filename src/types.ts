export interface ClothItem {
  id: number;
  name: string;
  purchasedDate: string; // YYYY-MM-DD
  brand: string;
  type: string;
  color: string;
  cost: number; // yen
  image: string; // data URL, '' if none
  url: string; // product page, '' if none
}

export type NewClothItem = Omit<ClothItem, 'id'>;
