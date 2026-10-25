export const CLOTH_TYPES = [
  'T-shirt',
  'Long T-shirt',
  'Shirt',
  'Sweater',
  'Hoodie',
  'Jacket',
  'Coat',
  'Short pants',
  'Long pants',
  'Skirt',
  'One-piece',
  'Socks',
  'Underwear',
  'Hat',
  'Bag',
  'Shoes',
  'Other',
];

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
