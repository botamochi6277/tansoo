# Tansoo/タンスー

_Tansoo_ is a simple client-side application to organize clothes.

This application is developed with React, TypeScript, Vite, MUI, and SQLite ([sql.js](https://github.com/sql-js/sql.js)). There is no server; everything runs in the browser.

## Features

A user can

1. register, edit, and delete cloth items, or add many at once from an order history page with [your AI](#add-by-your-ai)
1. browse the items as compact cards (default) or as a table, sorted by any column
1. filter the items by free-text search, category, color, formality, season (with a one-click "this season" filter), and brand
1. analyze stats (item count, total/average cost, a stacked bar chart of colors by category and a matrix of formality by category that can be switched by season (the bar segments and matrix cells link to the matching items), and breakdowns by brand, category, type, color, formality, and season)
1. switch between light and dark mode (follows the system setting by default)
1. switch the display language between English and Japanese (follows the browser language by default; type, category, and color names are translated for display only, the stored data stays language independent; the short description of the app shown above the tabs is translated too)
1. keep the data in a `.sqlite` file, or export/import it

## Cloth item properties

- name
- purchased date
- brand (e.g. Uniqlo, GU, muji)
- type (e.g. T-shirt, slacks, coat), chosen with radio buttons
- category, derived from the type and not stored:

  | Category    | Types                                                                  |
  | ----------- | ---------------------------------------------------------------------- |
  | Outerwear   | Jacket, Coat, Hoodie                                                   |
  | Tops        | T-shirt, Long T-shirt, Polo shirt, Shirt, Sweatshirt, Knit             |
  | Bottoms     | Short pants, Long pants, Jeans, Slacks, Sweatpants, Skirt              |
  | Innerwear   | Underwear, Socks, Loungewear                                           |
  | Accessories | Hat, Scarf, Gloves, Eyewear, Bag, Shoes                                |
  | Sets        | Suit, One-piece                                                        |
  | Other       | Other                                                                  |

- color, chosen from a fixed palette
- size (optional, e.g. M, 30, 26.5)
- formality, a score from -2 (very casual) to 2 (very formal); calculated from the type and color unless you enter it. See [Formality and casualness](#formality-and-casualness)
- seasons, the seasons the item is worn in (spring, summer, autumn, winter); taken from the type unless you choose them. See [Seasons](#seasons)
- cost (yen)
- image (optional)
- url (optional, e.g. a product page)

The types, categories, and colors are defined in `src/clothTypes.ts` and `src/colors.ts`; their Japanese names are in `src/i18n.tsx`.

## Getting started

```sh
npm install
npm run dev     # start the dev server
npm run build   # type-check and build to dist/
```

## Add by your AI

Registering many items by hand is tedious, so Tansoo can use an AI model of your choice (e.g. Gemini, GPT) to read your order history. Tansoo itself never talks to an AI; you copy and paste between the two.

1. Click the "Add by your AI" button.
1. Tansoo shows a text prompt. Copy it.
1. Open an order history page (e.g. UNIQLO or GU) and give it to your AI model together with the prompt.
1. The AI reads the page and replies with the purchased items as a JSON list.
1. Copy the reply and paste it into the text field in Tansoo, then click "Check".
1. Tansoo parses the reply and shows a preview with any warnings (for example an unknown color). Click "Add" to register the items.

The prompt is written in the current display language and asks for English type and color names; the pasted reply may use either the English or the Japanese names. Photos are not imported. It has been tried with Gemini on the UNIQLO and GU order pages.

## Formality and casualness

In our everyday lives, we wear both formal and casual clothing. It’s often said that a stylish outfit is one that strikes the right balance between formality and casualness.

For example, if you’re wearing casual blue jeans, pairing them with a jacket and leather shoes can easily make your outfit look stylish.

This app organizes items by assigning them a score based on their level of formality or casualness.

formality score:

| -2          | -1     | 0       | 1      | 2           |
| ----------- | ------ | ------- | ------ | ----------- |
| very casual | casual | neutral | formal | very formal |

In the app, each item has this score (set with a slider in the item form, shown in both views, sortable, and counted in the stats and the formality matrix). If you do not enter one, the score is calculated automatically as the type's score plus the color's score, kept within -2 to 2. For example, Slacks (+1) in Black (+1) gives +2, and a T-shirt (-2) in Black (+1) gives -1. Dark, quiet colors (Black, Navy) add +1 and loud ones (Yellow, Orange, Pink, Red) subtract 1; the scores per type and color are in `src/formality.ts`. When you add items by your AI, the AI may give a score too; if it does not, the automatic one is used.

## Seasons

Japan has four seasons, and what you wear changes with them. Each item has the seasons it is worn in. If you do not choose them, they come from the type: for example a T-shirt is for spring, summer, and autumn, a coat for autumn and winter, short pants for summer only, and underwear or socks for all year. The seasons per type are in `src/season.ts`. In the item form, turn off "Choose automatically from type" to pick them yourself (at least one).

The Items tab has a Season filter, and a "This season" button that filters to the current season (spring is March to May, summer June to August, autumn September to November, winter December to February), which is handy when swapping clothes. The Stats tab shows how many items you have for each season; an item counts once for every season it covers. When you add items by your AI, the AI may give the seasons too (for example a Heattech item for autumn and winter); if it does not, the type's seasons are used.

## Where the data is stored

The data is a SQLite database that lives in your browser.

- **localStorage**: the database is saved under the key `smart-closet-db` after every change. It belongs to one browser profile and origin, so a different browser or port starts empty, and clearing site data deletes it. Images are downsized to small JPEGs to keep the database small.
- **File on disk (Chrome / Edge)**: use _New file_ or _Open file_ to link a `.sqlite` file through the File System Access API. While linked, every change is also written to that file, and the app offers to reconnect to it on the next visit. The linked file is the source of truth when it is loaded.
- **Export / Import (other browsers)**: where the File System Access API is not available, _Export_ downloads the database as `tansoo-YYYY-MM-DD.sqlite` and _Import_ replaces the current data with a chosen file.

Databases saved by an older version of Tansoo are upgraded when they are loaded or imported, so they keep working. Export a file now and then as a backup.

## Deployment

The app is a static site. The workflow in `.github/workflows/deploy.yml` builds it and deploys it to GitHub Pages on every push to `main`. To enable it, set Settings → Pages → Source to "GitHub Actions" in the repository. The site is served from `https://<user>.github.io/<repo>/`; the workflow passes that sub path to Vite through the `VITE_BASE` environment variable. Data is stored in each visitor's own browser, so a deployed site starts empty.

## Credits

Cloth icons are from [FontBotamochi](https://github.com/botamochi6277/FontBotamochi).
