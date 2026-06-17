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
