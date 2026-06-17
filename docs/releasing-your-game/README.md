---
title: Releasing Your Game
order: 95
---

# Releasing Your Game

Because your Monogatari game is a website, **one project ships everywhere** — the web, desktop and mobile — usually from the very same files. Pick the targets that fit your audience:

| Target | Best for | Build command |
| :--- | :--- | :--- |
| **[Web](web.md)** | The widest reach — playable instantly in any browser, including on [itch.io](https://itch.io). | `bun run build:web` |
| **[Desktop](desktop.md)** | Standalone Windows, macOS and Linux apps. | `bun run build:windows` / `build:mac` / `build:linux` |
| **[Mobile](mobile.md)** | Phones and tablets — installable as an app, with offline play. | *(PWA — no build needed)* |

Most games start with a **[web release](web.md)**: it's the quickest, reaches the most players, and doubles as the basis for the mobile (PWA) experience.

> [!NOTE]
> Looking for the old **Chrome App** target? Google [discontinued it](chrome.md) — release as a [web](web.md) game instead.
