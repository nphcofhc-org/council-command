# Apps Script Backend (Sheets-as-CMS)

This folder contains a drop-in Apps Script you can paste into a Google Spreadsheet to make it behave like a tiny JSON backend.

## What You Get

- `GET ?tab=TabName` -> returns rows as JSON objects (using header row as keys)
- `POST` -> `append`, `upsert`, `delete`, or `replace` rows (JSON body)
- `setupSheets()` -> creates all expected tabs + header rows in one click

## Setup Steps

1. Create (or open) a Google Sheet.
2. `Extensions` -> `Apps Script`
3. Paste `Code.gs` contents into the editor (replace default file).
4. Run `setupSheets()` (authorize when prompted). It is safe to re-run; it won’t wipe existing data.
5. Deploy as Web App:
   - `Deploy` -> `New deployment` -> `Web app`
   - Execute as: `Me`
   - Who has access: `Anyone` (or restrict if you want)
6. Copy the deployment URL.

If you ever want to intentionally wipe everything and recreate headers, run `resetSheets()`.

## Wire The Frontend To It

This portal does not call Apps Script from the browser. Instead, it pulls Sheet data at build time (see `scripts/sync_sheets.mjs`).

Set environment variables in your hosting provider:
- `APPS_SCRIPT_URL` = your Apps Script Web App `/exec` URL
- `APPS_SCRIPT_TOKEN` = your `API_TOKEN` (if set)

To test locally with Sheet content:

```bash
export APPS_SCRIPT_URL="https://script.google.com/macros/s/XXX/exec"
export APPS_SCRIPT_TOKEN="your-token"
npm run build
```

## Zero Manual Input: Use Google Forms

For tabs you update often (Updates, Events, SignupForms), the simplest workflow is:

1. Create a Google Form for the tab.
2. Set form responses to write into the corresponding sheet tab.
3. Your portal updates automatically because it reads the sheet.

This avoids hand-editing rows while keeping Sheets as your source of truth.
