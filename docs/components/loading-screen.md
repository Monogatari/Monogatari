---
title: Loading Screen
order: 62
description: The screen showing the asset preloading progress
---


# Loading Screen

## Description

```markup
<loading-screen></loading-screen>
```

This is the first screen that will be shown if Asset Preloading is enabled on the game's configuration.

**Component tag:** loading-screen

## Component Structure

The following code is this component's initial HTML structure. Remember you can change this structure any time by using the [`template()` component built-in function](../building-blocks/components/built-in-functions.md#get-or-modify-the-html-structure).

```markup
<loading-screen data-component="loading-screen" data-screen="loading">
    <div data-content="wrapper">
        <h2 data-string="Loading" data-content="title">Loading</h2>
        <progress value="0" max="100" data-content="progress"></progress>
        <small data-string="LoadingMessage" data-content="message">Wait while the assets are loaded.</small>
    </div>
</loading-screen>
```

## State

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `progress` | `number` | `0` | How many assets have finished loading so far. Each `assetLoaded` event increments it, and the new value is written to the `<progress>` element's `value`. |

> [!NOTE]
> Being a screen component, the loading-screen also inherits the base `open` state, which is set to `true` when preloading starts and back to `false` when it finishes.

## Props

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `max` | `number` | `0` | The total number of assets queued for preloading. Each `assetQueued` event increments it, and the new value becomes the `<progress>` element's `max`. |

## Preload Events

The loading screen is driven entirely by the preload events the engine emits while it loads the assets declared in your game's [Asset Preloading](../configuration-options/game-configuration/asset-preloading.md) configuration:

| Event | Effect on the loading screen |
| :--- | :--- |
| `willPreloadAssets` | Opens the screen (`open` → `true`). |
| `assetQueued` | Increments `max` (one more asset to load). |
| `assetLoaded` | Increments `progress` (one more asset finished). |
| `didPreloadAssets` | Closes the screen (`open` → `false`). |

For the full list of engine events and how to listen for them yourself, see [Events](../advanced-monogatari-development/events.md).
