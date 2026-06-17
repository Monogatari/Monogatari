---
title: "Step 1: Set Up Your Environment"
order: 2
description: Install the three tools you need — a browser, a code editor, and Bun.
---

# Step 1: Set Up Your Environment

A Monogatari game is a web project, so you'll use the same tools web developers use. There are just three, and you only set them up once.

## 1. A modern browser

You already have one. For development we recommend **[Chrome](https://www.google.com/chrome/)** or **[Firefox](https://www.mozilla.org/firefox/)** — their developer tools (press `F12`) let you inspect your game and read error messages while you work. Your finished game will run in any modern browser.

## 2. A code editor

Any text editor works (even Notepad), but a real code editor makes everything easier with syntax highlighting, auto-completion and multi-file editing. If you don't have a favourite yet, **[Visual Studio Code](https://code.visualstudio.com/)** is free, popular and beginner-friendly.

## 3. Bun

Monogatari's project template uses **[Bun](https://bun.sh/)** — a fast JavaScript runtime — to run a local dev server with live reload and to build your game for release. Install it with a single command:

**macOS / Linux**

```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell)**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Then check it's installed:

```bash
bun --version
```

If that prints a version number, you're ready.

> [!TIP]
> You *can* skip Bun and just open `index.html` directly in your browser — the game
> still runs. But the dev server gives you **live reload** (the page refreshes itself
> every time you save) and is needed to test features like asset preloading and
> offline support, so the one-time install is well worth it.

## You're ready

With a browser, an editor and Bun in place, continue to **[Step 2: Get Monogatari running](getting-monogatari.md)**.
