---
title: Main Screen
order: 63
description: The screen that hosts the main menu and plays the menu's ambient music.
---

# Main Screen

## Description

```markup
<main-screen></main-screen>
```

The main-screen is what players see when the game first loads — it hosts the [Main Menu](main-menu.md) and acts as the backdrop behind it. It's a [screen component](../building-blocks/components/README.md), so like every other screen it has an `open` state and is shown or hidden as the player moves in and out of the menu.

## Structure

The main-screen renders the main menu inside it:

```markup
<main-screen data-component="main-screen">
    <main-menu></main-menu>
</main-screen>
```

You'll rarely change the main-screen itself — to change the buttons it shows, customize the [Main Menu](main-menu.md); to change the look, style `main-screen` and its children with CSS (a full-screen background image is the most common change).

## Main menu music

The main-screen owns the menu's **ambient music**. When it opens it plays the track set in the [`MainScreenMusic`](../configuration-options/game-configuration/README.md) setting, and it stops that track once the player starts the game.

```javascript
monogatari.settings ({
    'MainScreenMusic': 'theme'
});
```

> [!NOTE]
> `MainScreenMusic` is the **id** of a music asset, not a file name. Declare the track
> first — `monogatari.assets ('music', { 'theme': 'theme.ogg' })` — then reference it
> here by its id.

## Related

- [Main Menu](main-menu.md) — The buttons rendered inside this screen.
- [Game Configuration](../configuration-options/game-configuration/README.md) — The `MainScreenMusic` setting.
- [Play Music](../script-actions/play-music.md) — How music assets are declared and played.
