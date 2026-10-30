import { CLOTH_TYPES } from './clothTypes';
import { COLORS } from './colors';
import { JA_COLORS, JA_TYPES, type Lang, type Translate } from './i18n';
import { toFormality } from './formality';
import type { NewClothItem } from './types';

const quoted = (list: string[]) => list.map((v) => `"${v}"`).join(', ');

/** The prompt the user sends to their own AI, together with an order history page. */
export function buildPrompt(lang: Lang): string {
  const types = quoted(CLOTH_TYPES);
  const colors = quoted(COLORS.map((c) => c.name));
  if (lang === 'ja') {
    return `購入した服をクローゼットアプリに登録したいです。私が渡す購入履歴ページ（ブラウザで開いている、添付した、または下に貼り付けたもの）を読み取り、そこに載っている衣類の購入商品をすべて一覧にしてください。

返答は、コードブロック1つに入れたJSON配列のみとし、それ以外の文章は書かないでください。配列の各要素は購入した1点を表し（数量が2以上の場合は1点ずつ繰り返してください）、次のキーをちょうど持つオブジェクトにしてください。キー名と選択肢の値は、下に書いたとおり英語のままにしてください。

- "name": 商品名（文字列）
- "purchasedDate": 購入日。"YYYY-MM-DD" 形式（不明なら ""）
- "brand": ブランド名またはショップ名。例: "UNIQLO"（文字列）
- "type": 次のいずれか: ${types}
- "color": 次のいずれか: ${colors}
- "size": "M" や "30" などのサイズ表記（不明なら ""）
- "formality": フォーマル度を -2（よりカジュアル）、-1（カジュアル）、0（ニュートラル）、1（フォーマル）、2（よりフォーマル）の整数で。分からなければ null
- "cost": 1点あたりの支払額。円の整数で、記号やカンマは付けない
- "url": 商品ページのURL（不明なら ""）

"type" と "color" は上のリストから最も近いものを選んでください（当てはまるものがなければ "Other"）。ページに書かれていない値を推測で作らないでください。`;
  }
  return `I want to register the clothes I bought in a closet app. Read the order history page I give you (open in your browser tool, attached, or pasted below) and list every clothing item purchased on it.

Reply with ONLY a JSON array in a single code block, with no other text. Each element is one purchased item (repeat the element once per unit if the quantity is more than 1) with exactly these keys:

- "name": product name (string)
- "purchasedDate": date of purchase as "YYYY-MM-DD" ("" if unknown)
- "brand": brand or shop name, e.g. "UNIQLO" (string)
- "type": one of ${types}
- "color": one of ${colors}
- "size": size label such as "M" or "30" ("" if unknown)
- "formality": integer from -2 (more casual), -1 (casual), 0 (neutral), 1 (formal) to 2 (more formal); null if unsure
- "cost": price paid for one unit in yen, as an integer without symbols or commas
- "url": product page URL ("" if unknown)

Choose the closest "type" and "color" from the lists above ("Other" if nothing fits). Do not invent values you cannot see on the page.`;
}

export interface ParseResult {
  items: NewClothItem[];
  warnings: string[];
}

const today = () => new Date().toISOString().slice(0, 10);

/** Match an English name case-insensitively, or its Japanese display name. */
const pick = (value: unknown, options: string[], ja: Record<string, string>): string | null => {
  const v = String(value ?? '').trim().toLowerCase();
  return options.find((o) => o.toLowerCase() === v || ja[o] === String(value ?? '').trim()) ?? null;
};

function normalizeDate(value: unknown): string | null {
  const m = String(value ?? '').match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!m) return null;
  const [y, mo, d] = [m[1], m[2].padStart(2, '0'), m[3].padStart(2, '0')];
  return Number(mo) >= 1 && Number(mo) <= 12 && Number(d) >= 1 && Number(d) <= 31 ? `${y}-${mo}-${d}` : null;
}

/** Parse the AI's reply. Tolerates surrounding prose and code fences; fixes up values to the app's lists. */
export function parseAiReply(text: string, t: Translate): ParseResult {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end <= start) throw new Error(t('ai.err.noList'));

  let raw: unknown;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error(t('ai.err.badJson'));
  }
  if (!Array.isArray(raw)) throw new Error(t('ai.err.notList'));

  const items: NewClothItem[] = [];
  const warnings: string[] = [];
  raw.forEach((r, i) => {
    const row = (typeof r === 'object' && r !== null ? r : {}) as Record<string, unknown>;
    const label = t('ai.item', { n: i + 1 });
    const name = String(row.name ?? '').trim();
    if (!name) {
      warnings.push(t('ai.warn.noName', { label }));
      return;
    }
    let date = normalizeDate(row.purchasedDate);
    if (!date) {
      warnings.push(t('ai.warn.date', { label, name }));
      date = today();
    }
    let type = pick(row.type, CLOTH_TYPES, JA_TYPES);
    if (!type) {
      warnings.push(t('ai.warn.type', { label, name, value: String(row.type ?? '') }));
      type = 'Other';
    }
    let color = pick(row.color, COLORS.map((c) => c.name), JA_COLORS);
    if (!color) {
      warnings.push(t('ai.warn.color', { label, name, value: String(row.color ?? '') }));
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
      formality: row.formality === null || row.formality === undefined || row.formality === '' || !Number.isFinite(Number(row.formality)) ? null : toFormality(row.formality),
      cost,
      image: '',
      url: /^https?:\/\//i.test(url) ? url : '',
    });
  });
  return { items, warnings };
}
