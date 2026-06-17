---
title: Player Preferences
order: 87
description: Player-adjustable preferences and their default values
---


# Player Preferences

Player preferences are settings that players can adjust during gameplay through the settings screen. These values are saved to storage and persist between sessions.

## Setting Default Preferences

Set default preferences in your `options.js`:

```javascript
monogatari.preferences({
    'Language': 'English',
    'Volume': {
        'Music': 1,
        'Voice': 1,
        'Sound': 1,
        'Video': 1
    },
    'TextSpeed': 20,
    'AutoPlaySpeed': 5
});
```

## All Preferences

| Preference | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `Language` | `string` | `'English'` | UI language / game language for multi-language games |
| `Volume.Music` | `number` | `1` | Music volume (0.0 to 1.0) |
| `Volume.Voice` | `number` | `1` | Voice volume (0.0 to 1.0) |
| `Volume.Sound` | `number` | `1` | Sound effects volume (0.0 to 1.0) |
| `Volume.Video` | `number` | `1` | Video volume (0.0 to 1.0) |
| `Resolution` | `string` | `'800x600'` | Window resolution (Electron only) |
| `TextSpeed` | `number` | `20` | Typewriter animation speed (lower = faster) |
| `AutoPlaySpeed` | `number` | `5` | Seconds to wait before auto-advancing |

## Accessing Preferences

### Get a Preference

```javascript
// Get current language
const language = monogatari.preference('Language');

// Get music volume
const musicVol = monogatari.preference('Volume').Music;
```

### Set a Preference

```javascript
// Set language
monogatari.preference('Language', 'Español');

// Set text speed
monogatari.preference('TextSpeed', 30);

// Set volume
monogatari.preference('Volume', {
    'Music': 0.8,
    'Voice': 1,
    'Sound': 0.5,
    'Video': 1
});
```

## Volume Settings

Volume values range from `0.0` (muted) to `1.0` (full volume):

```javascript
monogatari.preferences({
    'Volume': {
        'Music': 0.7,    // 70% volume
        'Voice': 1.0,    // 100% volume
        'Sound': 0.5,    // 50% volume
        'Video': 0.8     // 80% volume
    }
});
```

### Volume Categories

| Category | Controls |
| :--- | :--- |
| `Music` | Background music played with `play music` |
| `Voice` | Voice audio played with `play voice` |
| `Sound` | Sound effects played with `play sound` |
| `Video` | Video audio when playing videos |

## Text Speed

The `TextSpeed` preference controls how fast the typewriter animation displays text. Lower values mean faster text:

```javascript
monogatari.preferences({
    'TextSpeed': 20  // Default speed
});
```

| Value | Effect |
| :--- | :--- |
| `1` | Very fast (nearly instant) |
| `20` | Default speed |
| `50` | Slow, dramatic pacing |

## Auto-Play Speed

The `AutoPlaySpeed` preference controls how long the game waits after text is fully displayed before automatically advancing:

```javascript
monogatari.preferences({
    'AutoPlaySpeed': 5  // 5 seconds
});
```

| Value | Effect |
| :--- | :--- |
| `0` | No wait (advances immediately after text) |
| `5` | Default (5 second pause) |
| `10+` | Longer pause for slower readers |

> [!NOTE]
> `AutoPlaySpeed` is capped by the settings screen's Auto Play Speed slider. The
> upper limit (`MaxAutoPlaySpeed`) is read at runtime from that slider's `max`
> attribute (60 by default) — it is not a game setting you configure in
> `options.js`. To raise the cap, change the slider's `max` in the settings
> screen component.

## Language Preference

For multi-language games, this determines which script version is used:

```javascript
monogatari.preferences({
    'Language': 'Español'
});
```

See [Internationalization](game-configuration/internationalization.md) for multi-language setup.

## Resolution (Electron)

For desktop builds using Electron, this sets the window resolution:

```javascript
monogatari.preferences({
    'Resolution': '1280x720'
});
```

> [!NOTE]
> This setting only affects Electron desktop builds. It has no effect on web-deployed games.

## Settings Screen

Players can adjust these preferences through the built-in settings screen:

- **Audio sliders** - Adjust Music, Voice, and Sound volumes
- **Text Speed slider** - Adjust typewriter animation speed
- **Auto Play Speed slider** - Adjust auto-advance timing
- **Language dropdown** - Select UI/game language (if multi-language enabled)
- **Resolution dropdown** - Select window size (Electron only)

## Programmatic Updates

You can update preferences based on game events:

```javascript
// In your script, use a function
monogatari.script({
    'Start': [
        // Player chooses "quiet mode"
        function() {
            monogatari.preference('Volume', {
                'Music': 0.3,
                'Sound': 0.3,
                'Voice': 1,
                'Video': 0.5
            });
            return true;
        },
        'The audio has been adjusted for quiet mode.',
        'end'
    ]
});
```

## Persistence

Preferences are automatically:
- Saved to storage when changed
- Loaded when the game starts
- Synced with the settings screen UI

## Related

- [Game Configuration](game-configuration/) - Engine settings
- [Internationalization](game-configuration/internationalization.md) - Multi-language setup
- [Saving](game-configuration/saving.md) - Save system configuration
