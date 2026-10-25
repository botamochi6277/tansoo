import { CLOTH_TYPES } from './clothTypes';
import { COLORS } from './colors';
import type { NewClothItem } from './types';

/** The prompt the user sends to their own AI, together with an order history page. */
export function buildPrompt(): string {
  return `I want to register the clothes I bought in a closet app. Read the order history page I give you (open in your browser tool, attached, or pasted below) and list every clothing item purchased on it.

Reply with ONLY a JSON array in a single code block, with no other text. Each element is one purchased item (repeat the element once per unit if the quantity is more than 1) with exactly these keys:

- "name": product name (string)
- "purchasedDate": date of purchase as "YYYY-MM-DD" ("" if unknown)
- "brand": brand or shop name, e.g. "UNIQLO" (string)
- "type": one of ${CLOTH_TYPES.map((t) => `"${t}"`).join(', ')}
- "color": one of ${COLORS.map((c) => `"${c.name}"`).join(', ')}
- "size": size label such as "M" or "30" ("" if unknown)
- "cost": price paid for one unit in yen, as an integer without symbols or commas
- "url": product page URL ("" if unknown)

Choose the closest "type" and "color" from the lists above ("Other" if nothing fits). Do not invent values you cannot see on the page.`;
}

export interface ParseResult {
  items: NewClothItem[];
  warnings: string[];
}

const today = () => new Date().toISOString().slice(0, 10);

const pick = (value: unknown, options: string[]): string | null =>
  options.find((o) => o.toLowerCase() === String(value ?? '').trim().toLowerCase()) ?? null;

function normalizeDate(value: unknown): string | null {
  const m = String(value ?? '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!m) return null;
  const [y, mo, d] = [m[1], m[2].padStart(2, '0'), m[3].padStart(2, '0')];
  return Number(mo) >= 1 && Number(mo) <= 12 && Number(d) >= 1 && Number(d) <= 31 ? `${y}-${mo}-${d}` : null;
}

/** Parse the AI's reply. Tolerates surrounding prose and code fences; fixes up values to the app's lists. */
export function parseAiReply(text: string): ParseResult {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end <= start) throw new Error('No JSON list ([ ... ]) found in the pasted text.');

  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error('The pasted text is not valid JSON. Ask the AI to reply with only the JSON list.');
  }
  if (!Array.isArray(raw)) throw new Error('Expected a JSON list of items.');

  const items: NewClothItem[] = [];
  const warnings: string[] = [];
  raw.forEach((r, i) => {
    const row = (typeof r === 'object' && r !== null ? r : {}) as Record<string, unknown>;
    const label = `Item ${i + 1}`;
    const name = String(row.name ?? '').trim();
    if (!name) {
      warnings.push(`${label}: skipped because it has no name.`);
      return;
    }
    let date = normalizeDate(row.purchasedDate);
    if (!date) {
      warnings.push(`${label} (${name}): purchase date missing or unreadable, set to today.`);
      date = today();
    }
    let type = pick(row.type, CLOTH_TYPES);
    if (!type) {
      warnings.push(`${label} (${name}): unknown type "${String(row.type ?? '')}", set to Other.`);
      type = 'Other';
    }
    let color = pick(row.color, COLORS.map((c) => c.name));
    if (!color) {
      warnings.push(`${label} (${name}): unknown color "${String(row.color ?? '')}", set to Other.`);
      color = 'Other';
    }
    const cost = Math.max(0, Math.round(Number(String(row.cost ?? '').replace(/[^\d.]/g, '')) || 0));
    const url = String(row.url ?? '').trim();
    items.push({
      name,
      purchasedDate: date,
      brand: String(row.brand ?? '').trim(),
      type,
      color,
      size: String(row.size ?? '').trim(),
      cost,
      image: '',
      url: /^https?:\/\//i.test(url) ? url : '',
    });
  });
  return { items, warnings };
}
