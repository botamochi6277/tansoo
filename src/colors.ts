export interface ClothColor {
  name: string;
  /** CSS background: a color or a gradient */
  swatch: string;
}

export const COLORS: ClothColor[] = [
  { name: 'White', swatch: '#ffffff' },
  { name: 'Black', swatch: '#333333' },
  { name: 'Light gray', swatch: '#c9ced6' },
  { name: 'Dark gray', swatch: '#6b7280' },
  { name: 'Brown', swatch: '#7d5c47' },
  { name: 'Navy', swatch: '#2b3a67' },
  { name: 'Beige', swatch: '#dfd1ad' },
  { name: 'Green', swatch: '#a1d85f' },
  { name: 'Blue', swatch: '#4bbbea' },
  { name: 'Purple', swatch: '#ae8cee' },
  { name: 'Yellow', swatch: '#ffd34d' },
  { name: 'Pink', swatch: '#f8b0d8' },
  { name: 'Red', swatch: '#f05a67' },
  { name: 'Orange', swatch: '#fb8340' },
  { name: 'Silver', swatch: 'linear-gradient(135deg, #e6e6e6, #9a9a9a 50%, #dcdcdc)' },
  { name: 'Gold', swatch: 'linear-gradient(135deg, #f3dc79, #c99a12 50%, #f0d15c)' },
  {
    name: 'Other',
    swatch: 'conic-gradient(#ff8a8a, #ffe58a, #a6f0a0, #8ae0ff, #c9a0ff, #ff8a8a)',
  },
];

export const swatchFor = (name: string): string | undefined =>
  COLORS.find((c) => c.name === name)?.swatch;
