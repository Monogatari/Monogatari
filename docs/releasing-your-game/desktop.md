---
title: Desktop App
order: 97
description: Package your game as a standalone Windows, macOS or Linux application.
---

# Desktop App

Monogatari can package your game as a standalone desktop app. The template supports two toolchains out of the box — pick whichever you prefer:

- **[Electron](https://www.electronjs.org/)** — the long-established option, built with `electron-builder`.
- **[Electrobun](https://electrobun.dev/)** — a newer, lighter alternative.

## Install the build tools

Desktop builds need the template's dependencies installed once:

```bash
bun install
```

## Electron

Build for a specific platform:

```bash
bun run build:windows   # Windows installer
bun run build:mac       # macOS app
bun run build:linux     # Linux AppImage
```

The finished installers land in the `build/electron/` folder, ready to distribute.

> [!WARNING]
> Since macOS Catalina, Apple [requires apps to be notarized](https://developer.apple.com/news/?id=12232019a). Notarizing requires a Mac and an [Apple Developer](https://developer.apple.com/programs/) membership (an annual fee). If you'd like to distribute on macOS but can't meet those requirements, reach out — we may be able to notarize your app for you.

## Electrobun

To build with Electrobun instead:

```bash
bun run build:electrobun
```

Or run it in development to preview the desktop app as you work:

```bash
bun run start:electrobun
```

> [!NOTE]
> Configure your app's name, identifier and icons in the template's `package.json`
> (the `build` block, for Electron) and `electrobun.config.ts` (for Electrobun).
