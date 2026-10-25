# Tansoo/タンスー

_Tansoo_ is a simple client-side application to organize clothes.

This application is developed with React, TypeScript, Vite, MUI, and SQLite ([sql.js](https://github.com/sql-js/sql.js)). There is no server; everything runs in the browser.

## Features

A user can

1. register, edit, and delete cloth items, or add many at once from an order history page with [your AI](#add-by-your-ai)
1. browse the items as compact cards (default) or as a table, sorted by any column
1. filter the items by free-text search, category, color, and brand
1. analyze stats (item count, total/average cost, a stacked bar chart of colors by category, and breakdowns by brand, category, type, and color)
1. switch between light and dark mode (follows the system setting by default)
1. switch the display language between English and Japanese (follows the browser language by default; type, category, and color names are translated for display only, the stored data stays language independent)
1. keep the data in a `.sqlite` file, or export/import it

## Cloth item properties

- name
- purchased date
- brand (e.g. Uniqlo, GU, muji)
- type (e.g. T-shirt, long pants, coat), chosen with radio buttons
- category (Outerwear, Tops, Bottoms, Innerwear, Accessories, Other); derived from the type, not stored
- color, chosen from a fixed palette
- size (optional, e.g. M, 30, 26.5)
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

## Where the data is stored

The data is a SQLite database that lives in your browser.

- **localStorage**: the database is saved under the key `smart-closet-db` after every change. It belongs to one browser profile and origin, so a different browser or port starts empty, and clearing site data deletes it. Images are downsized to small JPEGs to keep the database small.
- **File on disk (Chrome / Edge)**: use _New file_ or _Open file_ to link a `.sqlite` file through the File System Access API. While linked, every change is also written to that file, and the app offers to reconnect to it on the next visit. The linked file is the source of truth when it is loaded.
- **Export / Import (other browsers)**: where the File System Access API is not available, _Export_ downloads the database as `tansoo-YYYY-MM-DD.sqlite` and _Import_ replaces the current data with a chosen file.

Export a file now and then as a backup.

## Deployment

The app is a static site. The workflow in `.github/workflows/deploy.yml` builds it and deploys it to GitHub Pages on every push to `main`. To enable it, set Settings → Pages → Source to "GitHub Actions" in the repository. The site is served from `https://<user>.github.io/<repo>/`; the workflow passes that sub path to Vite through the `VITE_BASE` environment variable. Data is stored in each visitor's own browser, so a deployed site starts empty.

## Credits

Cloth icons are from [FontBotamochi](https://github.com/botamochi6277/FontBotamochi).
