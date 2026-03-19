# Buildly MVP

Buildly is a lightweight MVP landing page that helps founders validate startup ideas before building.

## What is included

- Interactive landing page preview
- Editable startup idea, ICP, and value proposition fields
- Validation signal simulation (visitors, signups, conversion, best channel, score)
- Voice input support in compatible browsers
- Clear "Generate MVP" recommendation step
- Three built-in demo presets

## Project structure

- `index.html` — single-file MVP landing page

## Run locally

Because this MVP is static, you can open `index.html` directly in a browser.

For a simple local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Source

This MVP was rebuilt from the uploaded Buildly landing page HTML shared in the conversation.

## Next logical steps

- Split UI, logic, and style into separate files
- Add real waitlist capture
- Replace simulated analytics with real events
- Add auth and founder dashboard
- Add MVP generation workflow backed by an API
