---
title: Web
order: 96
description: Build your game for the web and publish it anywhere — itch.io, a static host, or your own server.
---

# Web

Releasing on the web is the fastest way to get your game in front of players: it runs instantly in any modern browser, on desktop and mobile alike. Here's how to prepare, build and publish it.

## 1. Fill in your metadata

Open `index.html`. Near the top is a block of `<meta>` tags that set your game's title, description, social-sharing preview and icons. Filling them in isn't required for the game to run, but it makes a big difference to how your game looks in search results and when shared. At minimum, set:

```html
<title>Your Game Title</title>
<meta name="description" content="A short, catchy description of your game.">
<meta name="author" content="Your Name">

<!-- Social sharing (Open Graph / Twitter) -->
<meta property="og:title" content="Your Game Title">
<meta property="og:description" content="A short, catchy description.">
<meta property="og:image" content="https://yourdomain.com/preview.png">
<meta property="og:url" content="https://yourdomain.com">

<meta name="theme-color" content="#5bcaff">
```

## 2. Add your icons

The template ships placeholder icons in `assets/icons/` and a `favicon.ico` at the project root. Replace them with your own — keep the same file names and sizes — so your game looks right in browser tabs, on home screens and when installed. A generator like [RealFaviconGenerator](https://realfavicongenerator.net/) can produce every size at once.

## 3. Optimize your assets

Large images and audio are the main thing that slows a game down. Compress your images (tools like [Squoosh](https://squoosh.app/) work well) and keep audio at a reasonable bitrate. Combined with Monogatari's [asset preloading](../configuration-options/game-configuration/asset-preloading.md), this keeps load times short even on slow connections.

## 4. Build

Produce a clean, production copy of your game:

```bash
bun run build:web
```

This writes everything players need into the **`build/web/`** folder — your assets, the engine, your scripts and styles, the service worker and the manifest. That folder *is* your game.

## 5. Publish

Upload the **contents of `build/web/`** wherever you want to host it:

- **[itch.io](https://itch.io)** — the go-to home for visual novels. Zip the contents of `build/web/`, upload it as an **HTML5** project, and tick "This file will be played in the browser" (itch uses `index.html` as the entry point).
- **Static hosts** — [Netlify](https://www.netlify.com/), [Vercel](https://vercel.com/), [Cloudflare Pages](https://pages.cloudflare.com/) and [GitHub Pages](https://pages.github.com/) all serve a folder of files for free over HTTPS.
- **Your own server** — any web server works; the template includes an `.htaccess` for Apache.

> [!TIP]
> Serve your game over **HTTPS** (every host above does). It's required for the service
> worker that powers [offline play and asset caching](../configuration-options/game-configuration/asset-preloading.md).

## Bonus: an installable app

Because the build includes a `manifest.json` and a service worker, your web release is already a **Progressive Web App** — players can install it to their home screen and play it offline, just like a native app. See [Mobile](mobile.md) to make the most of it.
