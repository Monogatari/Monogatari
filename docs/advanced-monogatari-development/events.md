---
title: Events
order: 105
description: The engine events you can hook into with monogatari.on() to run your own code.
---

# Events

Monogatari emits events at key moments of its lifecycle. You can listen for any of them with `monogatari.on ()` and run your own code — perfect for analytics, custom UI, debugging, or reacting to the player's progress.

```javascript
// Run a function every time a save file finishes loading
monogatari.on ('didLoadGame', () => {
    console.log ('A game was loaded!');
});
```

By convention, events prefixed with **`will`** fire *before* something happens, and events prefixed with **`did`** fire *after* it.

> [!TIP]
> Register your listeners before calling `monogatari.init ()`, so that early lifecycle
> events like `willInit` and `didSetup` aren't missed.

[TOC]

## Initialization, Setup & Binding

Fired as the engine boots. Initialization wraps the setup and binding steps, so they fire in this order:

| Event | When it fires |
| :--- | :--- |
| `willInit` | Before initialization begins. |
| `willSetup` | Before the engine runs the `setup ()` step of its actions and components. |
| `didSetup` | After setup completes. |
| `willBind` | Before the engine runs the `bind ()` step (wiring up DOM listeners). |
| `didBind` | After binding completes. |
| `didInit` | After initialization finishes — the engine is ready and the first screen is shown. |

Because these events fire *during* `monogatari.init ()`, you have to register their listeners **before** you call it — otherwise they'll have already fired by the time your listener exists:

```javascript
// In main.js, before monogatari.init ()
monogatari.on ('willInit', () => {
    console.log ('Monogatari is about to initialize');
});

monogatari.on ('didInit', () => {
    console.log ('Monogatari is ready and the first screen is showing');
});

monogatari.init ('#monogatari');
```

## Asset Preloading

Fired while Monogatari preloads the assets declared in your game (see [Asset Preloading](../configuration-options/game-configuration/asset-preloading.md)).

| Event | When it fires |
| :--- | :--- |
| `willPreloadAssets` | Before preloading begins. |
| `assetQueued` | Each time an asset is added to the preload queue. Useful for computing a total for a custom progress bar. |
| `assetLoaded` | Each time a single asset finishes loading. The [Loading Screen](../components/loading-screen.md) listens for this to advance its progress bar. |
| `didPreloadAssets` | After every queued asset has loaded. |

## Actions

Fired around every [action](../building-blocks/actions/README.md) as the story plays forward and backward.

| Event | When it fires |
| :--- | :--- |
| `willRunAction` | Before an action applies. |
| `didRunAction` | After an action has applied. |
| `willRevertAction` | Before an action is reverted (when the player rolls back). |
| `didRevertAction` | After an action has been reverted. |

## Game State

Fired whenever the in-game state — the stack of applied actions and the current step — changes.

| Event | When it fires |
| :--- | :--- |
| `willUpdateState` | Before the engine updates its game state. |
| `didUpdateState` | After the game state has been updated. |

## Configuration

Fired when engine configuration changes at runtime via `monogatari.configuration ()`.

| Event | When it fires |
| :--- | :--- |
| `configurationWillUpdate` | Before a configuration object is updated. |
| `configurationDidUpdate` | After a configuration object is updated. |
| `configurationElementWillUpdate` | Before a single configuration element changes. |
| `configurationElementDidUpdate` | After a single configuration element changes. |

## Localization

Fired when the interface is localized to a language (see [Internationalization](../configuration-options/game-configuration/internationalization.md)).

| Event | When it fires |
| :--- | :--- |
| `willLocalize` | Before the UI strings are swapped to the selected language. |
| `didLocalize` | After the UI has been localized. |

## Components

| Event | When it fires |
| :--- | :--- |
| `componentDidMount` | After a [component](../building-blocks/components/README.md) is mounted to the DOM. |
| `componentDidUnmount` | After a component is removed from the DOM. |

## Typing

Fired by the [Type Writer](../components/type-writer.md) as dialog text animates.

| Event | When it fires |
| :--- | :--- |
| `didStartTyping` | When the typewriter starts revealing a line of dialog. |
| `didFinishTyping` | When a line of dialog finishes — whether the animation completed on its own, the player clicked to skip it, or typewriter animation is disabled. |

## Save File Loading

| Event | When it fires |
| :--- | :--- |
| `willLoadGame` | After the player chooses to load a save, but before loading finishes. |
| `didLoadGame` | After a save has fully loaded and all storage variables are set, but before anything is drawn and before the player regains control. |

## Responding to events

A common pattern is reacting to the typewriter or to the player's progress:

```javascript
monogatari.on ('didFinishTyping', () => {
    // e.g. show a custom "click to continue" indicator
});

monogatari.on ('didRunAction', () => {
    // e.g. update an analytics counter for statements seen
});
```

> [!NOTE]
> This list reflects the events the engine currently emits. The `will…` / `did…`
> naming is the rule of thumb: hook `will…` to act just before something happens,
> `did…` to act just after.
