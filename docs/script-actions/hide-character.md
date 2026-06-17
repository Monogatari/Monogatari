---
title: Hide Character
order: 27
description: "Remove a character's sprite from screen"
---


# Hide Character

## Description

```text
'hide character <character_id> [at <position>] [with <animation> [classes] [properties]]'
```

The hide character action removes a character's sprite from the screen. If the character was shown with an `end-<animation>` property, that animation will play automatically when hiding.

**Action ID**: `Hide::Character`

**Reversible**: Yes

**Requires User Interaction**: No

## Syntax

### Positions

The optional `at <position>` clause can move the character to a different position before applying the hide animation:

```javascript
'hide character e at right with fadeOut'
```

### Properties

| Name | Description |
| :--- | :--- |
| `duration` | Sets `animation-duration` CSS property. Format: `duration <time>` (e.g., `duration 2s`) |

## Examples

### Basic Hide

Remove a character immediately (no animation):

```javascript
'hide character e'
```

### Hide with Animation

Remove a character with a [CSS animation](https://daneden.github.io/animate.css/):

```javascript
'hide character e with fadeOut'
```

### Hide with Duration

Control how long the hide animation takes:

```javascript
'hide character e with fadeOut duration 3s'
```

### Hide with Position Change

Move the character before hiding:

```javascript
'hide character e at right with slideOutRight'
```

### Using End Animations

When a character is shown with `end-<animation>`, that animation automatically plays when hiding:

```javascript
// Show with exit animation prepared
'show character e normal with fadeIn end-fadeOut',
'e Hello!',
// The fadeOut will play automatically
'hide character e'
```

This is equivalent to:

```javascript
'show character e normal with fadeIn',
'e Hello!',
'hide character e with fadeOut'
```

## Error Handling

The action will show an error if:

1. **Character not found**: The character ID doesn't exist in the character definitions
2. **Character not shown**: Attempting to hide a character that isn't currently displayed

## Complete Example

```javascript
monogatari.script({
    'Start': [
        'show character e normal at left with fadeIn end-fadeOut',
        'show character y happy at right with fadeIn',
        'e Hi Yui!',
        'y Hello Evelyn!',
        // Evelyn will fade out (using end-fadeOut)
        'hide character e',
        'y Where did she go?',
        // Yui slides out to the right over 2 seconds
        'hide character y at right with slideOutRight duration 2s'
    ]
});
```

## Related Actions

- [Show Character](characters.md) - Display a character on screen
- [Character Layers](character-layers.md) - Hide individual sprite layers
