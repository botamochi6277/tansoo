/** Category is derived from the type, never stored. */
export const CATEGORIES: { name: string; types: string[] }[] = [
  { name: 'Outerwear', types: ['Jacket', 'Coat', 'Hoodie'] },
  { name: 'Tops', types: ['T-shirt', 'Long T-shirt', 'Shirt', 'Sweater'] },
  { name: 'Bottoms', types: ['Short pants', 'Long pants', 'Skirt'] },
  { name: 'Innerwear', types: ['Underwear', 'Socks'] },
  { name: 'Accessories', types: ['Hat', 'Bag', 'Shoes'] },
  { name: 'Other', types: ['One-piece', 'Other'] },
];

export const CLOTH_TYPES = CATEGORIES.flatMap((c) => c.types);

/** Category of a type; unknown (e.g. old free-text) types fall under "Other". */
export const categoryOf = (type: string): string =>
  CATEGORIES.find((c) => c.types.includes(type))?.name ?? 'Other';

// FontBotamochi class names; types without a dedicated glyph use the hanger.
const ICONS: Record<string, string> = {
  'T-shirt': 'fb-t-shirt',
  'Long T-shirt': 'fb-t-shirt-long',
  Shirt: 'fb-shirt',
  Sweater: 'fb-sweater',
  Hoodie: 'fb-hoodie',
  Jacket: 'fb-jacket',
  Coat: 'fb-coat',
  'Short pants': 'fb-tranks',
  'Long pants': 'fb-pants',
  Skirt: 'fb-skirt',
  Socks: 'fb-socks',
  Underwear: 'fb-panty',
  Bag: 'fb-backpack',
};

export const typeIcon = (type: string): string => ICONS[type] ?? 'fb-hanger';
