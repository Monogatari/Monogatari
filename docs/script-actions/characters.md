---
title: Show Character
order: 44
description: "Show a character's sprite"
---


# Show Character

## Description

```text
'show character <character_id> <sprite_id> [at <position>] [with <animation> [infinite] [end-<animation>] [classes] [properties]]'
```

The character action allows you to display a character's sprite. For other kind of images, take a look at the [show image action](show-image.md).

**Action ID**: `Show::Character`

**Reversible**: Yes

**Requires User Interaction**: No

## Character Definition

Characters must be defined before they can be shown. Each character has a unique identifier used in scripts:

```javascript
monogatari.characters({
    'e': {
        name: 'Evelyn',
        color: '#00bfff',
        directory: 'evelyn', // Subdirectory in assets/characters/
        sprites: {
            normal: 'normal.png',
            happy: 'happy.png',
            sad: 'sad.png'
        }
    }
});
```

### Character Properties

| Property | Description |
| :--- | :--- |
| `name` | Display name shown in the text box |
| `color` | Color for the character's name (hex, rgb, or rgba) |
| `directory` | Subdirectory within `assets/characters/` for sprite images |
| `sprites` | Object mapping sprite identifiers to image filenames |
| `Face` | Optional side image shown when the character speaks |
| `Side` | Optional object mapping side image identifiers for dialog expressions |

## Syntax

### Positions

The `at <position>` clause sets where the character appears on screen. If omitted, defaults to `center`.

Common positions (CSS classes):
- `left` - Left side of the screen
- `center` - Center of the screen (default)
- `right` - Right side of the screen

Custom positions can be defined via CSS.

### Properties

These are special properties/classes that can be used when showing a character:

| Name | Description |
| :--- | :--- |
| `duration` | Sets `animation-duration` CSS property. Format: `duration <time>` (e.g., `duration 2s`) |
| `transition` | Sets `transition-duration` CSS property for the `move` class. Format: `transition <time>` |
| `move` | Enables smooth movement animation when changing positions |
| `end-<animation>` | Specifies an animation to play when the sprite is changed or removed |
| `infinite` | Makes the animation loop indefinitely |

## Examples

### Basic Usage

Show a character at the center (default position):

```javascript
'show character e normal'
```

Show a character with an animation:

```javascript
'show character e normal with fadeIn'
```

Show a character at a specific position with animation:

```javascript
'show character e normal at center with fadeIn'
```

### Infinite Animations

Make an animation loop continuously:

```javascript
'show character e normal with pulse infinite'
```

### Duration

Control how long an animation takes to complete:

```javascript
'show character e normal with fadeIn duration 20s'
```

### Move + Transition

Smoothly move a character from one position to another:

```javascript
'show character e normal at left',
'show character e normal at right with move transition 6s'
```

The character will move from left to right over 6 seconds.

### Exit Animations

Prepare an animation to play when the sprite changes. This creates smooth crossfade effects:

```javascript
'show character e normal with end-fadeOut',
'show character e happy with fadeIn'
```

When changing from `normal` to `happy`, the old sprite will fade out while the new one fades in.

### Complete Example

```javascript
monogatari.script({
    'Start': [
        'show character e normal at left with fadeIn',
        'e Hello there!',
        'show character e happy at center with move transition 1s',
        'e I moved to the center!',
        'show character e normal with end-fadeOut',
        'show character e sad with fadeIn duration 2s',
        'e Now I\'m sad...',
        'hide character e with fadeOut'
    ]
});
```

## Experimental: Layered Sprites

> [!WARNING]
> This feature requires `ExperimentalFeatures` to be enabled in settings.

When experimental features are enabled, you can define composite sprites made of multiple layers:

```javascript
monogatari.characters({
    'y': {
        name: 'Yui',
        directory: 'yui',
        sprites: {
            // Object-based sprites define layers
            normal: {
                base: 'base_uniform.png',
                face: 'face_neutral.png'
            },
            happy: {
                base: 'base_uniform.png',
                face: 'face_happy.png'
            }
        }
    }
});
```

Showing a layered sprite works the same as regular sprites:

```javascript
'show character y normal'
```

For individual layer control, see [Character Layers](character-layers.md).

## Sprite Caching

Character sprites that have been preloaded are automatically cached for faster display. When showing a character, the engine checks for cached sprites before loading from disk.

To preload character sprites:

```javascript
'preload character e normal'
```

See the [Preload action](preload.md) for more details.

## Related Actions

- [Hide Character](hide-character.md) - Remove a character from the screen
- [Character Layers](character-layers.md) - Control individual sprite layers
- [Show Image](show-image.md) - Show non-character images
