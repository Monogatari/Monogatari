---
title: Unload
order: 56
description: Free up memory by unloading unused assets
---


# Unload

## Description

```text
'unload <type> [asset] [permanent]'
'unload character <id> [sprite] [permanent]'
'unload block <block_id> [permanent]'
'unload all [permanent]'
```

The unload action allows you to release assets from memory when they are no longer needed. This is crucial for managing memory usage in long games or games with many high-resolution assets.

**Action ID**: `Unload`

**Reversible**: No (Reverting does nothing)

**Requires User Interaction**: No

## Parameters

| Parameter | Description |
| :--- | :--- |
| `type` | The category of the asset (see [Supported Categories](#supported-categories) below). |
| `asset` | (Optional) The specific asset to unload. If omitted, all assets of the specified type will be unloaded. |
| `id` | When unloading a character, the character's ID. |
| `sprite` | (Optional) When unloading a character, the specific sprite to unload. If omitted, all sprites for the character are unloaded. |
| `block_id` | When using `unload block`, the ID of the preload block to unload. |
| `all` | Special keyword to unload ALL cached assets. |
| `permanent` | (Optional) If included, audio assets will also be removed from persistent storage (IndexedDB). |

## Supported Categories

The unload action supports the same categories as the [Preload](preload.md) action:

### Default Audio Categories
- `music` - Background music tracks
- `sounds` or `sound` - Sound effects
- `voices` or `voice` - Voice clips

### Default Image Categories
- `scenes` or `scene` - Scene backgrounds
- `images` or `image` - General images
- `characters` - Character sprites (uses special syntax, see examples)

Note: Singular forms (`sound`, `voice`, `scene`, `image`) are aliases for their plural counterparts.

## Examples

### Unload a specific song
```javascript
'unload music theme_song'
```

### Unload all scenes
```javascript
'unload scenes'
```

### Unload a specific character sprite
```javascript
'unload character y happy'
```

### Unload all sprites for a character
```javascript
'unload character y'
```

### Unload a block of assets
```javascript
'unload block Chapter1'
```

### Unload everything (e.g., at end of chapter)
```javascript
'unload all'
```

## The `permanent` Flag

By default, unload only removes assets from the in-memory cache. For audio assets, the decoded audio buffers are also stored in IndexedDB for faster loading in future sessions.

Adding the `permanent` flag will also remove audio assets from IndexedDB:

```javascript
// Only removes from memory cache (will reload faster next time from IndexedDB)
'unload music theme_song'

// Removes from both memory AND IndexedDB (will need to re-download and decode)
'unload music theme_song permanent'

// Clear all audio from persistent storage
'unload all permanent'
```

This is useful when:
- The player has completed a section and won't return
- You want to free up storage space
- You're updating assets and need to force a fresh download

## Memory Management Best Practices

### Chapter-based Unloading

For games with distinct chapters or scenes, use preload blocks and unload them when no longer needed:

```javascript
monogatari.action('Preload').blocks({
    'Chapter1': {
        music: ['intro_theme', 'peaceful'],
        scenes: ['hometown', 'school']
    },
    'Chapter2': {
        music: ['dramatic', 'battle'],
        scenes: ['castle', 'dungeon']
    }
});

// In your script
monogatari.script({
    'Chapter1End': [
        'The hero leaves their hometown...',
        'unload block Chapter1',
        'preload block Chapter2 blocking',
        'jump Chapter2Start'
    ]
});
```

### Unloading Unused Characters

When characters leave the story permanently:

```javascript
'y:happy The adventure continues without me. Goodbye!',
'hide character y',
'unload character y'  // Frees all y's sprites from memory
```

### Full Memory Clear

At major story transitions:

```javascript
'unload all',
'preload block NewArc blocking',
'show scene new_beginning'
```

## Related Actions

- [Preload](preload.md) - Load assets into memory before they're needed
