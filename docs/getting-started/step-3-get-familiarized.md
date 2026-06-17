---
title: "Step 3: Get Familiarized"
order: 4
description: A quick tour of the project — what every folder and file is for.
---

# Step 3: Get Familiarized

Before you start writing, here's a quick tour so you know where everything lives. The good news: you'll spend almost all your time in just the `js/` folder.

## Folders

| Folder | What's in it |
| :--- | :--- |
| `assets` | Everything your game shows or plays — images, audio, fonts, icons. Sub-folders like `characters/`, `scenes/`, `music/`, `sounds/` and `voices/` keep it organized. |
| `js` | **Where you make your game** — your story, settings and variables. |
| `style` | The CSS that controls how your game looks. See [Style & Design](../style-and-design/README.md). |
| `engine` | The Monogatari engine itself. You don't edit this — to update Monogatari, you replace this one folder. |

## The `js` folder — where you work

This is the heart of your project.

| File | What it's for |
| :--- | :--- |
| `script.js` | **Your story.** Characters, scenes, dialog and choices all live here. |
| `options.js` | Game and engine settings — title, save slots, languages and more. See [Game Configuration](../configuration-options/game-configuration/README.md). |
| `storage.js` | Your custom variables — the things you want saved in the player's game (their name, affection points, flags…). See [Variables & Data Storage](../building-blocks/data-storage.md). |
| `main.js` | A place for any extra JavaScript you want to add. |

## Root files

| File | What it's for |
| :--- | :--- |
| `index.html` | The page that hosts your game. |
| `service-worker.js` | Powers offline play and [asset preloading](../configuration-options/game-configuration/asset-preloading.md). |
| `manifest.json` | Web-app metadata (name, icons) so your game can be installed to a device. |
| `package.json` | Project info and the build scripts — `serve`, `build:web` and the desktop builds used when [releasing your game](../releasing-your-game/README.md). |
| `serve.ts` | The live-reload dev server you ran in Step 2. |

> [!TIP]
> When you update to a newer version of Monogatari, you only replace the `engine`
> folder — your `js`, `style` and `assets` stay exactly as they are.

## Next steps

Now you know your way around. Time to write — continue to **[Step 4: Make your first visual novel](step-4-make-your-first-visual-novel.md)**.
