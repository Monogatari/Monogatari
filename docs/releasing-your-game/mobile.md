---
title: Mobile
order: 98
description: Reach phones and tablets — installable as an app, with offline play.
---

# Mobile

Your Monogatari game already runs great on phones and tablets — the interface is responsive out of the box. There are two ways to deliver it.

## The easy way: install as an app (PWA)

Because your [web release](web.md) includes a `manifest.json` and a service worker, it's already a **Progressive Web App**. With no extra tooling, players can:

- **Add it to their home screen** — it gets its own icon and launches full-screen, like a native app. ([How to add a website to the home screen](https://www.howtogeek.com/196087/how-to-add-websites-to-the-home-screen-on-any-smartphone-or-tablet/).)
- **Play offline** — once your [service worker cache](../configuration-options/game-configuration/asset-preloading.md) is set up, the game works without a connection.
- **See a splash screen** on launch, using the icons and colors from your `manifest.json`.

To make this shine, fill in the key `manifest.json` fields:

```json
{
    "short_name": "My Game",
    "name": "My Visual Novel",
    "background_color": "#F7F7F7",
    "theme_color": "#F7F7F7"
}
```

For every available option, see the [Web App Manifest reference](https://developer.mozilla.org/en-US/docs/Web/Manifest).

> [!TIP]
> Encourage players to install your game — a home-screen icon and offline play make it
> feel like a real mobile app, with nothing to download from a store.

## App-store distribution (advanced)

To ship to the Google Play Store or Apple App Store, wrap your built game in a native shell with a tool like [Capacitor](https://capacitorjs.com/) or [Apache Cordova](https://cordova.apache.org/). The approach is the same for both: build your game for the web with `bun run build:web`, point the wrapper at the contents of `build/web/` as its web assets, then follow that tool's instructions to produce an Android or iOS package.

> [!NOTE]
> Publishing to either store requires a developer account — Google's is a one-time fee,
> Apple's is annual — and, for iOS, a Mac to build on.
