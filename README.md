# UsefulAF 2.0.2 — GitHub Pages Website

A read-only, table-first resource archive generated from `UsefulAF - Website Version.ods`.

## What's included

- All 17 spreadsheet categories and every populated resource row. The workbook has 1,897 physical rows, including one column-heading row and three completely blank spacer rows; those are handled as formatting, leaving 1,893 populated resource rows.
- Dark cyberpunk styling with cyan, magenta, green, yellow and violet accents.
- Global search across every category, plus category navigation.
- One clickable display for each URL. URLs are not repeated in editable text fields.
- No add, edit or delete controls. Update the ODS spreadsheet, then regenerate/replace the website files.
- Resizable columns and draggable column headings. Column widths and order are remembered in your browser.
- Display settings for text size, row spacing and logo size, with a reset button.
- Automatic website favicon when a resource has a URL, plus a manual logo upload/replace control beside each resource name.

## Publish or update on GitHub Pages

1. Open your UsefulAF repository on GitHub.
2. Open the repository's main **Code** page.
3. Choose **Add file → Upload files**.
4. Open this ZIP on your computer and enter the `UsefulAF-2.0-GitHub-Website` folder.
5. Drag the five files inside that folder (`index.html`, `styles.css`, `app.js`, `data.json`, and `README.md`) into GitHub's upload area. Upload the files themselves, not the containing folder or ZIP.
6. Choose **Commit changes**. If GitHub asks whether to replace existing files, confirm the replacement.
7. Wait a minute or two, then refresh your existing GitHub Pages website. You do not need to create a new repository or change its address.

If Pages is not enabled yet: open **Settings → Pages**, choose **Deploy from a branch**, select your main branch and the `/(root)` folder, then save.

## Updating the database later

The ODS spreadsheet is the master copy. When you update it, the website's `data.json` must be regenerated from that updated ODS and uploaded with the site files. Do not edit the website's data directly in GitHub if you want the spreadsheet to remain authoritative.

## Logos

- The automatic icon is a website favicon derived from the resource's link domain. It is a best-effort site icon, not a guaranteed official game cover/logo.
- Click the small icon next to a resource name to upload or replace an image manually (PNG, JPG or WebP; under 250 KB works best).
- Manual logos and display preferences are saved in that browser only. They are not uploaded to GitHub and will not automatically appear for other visitors. To share a logo with everyone, add the image to the repository and wire its relative path into the data in a future update.

## Notes

- This is a static website; it does not send edits to a server or create a shared online database.
- GitHub Pages repositories configured as public expose the published database to anyone with the site link.
- The site should be opened through GitHub Pages or a local web server, not by double-clicking `index.html` in File Explorer.

## UsefulAF 2.0.1 fine-tuning
- Fixed the Display Settings panel so its show/hide button works reliably.
- Text-size control now scales category/game heading rows too; those yellow headings remain larger and bolder than normal table text.
- Blank-title rows that contain a secondary link are displayed as continuation rows (↳), not as fake “Open resource” entries.
- Repeated identical URLs within a row are displayed only once.
- Category/game heading rows now have their own manual logo upload/replace control and a direct SteamGridDB artwork search link. SteamGridDB's automatic image API requires a user API key, so the site does not silently scrape or guess artwork.
- Removed the “Platforms / Notes” fourth column from the RC & Scale Models & Collectibles website view. The master ODS spreadsheet remains unchanged.

## UsefulAF 2.0.2 refinements
- Removed the duplicate/fallback logo controls from the “Various Shops” subsection and rendered it as a yellow section heading.
- Removed the Yarrlist entry from Useful Websites.
- Removed the read-only explanatory sentence beneath category titles.
- Renamed “NOTEABLE PATREON MECHA PROJECTS” to “NOTEABLE PATREON PROJECTS”.
- Added a visible version number beneath DATABASE ONLINE in the top-right status area. The version is read from `data.json`.
- Removed all “Find Art” buttons. Manual logo upload remains available for game/category headings.
