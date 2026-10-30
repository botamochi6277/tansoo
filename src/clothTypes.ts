/** Category is derived from the type, never stored. */
export const CATEGORIES: { name: string; types: string[] }[] = [
  { name: 'Outerwear', types: ['Jacket', 'Coat', 'Hoodie'] },
  { name: 'Tops', types: ['T-shirt', 'Long T-shirt', 'Polo shirt', 'Shirt', 'Sweatshirt', 'Knit'] },
  { name: 'Bottoms', types: ['Short pants', 'Long pants', 'Jeans', 'Slacks', 'Sweatpants', 'Skirt'] },
  { name: 'Innerwear', types: ['Underwear', 'Socks', 'Loungewear'] },
  { name: 'Accessories', types: ['Hat', 'Scarf', 'Gloves', 'Eyewear', 'Bag', 'Shoes'] },
  { name: 'Sets', types: ['Suit', 'One-piece'] },
  { name: 'Other', types: ['Other'] },
];

export const CLOTH_TYPES = CATEGORIES.flatMap((c) => c.types);

/** Category of a type; unknown (e.g. old free-text) types fall under "Other". */
export const categoryOf = (type: string): string =>
  CATEGORIES.find((c) => c.types.includes(type))?.name ?? 'Other';

// FontBotamochi class names; types without a dedicated glyph use the hanger.
const ICONS: Record<string, string> = {
  'T-shirt': 'fb-t-shirt',
  'Long T-shirt': 'fb-t-shirt-long',
  'Polo shirt': 'fb-shirt',
  Shirt: 'fb-shirt',
  Sweatshirt: 'fb-sweater',
  Sweater: 'fb-sweater', // no longer offered; kept so old items still show an icon
  Knit: 'fb-sweater',
  Hoodie: 'fb-hoodie',
  Jacket: 'fb-jacket',
  Coat: 'fb-coat',
  'Short pants': 'fb-tranks',
  'Long pants': 'fb-pants',
  Jeans: 'fb-pants',
  Slacks: 'fb-pants',
  Sweatpants: 'fb-pants',
  Skirt: 'fb-skirt',
  Socks: 'fb-socks',
  Underwear: 'fb-panty',
  Bag: 'fb-backpack',
  Scarf: 'fb-scarf',
  Gloves: 'fb-glove',
};

export const typeIcon = (type: string): string => ICONS[type] ?? 'fb-hanger';
