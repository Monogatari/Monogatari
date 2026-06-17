# Documentation format

These docs are plain **GitHub-flavored Markdown** — no GitBook, no build step.
They render on GitHub as-is and publish to the restless-dreams site
(`monogatari.io`) with the `restless-dreams` CLI (`docs publish`).

## A page

Every page is a `.md` file that starts with YAML frontmatter:

```markdown
---
title: Characters
order: 11
description: Learn about characters, their properties and how to create them.
---

# Characters

Body content…
```

- **`title`** (required) — the page title used in navigation and as the `<h1>`.
  A file with no `title` is treated as not-a-doc and skipped on publish.
- **`order`** (optional) — position in the sidebar; pages are sorted by it.
- **`description`** (optional) — used for the meta description / SEO.
- **`style`** / **`script`** (optional) — path to a `.css` / `.js` file (relative
  to the repo root) scoped to just this page, for custom design without inline blocks.

The first `#` heading is kept for GitHub readability; the site renders the
frontmatter `title` instead, so it isn't shown twice.

## Structure → URLs

The folder layout *is* the navigation. The file path becomes the page slug:

```
README.md                      → /            (the docs landing, "welcome")
getting-started/README.md      → /getting-started
getting-started/step-1.md      → /getting-started/step-1
building-blocks/characters.md  → /building-blocks/characters
```

- A folder is a **section**; its `README.md` is the section's landing page.
- A section's `README.md` can be a real page or just a short index linking to
  its children.

## Links, images, callouts

- **Links between pages**: use normal relative Markdown links to the `.md` file,
  e.g. `[Characters](../building-blocks/characters.md)`. The importer rewrites
  these to site URLs; on GitHub they just work.
- **Images**: put them in the top-level `assets/` folder and reference them
  relatively, e.g. `![Diagram](../assets/diagram.png)`. The importer uploads
  them to the CDN automatically.
- **Callouts**: GitHub-style alerts —
  `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!DANGER]`.
- **Rich content**: anything a post supports works here — fenced code, tables,
  Mermaid diagrams, math, footnotes, embeds, and inline `<style>`/`<script>`/HTML
  for custom layouts. Fenced code is never rewritten, so you can show `assets/…`
  paths or `.md` links *as examples* safely.

## Versions

Each documentation version is a git branch/tag (`master` = latest). The importer
adds the version prefix when publishing, so files stay version-agnostic — never
hard-code `/v2/…` in links; use relative `.md` links.

## Publishing

Use the `restless-dreams` CLI — no database access, just an API token:

```bash
restless-dreams docs lint .                    # check before you ship
restless-dreams docs publish . --feed v2 --version-group monogatari-docs
```

- **Re-runnable & safe.** `publish` upserts pages by slug, so URLs, comments, and
  analytics survive a re-publish. `--dry-run` previews the changes; `--prune`
  removes pages whose source files you deleted.
- **Assets.** Images are uploaded to the CDN and cached in `assets-manifest.json`
  (committed, keyed by content hash) — re-publishing only uploads what changed.
  Edit an image and keep its name and it still re-uploads (the hash changes).
- **Scaffold** new pages with `docs new <path> --template tutorial|how-to|reference|explanation`
  and sections with `docs new-section <path>` so the format is right by construction.

`scripts/import-docs.ts` remains as a direct-to-database fallback for local bulk runs.
