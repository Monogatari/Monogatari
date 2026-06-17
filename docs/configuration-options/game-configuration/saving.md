---
title: Saving
order: 84
description: Configure save slots and auto-save functionality
---


# Saving

Monogatari provides a flexible save system that allows players to save and load their progress.

## Save Settings

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `Slots` | `number` | `10` | Number of save slots available |
| `SaveLabel` | `string` | `'Save'` | Prefix for save slot storage keys |
| `AutoSaveLabel` | `string` | `'AutoSave'` | Prefix for auto-save slot storage keys |
| `AutoSave` | `number` | `0` | Auto-save interval in minutes (0 = off) |
| `Screenshots` | `boolean` | `false` | Capture the game screen on save and show it as the slot thumbnail (see [Save Slot Screenshots](#save-slot-screenshots)) |

## Number of Save Slots

Control how many save slots are available:

```javascript
monogatari.settings({
    'Slots': 10  // 10 save slots available
});
```

Increase for games where players may want more save points:

```javascript
monogatari.settings({
    'Slots': 20  // 20 save slots
});
```

## Save Slot Prefixes

### Multiple Games on Same Domain

If you host multiple games on the same domain, they will share save data by default. To prevent this, use unique prefixes:

```javascript
// Game 1
monogatari.settings({
    'Name': 'MyFirstGame',
    'SaveLabel': 'Game1_Save',
    'AutoSaveLabel': 'Game1_Auto'
});

// Game 2
monogatari.settings({
    'Name': 'MySecondGame',
    'SaveLabel': 'Game2_Save',
    'AutoSaveLabel': 'Game2_Auto'
});
```

## Auto-Save

### Enabling Auto-Save

Set the `AutoSave` setting to the interval (in minutes) between automatic saves:

```javascript
monogatari.settings({
    'AutoSave': 5  // Auto-save every 5 minutes
});
```

### Disabling Auto-Save

Set to `0` to disable auto-saving (default):

```javascript
monogatari.settings({
    'AutoSave': 0  // Auto-save disabled
});
```

### Auto-Save Behavior

When auto-save is enabled:
- The game saves automatically at the specified interval
- Auto-saves are stored separately from manual saves
- The load screen shows both manual saves and auto-saves
- Auto-saves are labeled with the `AutoSaveLabel` prefix

## Save Slot Screenshots

When the `Screenshots` setting is enabled, Monogatari captures the game screen at the moment a save is created and stores it alongside the save. The [save slot](../../components/save-slot.md) then uses that capture as its preview thumbnail instead of the scene image.

```javascript
monogatari.settings({
    'Screenshots': true  // Capture a screenshot for each save (default: false)
});
```

The capture is stored as a compact JPEG in a dedicated IndexedDB store and is only decoded when a slot is shown, so it doesn't bloat your regular save data. If a capture can't be taken, the slot falls back to the scene image.

### Cross-Origin Assets Require CORS

The screenshot is produced by **inlining every image currently on screen** (backgrounds, characters, images) into the captured frame. Browsers only allow a page to read pixels from images it is permitted to access:

- **Same-origin assets** (served from the same domain as your game) always work.
- **Cross-origin assets** — for example when `AssetsPath.root` points at a CDN or asset host on a different domain — must be served with an `Access-Control-Allow-Origin` response header. Without it, those images can't be inlined and are **captured as black**, even though they display normally during play.

If your screenshots come out black, confirm your asset host sends CORS headers, for example:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

> [!WARNING]
> A service worker that caches cross-origin responses can defeat this even when
> CORS is configured: the first (no-CORS) image load gets cached as an *opaque*
> response, which is then reused for the capture and renders black. Monogatari's
> default `service-worker.js` avoids this by never caching opaque cross-origin
> responses — if you customized yours, make sure it does the same.

## Storage Configuration

Control how and where game data is stored:

```javascript
monogatari.settings({
    'Storage': {
        'Adapter': 'LocalStorage',
        'Store': 'GameData',
        'Endpoint': ''
    }
});
```

### Storage Adapters

| Adapter | Description | Use Case |
| :--- | :--- | :--- |
| `LocalStorage` | Browser's localStorage (default) | Most web games |
| `SessionStorage` | Cleared when browser closes | Temporary/demo games |
| `IndexedDB` | IndexedDB API | Large amounts of data |
| `RemoteStorage` | REST API endpoint | Cloud saves |

### Remote Storage Example

For cloud saves:

```javascript
monogatari.settings({
    'Storage': {
        'Adapter': 'RemoteStorage',
        'Store': 'GameData',
        'Endpoint': 'https://api.mygame.com/saves'
    }
});
```

## Save Data Contents

When a game is saved, Monogatari stores:

- Current label and step position
- All state variables
- All storage variables
- History for all actions
- Player preferences
- Timestamp and slot name

## Programmatic Save/Load

### Saving Programmatically

```javascript
// Save to a specific slot
monogatari.saveTo('Save_1', 'My Save Name');

// Auto-save
monogatari.autoSave();
```

### Loading Programmatically

```javascript
// Load from a slot
monogatari.loadFrom('Save_1');
```

### Checking for Saves

```javascript
// Get all save slots
const saves = monogatari.saves();

// Check if a slot exists
if (saves['Save_1']) {
    console.log('Save exists');
}
```

## Save Slot UI

The save and load screens are provided by built-in components. You can customize them using the template method:

```javascript
// Customize save screen
monogatari.component('save-screen').template(() => {
    return `
        <!-- Your custom template -->
    `;
});
```

## Related

- [Game Configuration](README.md) - All game settings
- [Asset Preloading](asset-preloading.md) - Loading screen configuration
- [Player Preferences](../player-preferences.md) - Player settings
