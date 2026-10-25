# Tansoo/タンスー

_Tansoo_ is a simple client-side application to organize clothes.

This application is developed with React, TypeScript, Vite, MUI, and SQLite ([sql.js](https://github.com/sql-js/sql.js)). There is no server; everything runs in the browser.

## Features

A user can

1. register, edit, and delete cloth items
1. sort the items by any column
1. analyze stats (item count, total/average cost, breakdowns by brand, category, type, and color)
1. switch between light and dark mode (follows the system setting by default)
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

The types, categories, and colors are defined in `src/clothTypes.ts` and `src/colors.ts`.

## Getting started

```sh
npm install
npm run dev     # start the dev server
npm run build   # type-check and build to dist/
```

## Where the data is stored

The data is a SQLite database that lives in your browser.

- **localStorage**: the database is saved under the key `smart-closet-db` after every change. It belongs to one browser profile and origin, so a different browser or port starts empty, and clearing site data deletes it. Images are downsized to small JPEGs to keep the database small.
- **File on disk (Chrome / Edge)**: use _New file_ or _Open file_ to link a `.sqlite` file through the File System Access API. While linked, every change is also written to that file, and the app offers to reconnect to it on the next visit. The linked file is the source of truth when it is loaded.
- **Export / Import (other browsers)**: where the File System Access API is not available, _Export_ downloads the database as `tansoo-YYYY-MM-DD.sqlite` and _Import_ replaces the current data with a chosen file.

Export a file now and then as a backup.

## Credits

Cloth icons are from [FontBotamochi](https://github.com/botamochi6277/FontBotamochi).

## Add by your AI button

1. user click "Add by your AI" button
1. tansoo show text prompt to send user AI model (e.g. GEMINI, GPT)
1. user copy the prompt
   1, user a open order history page (e.g. UNIQLO page)
1. user run his/her AI model
1. user send the prompt to the AI model
1. the AI model parse the page and show list of purchased items as text output
1. user copy the list
1. user paste the list on text field in tansoo
1. tansoo parse the pasted text and add items
