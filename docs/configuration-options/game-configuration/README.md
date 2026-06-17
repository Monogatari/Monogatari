---
title: Game Configuration
order: 81
---

# Game Configuration

Game settings control how your visual novel behaves. These settings are typically defined in your `options.js` file using `monogatari.settings()`.

## Setting Values

```javascript
// Set multiple settings at once
monogatari.settings({
    'Name': 'My Awesome VN',
    'Version': '1.0.0',
    'AutoSave': 5
});

// Get a specific setting
const gameName = monogatari.setting('Name');

// Set a single setting
monogatari.setting('AutoSave', 10);
```

## All Settings

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `Name` | `string` | `'My Visual Novel'` | Game name used for storage. Don't change after release. |
| `Version` | `string` | `'0.1.0'` | Game version in [semantic versioning](https://semver.org/). |
| `Label` | `string` | `'Start'` | Initial label where the game begins. |
| `Slots` | `number` | `10` | Number of save slots available. |
| `MultiLanguage` | `boolean` | `false` | Enable multi-language support. |
| `LanguageSelectionScreen` | `boolean` | `true` | Show language selection before loading. |
| `MainScreenMusic` | `string` | `''` | Music asset ID to play on main menu. |
| `SaveLabel` | `string` | `'Save'` | Prefix for save slot storage keys. |
| `AutoSaveLabel` | `string` | `'AutoSave'` | Prefix for auto-save slot storage keys. |
| `ShowMainScreen` | `boolean` | `true` | Show main menu on game start. |
| `Preload` | `boolean` | `true` | Enable asset preloading on web. |
| `AutoSave` | `number` | `0` | Auto-save interval in minutes (0 = off). |
| `Screenshots` | `boolean` | `false` | Capture a screenshot when saving, used as the [save slot](../../components/save-slot.md)'s preview background. Cross-origin assets must send CORS headers or they capture as black — see [Saving](saving.md#cross-origin-assets-require-cors). |
| `ServiceWorkers` | `boolean` | `true` | Enable service workers for caching. |
| `AspectRatio` | `string` | `'16:9'` | Aspect ratio for backgrounds. |
| `ForceAspectRatio` | `string` | `'None'` | Force aspect ratio: `'None'`, `'Visuals'`, or `'Global'`. |
| `TypeAnimation` | `boolean` | `true` | Enable typewriter text animation. |
| `NVLTypeAnimation` | `boolean` | `true` | Enable typewriter animation in NVL mode. |
| `NarratorTypeAnimation` | `boolean` | `true` | Enable typewriter animation for narrator. |
| `CenteredTypeAnimation` | `boolean` | `true` | Enable typewriter animation for centered text. |
| `InstantText` | `boolean` | `false` | Reveal each line of dialog instantly instead of animating it letter by letter. |
| `Orientation` | `string` | `'any'` | Mobile orientation: `'any'`, `'portrait'`, or `'landscape'`. |
| `Skip` | `number` | `0` | Skip speed in ms (0 = disabled). |
| `SplashScreenLabel` | `string` | `'_SplashScreen'` | Label for splash screen (if exists). |
| `AllowRollback` | `boolean` | `true` | Allow players to go back in the game. |
| `ExperimentalFeatures` | `boolean` | `false` | Enable experimental/unstable features. |

## Text animation settings

The typewriter (letter-by-letter) animation is controlled by a few related settings that work together. The most important one is `TypeAnimation`, which acts as the global switch — when it's `false`, the type-writer never animates and the per-context settings below have no effect.

| Setting | Default | What it controls |
| :--- | :--- | :--- |
| `TypeAnimation` | `true` | Global on/off switch for the typing animation. When `false`, all dialog appears instantly regardless of the settings below. |
| `NarratorTypeAnimation` | `true` | Whether the narrator's lines animate. |
| `CenteredTypeAnimation` | `true` | Whether the special centered character's lines animate. |
| `NVLTypeAnimation` | `true` | Whether dialog shown in NVL mode animates. |

The per-context settings are only consulted when `TypeAnimation` is enabled — they let you turn the animation *off* for a specific context (the narrator, the centered character, or NVL dialog) while keeping it on everywhere else. Turning a per-context setting on while `TypeAnimation` is `false` does nothing.

```javascript
monogatari.settings ({
    'TypeAnimation': true,           // Animate dialog in general...
    'NarratorTypeAnimation': false   // ...but show the narrator's lines instantly.
});
```

`InstantText` is separate from the animation switches. It changes what happens when a player *finishes* a still-animating line (for example, by clicking while the text is typing):

| Setting | Default | What it controls |
| :--- | :--- | :--- |
| `InstantText` | `false` | When `true`, finishing an in-progress line shows all remaining text instantly and drops non-node formatting. When `false`, finishing instead fast-forwards the animation at the fastest speed while keeping formatting. |

## Assets Path

The `AssetsPath` setting controls where assets are loaded from:

```javascript
monogatari.settings({
    'AssetsPath': {
        'root': 'assets',
        'characters': 'characters',
        'icons': 'icons',
        'images': 'images',
        'music': 'music',
        'scenes': 'scenes',
        'sounds': 'sounds',
        'ui': 'ui',
        'videos': 'videos',
        'voices': 'voices',
        'gallery': 'gallery'
    }
});
```

## Storage Configuration

Control how game data is stored:

```javascript
monogatari.settings({
    'Storage': {
        'Adapter': 'LocalStorage',  // LocalStorage, SessionStorage, IndexedDB, or RemoteStorage
        'Store': 'GameData',        // Storage key/database name
        'Endpoint': ''              // URL for RemoteStorage adapter
    }
});
```

### Storage Adapters

| Adapter | Description |
| :--- | :--- |
| `LocalStorage` | Default. Persists in browser storage. |
| `SessionStorage` | Cleared when page is closed. |
| `IndexedDB` | Uses IndexedDB web API. |
| `RemoteStorage` | Sends data to a REST API endpoint. |

## Detailed Documentation

- [Asset Preloading](asset-preloading.md) - Preloading and caching settings
- [Internationalization](internationalization.md) - Multi-language game setup
- [Saving](saving.md) - Save slots and auto-save configuration
- [Skip Main Menu](skip-menu.md) - Starting directly into the game

## Related

- [Player Preferences](../player-preferences.md) - Player-adjustable settings
- [Split Files](../split.md) - Organizing scripts across multiple files
