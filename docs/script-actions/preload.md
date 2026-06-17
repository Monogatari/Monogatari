---
title: Preload
order: 41
description: Preload assets to ensure smooth playback
---


# Preload

## Description

```text
'preload <type> <asset> [blocking]'
'preload character <id> <sprite> [blocking]'
'preload block <block_id> [blocking]'
```

The preload action allows you to load assets into memory before they are needed. This prevents lag or loading delays during gameplay, ensuring a smooth experience for the player.

**Action ID**: `Preload`

**Reversible**: No (Reverting does nothing)

**Requires User Interaction**: No

## Parameters

| Parameter | Description |
| :--- | :--- |
| `type` | The category of the asset (see [Supported Categories](#supported-categories) below). |
| `asset` | The name/identifier of the asset to preload (as registered in `monogatari.assets()`). |
| `id` | When preloading a character, the character's ID. |
| `sprite` | When preloading a character, the sprite name (as defined in the character's `sprites` object). |
| `block_id` | When using `preload block`, the ID of the defined preload block to load. |
| `blocking` | (Optional) If included, the game will wait for the asset(s) to finish loading before proceeding to the next statement. |

## Supported Categories

### Default Audio Categories (use `audio` loader)
- `music` - Background music tracks
- `sounds` or `sound` - Sound effects
- `voices` or `voice` - Voice clips

### Default Image Categories (use `image` loader)
- `scenes` or `scene` - Scene backgrounds
- `images` or `image` - General images
- `characters` - Character sprites (uses special syntax, see examples)

Note: Singular forms (`sound`, `voice`, `scene`, `image`) are aliases for their plural counterparts.

## Examples

### Preload a single music track
```javascript
'preload music theme_song'
```

### Preload a scene (blocking)
```javascript
'preload scene library blocking'
```

### Preload a sound effect
```javascript
'preload sound explosion blocking'
```

### Preload a character sprite
```javascript
'preload character y happy blocking'
```

### Preload a predefined block of assets
```javascript
'preload block Chapter1'
```

## Preload Blocks

Preload blocks allow you to group multiple assets together to be preloaded at once. These are defined using `monogatari.action('Preload').blocks()`.

### The `default` Block

The `default` block is a **special preload block** that runs automatically during the game's initial loading screen. Assets defined in the `default` block are:

- **Decoded and cached** - Audio is decoded to AudioBuffers, images are pre-decoded for immediate display
- **Loaded before gameplay** - Players see the loading progress bar while these assets load
- **Ready for instant playback** - No delay when first using these assets in-game

```javascript
monogatari.action('Preload').blocks({
    'default': {
        music: ['main_theme', 'menu_music'],
        scenes: ['title_screen', 'chapter1_intro'],
        sounds: ['click', 'notification'],
        characters: {
            'y': ['normal', 'happy', 'sad']
        }
    }
});
```

> [!TIP]
> Use the `default` block for assets needed immediately or frequently throughout the game. For chapter-specific assets, use named blocks and the `preload block` action.

### Default Block vs. Legacy Preloading

| With `default` Block | Without `default` Block (Legacy) |
| :--- | :--- |
| Only specified assets are preloaded | ALL registered assets are preloaded |
| Audio is decoded to AudioBuffers | Audio is only fetched to browser cache |
| Images are pre-decoded | Images are only fetched to browser cache |
| Faster first playback | May have slight delay on first use |
| More control over initial load time | Longer initial load with many assets |

### Defining Named Blocks

Named blocks are loaded on-demand using `preload block <name>` in your script:

```javascript
monogatari.action('Preload').blocks({
    'default': {
        // Loaded automatically at game start
        music: ['main_theme'],
        scenes: ['intro']
    },
    'Chapter1': {
        // Loaded when you use 'preload block Chapter1'
        music: ['theme_song', 'battle_music'],
        scenes: ['school_gate', 'classroom'],
        sounds: ['door_open', 'footsteps'],
        characters: {
            'y': ['happy', 'sad', 'normal']
        }
    },
    'Chapter2': {
        music: ['dramatic_theme'],
        scenes: ['rooftop'],
        images: ['sunset_photo']
    }
});
```

### Block Structure

```typescript
interface PreloadBlock {
    music?: string[];       // Asset names from monogatari.assets('music', {...})
    sounds?: string[];      // Asset names from monogatari.assets('sounds', {...})
    voices?: string[];      // Asset names from monogatari.assets('voices', {...})
    scenes?: string[];      // Asset names from monogatari.assets('scenes', {...})
    images?: string[];      // Asset names from monogatari.assets('images', {...})
    characters?: {          // Character sprite names
        [characterId: string]: string[]  // Sprite names from character's sprites object
    };
    [customCategory: string]: string[] | undefined;  // Custom categories (see below)
}
```

### Using Blocks in Scripts

```javascript
monogatari.script({
    'Start': [
        'Before the chapter begins, let\'s load assets...',
        'preload block Chapter1 blocking',
        'All assets are now loaded!',
        // ... rest of chapter
    ]
});
```

## Blocking vs Non-Blocking

By default, preload is **non-blocking** - the game immediately advances to the next statement while assets load in the background. This is useful for preloading assets you'll need later.

Adding the `blocking` keyword makes the action wait for the preload to complete before advancing. This is useful when you need the asset immediately after the preload statement.

```javascript
// Non-blocking: loads in background while dialogue continues
'preload music boss_battle',
'The hero approaches the castle...',

// Blocking: waits for asset to load before continuing
'preload scene castle_interior blocking',
'show scene castle_interior'
```

## Advanced: Custom Categories

You can register custom asset categories to use with the preload system.

### Registering a Custom Category

```javascript
// Register a custom category 'posters' that uses the image loader
monogatari.action('Preload').registerCategory('posters', 'image');

// Configure the assets path for your custom category
const assetsPath = monogatari.setting('AssetsPath');
assetsPath.posters = 'images/posters';
monogatari.setting('AssetsPath', assetsPath);

// Register assets for your custom category
monogatari.assets('posters', {
    'movie_poster': 'avengers.jpg',
    'concert_poster': 'live_show.png'
});
```

### Using Custom Categories

Once registered, custom categories work like built-in ones:

```javascript
// Single asset preload
'preload posters movie_poster blocking'

// In preload blocks
monogatari.action('Preload').blocks({
    'theater_scene': {
        posters: ['movie_poster', 'concert_poster'],
        music: ['theater_ambience']
    }
});
```

## Advanced: Custom Loaders

For advanced use cases, you can register entirely custom loaders for new asset types.

### Registering a Custom Loader

```javascript
monogatari.action('Preload').registerLoader('video', {
    loader: async (url, engine) => {
        // Custom loading logic
        const video = document.createElement('video');
        video.src = url;
        await new Promise((resolve, reject) => {
            video.onloadeddata = resolve;
            video.onerror = reject;
        });
        return video;
    },
    cache: {
        get: (engine, key) => engine.videoCache?.(key),
        set: (engine, key, value) => engine.videoCache?.(key, value),
        delete: (engine, key) => engine.videoUncache?.(key),
        clear: (engine, prefix) => engine.videoClearCache?.(prefix)
    }
});

// Then register categories to use this loader
monogatari.action('Preload').registerCategory('videos', 'video');
```

## Related Actions

- [Unload](unload.md) - Release assets from memory when no longer needed
