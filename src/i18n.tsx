import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'ja';

const en = {
  'app.loading': 'Loading…',
  'app.about': 'Tansoo is a closet organizer. Register your clothes, filter them by season, color, and formality, and see your wardrobe in stats. Everything stays in your browser; no server is involved.',
  'tab.items': 'Items',
  'tab.stats': 'Stats',
  'btn.add': 'Add new item',
  'btn.ai': 'Add by your AI',
  'btn.openFile': 'Open file',
  'btn.newFile': 'New file',
  'btn.export': 'Export',
  'btn.import': 'Import',
  'file.linkedTitle': 'Changes are saved to this file',
  'file.reconnect': 'Reconnect {name}',
  'file.saveFailed': 'Save failed: {name}',
  'confirm.import': 'Importing replaces all current items. Continue?',
  'confirm.load': 'Load items from "{name}"? This replaces all current items.',
  'confirm.reload': 'Load items from "{name}"? This replaces the items currently shown.',
  'confirm.delete': 'Delete "{name}"?',
  'err.notDb': 'This file is not a Tansoo database.',
  'err.badFile': 'Could not read that file as a SQLite database.',
  'err.useFile': 'Could not use that file.',
  'err.save': 'Could not save the change: {message}\nTry reloading the page.',
  'footer.github': 'Tansoo on GitHub',
  'toggle.dark': 'toggle dark mode',
  'toggle.lang': 'Switch language',
  'lang.other': '日本語',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.edit': 'edit',
  'common.delete': 'delete',
  'common.none': '(none)',
  'form.edit': 'Edit item',
  'form.add': 'Add item',
  'form.auto': 'auto',
  'form.formalityAuto': 'Calculate automatically from type and color',
  'form.size': 'Size (optional)',
  'form.sizePh': 'e.g. M, 30, 26.5',
  'form.cost': 'Cost (yen)',
  'form.url': 'URL',
  'form.image': 'Image',
  'form.change': 'Change',
  'form.choose': 'Choose image',
  'form.remove': 'Remove',
  'form.imgErr': 'Could not read that image.',
  'col.name': 'Name',
  'col.purchasedDate': 'Purchased',
  'col.brand': 'Brand',
  'col.category': 'Category',
  'col.type': 'Type',
  'col.color': 'Color',
  'col.size': 'Size',
  'col.formality': 'Formality',
  'col.seasons': 'Season',
  'season.spring': 'Spring',
  'season.summer': 'Summer',
  'season.autumn': 'Autumn',
  'season.winter': 'Winter',
  'season.all': 'All year',
  'form.seasonsAuto': 'Choose automatically from type',
  'list.nowSeason': 'This season ({season})',
  'stats.bySeason': 'By season',
  'formality.-2': 'Very casual',
  'formality.-1': 'Casual',
  'formality.0': 'Neutral',
  'formality.1': 'Formal',
  'formality.2': 'Very formal',
  'col.cost': 'Cost (¥)',
  'form.purchasedDate': 'Purchased date',
  'list.empty': 'No items yet. Add your first cloth item.',
  'list.noMatch': 'No items match the filters.',
  'list.tableView': 'table view',
  'list.cardView': 'card view',
  'list.sortBy': 'Sort by',
  'list.sortDir': 'toggle sort direction',
  'list.search': 'Search',
  'list.searchPh': 'name, brand, type…',
  'list.clear': 'Clear',
  'list.count': '{n} of {total} items',
  'stats.empty': 'No data to analyze yet.',
  'stats.items': 'Items',
  'stats.total': 'Total cost',
  'stats.avg': 'Average cost',
  'stats.byBrand': 'By brand',
  'stats.byCategory': 'By category',
  'stats.byType': 'By type',
  'stats.byColor': 'By color',
  'stats.byFormality': 'By formality',
  'stats.formalityMatrix': 'Formality by category (items)',
  'stats.showItems': 'click to show these items',
  'stats.allSeasons': 'All',
  'stats.noItemsSeason': 'No items for this season.',
  'stats.colorsByCategory': 'Colors by category (items)',
  'stats.unspecified': 'Unspecified',
  'ai.title': 'Add by your AI',
  'ai.step1': '1. Copy this prompt',
  'ai.copy': 'Copy prompt',
  'ai.copied': 'Copied',
  'ai.copyFail': 'Could not copy automatically. Select the prompt text and copy it by hand.',
  'ai.step2': '2. Send it to your AI',
  'ai.step2Body':
    'Open your order history page (e.g. UNIQLO) and give it to your AI model (Gemini, GPT, …) together with the prompt. It replies with a list of the items you bought.',
  'ai.step3': "3. Paste the AI's reply",
  'ai.check': 'Check',
  'ai.willAdd': '{items} will be added',
  'ai.add': 'Add {n} items',
  'ai.readFail': 'Could not read the pasted text.',
  'ai.err.noList': 'No JSON list ([ ... ]) found in the pasted text.',
  'ai.err.badJson': 'The pasted text is not valid JSON. Ask the AI to reply with only the JSON list.',
  'ai.err.notList': 'Expected a JSON list of items.',
  'ai.item': 'Item {n}',
  'ai.warn.noName': '{label}: skipped because it has no name.',
  'ai.warn.date': '{label} ({name}): purchase date missing or unreadable, set to today.',
  'ai.warn.type': '{label} ({name}): unknown type "{value}", set to Other.',
  'ai.warn.color': '{label} ({name}): unknown color "{value}", set to Other.',
} as const;

