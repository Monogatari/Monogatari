---
title: "Step 2: Get Monogatari Running"
order: 3
description: Get the project template and start the live-reload dev server.
---

# Step 2: Get Monogatari Running

With your [environment ready](step-1-setup-your-environment.md), let's get a real Monogatari game running on your machine.

## 1. Get the template

Get the latest **Monogatari project template** — a complete, ready-to-run project with the engine included and a small sample game already in place:

- The quickest way is to download it from the official website, **[monogatari.io](https://monogatari.io/)**.
- Prefer git? Clone the **[GitHub repository](https://github.com/Monogatari/Monogatari)** and start from its `dist/` folder, which is the same template.

Unzip it somewhere convenient and open the folder in your code editor.

## 2. Start the dev server

Open a terminal **in the project folder** and run:

```bash
bun run serve
```

You'll see:

```text
Dev server running at http://localhost:5100
```

Open **[http://localhost:5100](http://localhost:5100)** in your browser, and the sample game starts. That's it — Monogatari is running.

> [!TIP]
> The dev server has **live reload** built in. Leave it running: every time you save a
> file, the browser refreshes automatically, so you see your changes instantly. You'll
> rarely reload by hand again.

To stop the server, press `Ctrl + C` in the terminal.

> [!NOTE]
> Don't want to use Bun? You can also just open `index.html` directly in your browser.
> The game runs, but you lose live reload, and browser security around the `file://`
> protocol disables service workers (asset preloading and offline support). The dev
> server is the smoother path.

## What you got

After unzipping, your project looks like this:

```text
my-game/
├── assets/              # Your images, audio, fonts and icons
│   ├── characters/
│   ├── scenes/
│   ├── music/
│   └── …
├── engine/              # The Monogatari engine — you don't edit this
├── js/
│   ├── script.js        # Your story: dialog, characters, scenes
│   ├── options.js       # Game & engine settings
│   ├── storage.js       # Your custom save variables
│   └── main.js          # Any extra JavaScript you want to add
├── style/
│   └── main.css         # Your custom styling
├── index.html           # The page that hosts your game
├── service-worker.js    # Powers offline play & asset caching
├── serve.ts             # The dev server you just ran
└── package.json         # Project info & build scripts
```

The next step tours these so you know exactly where to write your game.

## Next steps

- [Step 3: Get familiarized](step-3-get-familiarized.md) — Know where everything lives.
- [Step 4: Make your first visual novel](step-4-make-your-first-visual-novel.md) — Start writing.
