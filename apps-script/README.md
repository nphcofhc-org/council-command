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
4. Run `setupSheets()` once (authorize when prompted).
5. Deploy as Web App:
   - `Deploy` -> `New deployment` -> `Web app`
   - Execute as: `Me`
   - Who has access: `Anyone` (or restrict if you want)
6. Copy the deployment URL.

## Wire The Frontend To It

In `/Users/sirchristopherdemarkus/Desktop/Downloads/Chrome Vault/vault/Vault54membership1/NPHC1/src/app/data/config.ts`:

- Set `DATA_SOURCE` to `"google-sheets"`
- Set `APPS_SCRIPT_URL` to your deployment URL

## Zero Manual Input: Use Google Forms

For tabs you update often (Updates, Events, SignupForms), the simplest workflow is:

1. Create a Google Form for the tab.
2. Set form responses to write into the corresponding sheet tab.
3. Your portal updates automatically because it reads the sheet.

This avoids hand-editing rows while keeping Sheets as your source of truth.