export type Key = keyof typeof en;

const ja: Record<Key, string> = {
  'app.loading': '読み込み中…',
  'app.about': 'Tansoo（タンスー）は服の整理アプリです。持っている服を登録し、季節・色・フォーマル度で絞り込んだり、統計でワードローブを眺めたりできます。データはブラウザ内だけに保存され、サーバーには送信されません。',
  'tab.items': 'アイテム',
  'tab.stats': '統計',
  'btn.add': '新しいアイテムを追加',
  'btn.ai': 'AIで追加',
  'btn.openFile': 'ファイルを開く',
  'btn.newFile': '新規ファイル',
  'btn.export': 'エクスポート',
  'btn.import': 'インポート',
  'file.linkedTitle': '変更はこのファイルに保存されます',
  'file.reconnect': '{name} に再接続',
  'file.saveFailed': '保存に失敗: {name}',
  'confirm.import': 'インポートすると現在のアイテムはすべて置き換えられます。続けますか？',
  'confirm.load': '「{name}」からアイテムを読み込みますか？現在のアイテムはすべて置き換えられます。',
  'confirm.reload': '「{name}」からアイテムを読み込みますか？表示中のアイテムは置き換えられます。',
  'confirm.delete': '「{name}」を削除しますか？',
  'err.notDb': 'このファイルはタンスーのデータベースではありません。',
  'err.badFile': 'このファイルをSQLiteデータベースとして読み込めませんでした。',
  'err.useFile': 'このファイルを使用できませんでした。',
  'err.save': '変更を保存できませんでした: {message}\nページを再読み込みしてみてください。',
  'footer.github': 'GitHubでタンスーを見る',
  'toggle.dark': 'ダークモードの切り替え',
  'toggle.lang': '言語を切り替え',
  'lang.other': 'English',
  'common.cancel': 'キャンセル',
  'common.save': '保存',
  'common.edit': '編集',
  'common.delete': '削除',
  'common.none': '（なし）',
  'form.edit': 'アイテムを編集',
  'form.add': 'アイテムを追加',
  'form.auto': '自動',
  'form.formalityAuto': 'タイプとカラーから自動で計算する',
  'form.size': 'サイズ（任意）',
  'form.sizePh': '例: M, 30, 26.5',
  'form.cost': '価格（円）',
  'form.url': 'URL',
  'form.image': '画像',
  'form.change': '変更',
  'form.choose': '画像を選択',
  'form.remove': '削除',
  'form.imgErr': '画像を読み込めませんでした。',
  'col.name': '名前',
  'col.purchasedDate': '購入日',
  'col.brand': 'ブランド',
  'col.category': 'カテゴリ',
  'col.type': 'タイプ',
  'col.color': 'カラー',
  'col.size': 'サイズ',
  'col.formality': 'フォーマル度',
  'col.seasons': '季節',
  'season.spring': '春',
  'season.summer': '夏',
  'season.autumn': '秋',
  'season.winter': '冬',
  'season.all': '通年',
  'form.seasonsAuto': 'タイプから自動で決める',
  'list.nowSeason': '今の季節（{season}）',
  'stats.bySeason': '季節別',
  'formality.-2': 'とてもカジュアル',
  'formality.-1': 'カジュアル',
  'formality.0': 'ニュートラル',
  'formality.1': 'フォーマル',
  'formality.2': 'とてもフォーマル',
  'col.cost': '価格（¥）',
  'form.purchasedDate': '購入日',
  'list.empty': 'アイテムがありません。最初の服を追加しましょう。',
  'list.noMatch': '条件に合うアイテムがありません。',
  'list.tableView': 'テーブル表示',
  'list.cardView': 'カード表示',
  'list.sortBy': '並び替え',
  'list.sortDir': '昇順・降順の切り替え',
  'list.search': '検索',
  'list.searchPh': '名前、ブランド、タイプ…',
  'list.clear': 'クリア',
  'list.count': '{total}点中 {n}点',
  'stats.empty': '分析するデータがまだありません。',
  'stats.items': 'アイテム数',
  'stats.total': '合計金額',
  'stats.avg': '平均金額',
  'stats.byBrand': 'ブランド別',
  'stats.byCategory': 'カテゴリ別',
  'stats.byType': 'タイプ別',
  'stats.byColor': 'カラー別',
  'stats.byFormality': 'フォーマル度別',
  'stats.formalityMatrix': 'カテゴリ別のフォーマル度（点数）',
  'stats.showItems': 'クリックでアイテムを表示',
  'stats.allSeasons': 'すべて',
  'stats.noItemsSeason': 'この季節のアイテムはありません。',
  'stats.colorsByCategory': 'カテゴリ別のカラー（点数）',
  'stats.unspecified': '未指定',
  'ai.title': 'AIで追加',
  'ai.step1': '1. このプロンプトをコピー',
  'ai.copy': 'プロンプトをコピー',
  'ai.copied': 'コピーしました',
  'ai.copyFail': '自動コピーできませんでした。プロンプトを選択して手動でコピーしてください。',
  'ai.step2': '2. AIに送る',
  'ai.step2Body':
    '購入履歴ページ（例: UNIQLO）を開き、プロンプトと一緒にお使いのAI（Gemini、GPTなど）に渡してください。購入した商品の一覧が返ってきます。',
  'ai.step3': '3. AIの返答を貼り付け',
  'ai.check': '確認',
  'ai.willAdd': '{items}を追加します',
  'ai.add': '{n}点を追加',
  'ai.readFail': '貼り付けたテキストを読み取れませんでした。',
  'ai.err.noList': '貼り付けたテキストにJSONのリスト（[ ... ]）が見つかりません。',
  'ai.err.badJson': '貼り付けたテキストは正しいJSONではありません。JSONのリストだけを返すようAIに伝えてください。',
  'ai.err.notList': 'アイテムのJSONリストが必要です。',
  'ai.item': 'アイテム{n}',
  'ai.warn.noName': '{label}: 名前がないためスキップしました。',
  'ai.warn.date': '{label}（{name}）: 購入日がないか読み取れないため、今日の日付にしました。',
  'ai.warn.type': '{label}（{name}）: 不明なタイプ「{value}」を「その他」にしました。',
  'ai.warn.color': '{label}（{name}）: 不明なカラー「{value}」を「その他」にしました。',
};

const DICT: Record<Lang, Record<Key, string>> = { en, ja };

/** Japanese display names. Stored values stay English so the database is language independent. */
export const JA_TYPES: Record<string, string> = {
  'T-shirt': 'Tシャツ',
  'Long T-shirt': '長袖Tシャツ',
  'Polo shirt': 'ポロシャツ',
  Shirt: 'シャツ',
  Sweatshirt: 'スウェット',
  Knit: 'ニット',
  Sweater: 'セーター',
  Hoodie: 'パーカー',
  Jacket: 'ジャケット',
  Coat: 'コート',
  'Short pants': 'ショートパンツ',
  'Long pants': 'パンツ',
  Jeans: 'ジーンズ',
  Slacks: 'スラックス',
  Sweatpants: 'スウェットパンツ',
  Skirt: 'スカート',
  Underwear: '下着',
  Socks: '靴下',
  Hat: '帽子',
  Bag: 'バッグ',
  Shoes: '靴',
  Scarf: 'スカーフ・マフラー',
  Gloves: '手袋',
  Eyewear: 'サングラス・メガネ',
  Suit: 'スーツ',
  Loungewear: 'ルームウェア',
  'One-piece': 'ワンピース',
  Other: 'その他',
};

export const JA_CATEGORIES: Record<string, string> = {
  Outerwear: 'アウター',
  Tops: 'トップス',
  Bottoms: 'ボトムス',
  Innerwear: 'インナー',
  Accessories: '小物',
  Sets: 'セットアップ',
  Other: 'その他',
};

export const JA_COLORS: Record<string, string> = {
  White: 'ホワイト',
  Black: 'ブラック',
  'Light gray': 'ライトグレー',
  'Dark gray': 'ダークグレー',
  Brown: 'ブラウン',
  Navy: 'ネイビー',
  Beige: 'ベージュ',
  Khaki: 'カーキ',
  Green: 'グリーン',
  Blue: 'ブルー',
  Purple: 'パープル',
  Yellow: 'イエロー',
  Pink: 'ピンク',
  Red: 'レッド',
  Orange: 'オレンジ',
  Silver: 'シルバー',
  Gold: 'ゴールド',
  Other: 'その他',
};

export type Translate = (key: Key, params?: Record<string, string | number>) => string;

export function translator(lang: Lang): Translate {
  return (key, params) =>
    DICT[lang][key].replace(/\{(\w+)\}/g, (_, k: string) => String(params?.[k] ?? `{${k}}`));
}

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translate;
  /** "3 items" / "3点" */
  count: (n: number) => string;
  typeLabel: (name: string) => string;
  categoryLabel: (name: string) => string;
  colorLabel: (name: string) => string;
}

const LANG_KEY = 'tansoo-lang';

function initialLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'en' || v === 'ja') return v;
  } catch {
    /* storage unavailable */
  }
  return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18n>(() => {
    const dictOf = (ja_: Record<string, string>) => (name: string) => (lang === 'ja' ? ja_[name] ?? name : name);
    return {
      lang,
      setLang: (l) => {
        setLangState(l);
        try {
          localStorage.setItem(LANG_KEY, l);
        } catch {
          /* storage unavailable */
        }
      },
      t: translator(lang),
      count: (n) => (lang === 'ja' ? `${n}点` : `${n} item${n === 1 ? '' : 's'}`),
      typeLabel: dictOf(JA_TYPES),
      categoryLabel: dictOf(JA_CATEGORIES),
      colorLabel: dictOf(JA_COLORS),
    };
  }, [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n must be used inside I18nProvider');
  return v;
}
