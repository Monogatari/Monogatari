---
title: Show Image
order: 46
description: Show an image on screen
---


# Show Image

## Description

```javascript
'show image <resource> [at <position>] [with <animation> [classes] [properties]]'
```

The `show image` action allows you to display an image on screen. For character sprites, use the [Show Character action](characters.md) instead.

**Action ID**: `Show::Image`

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| resource | `string` | Either an asset ID declared in `monogatari.assets('images', {...})` or a filename in the images directory |
| position | `string` | Optional. CSS class for positioning (e.g., `center`, `left`, `right`) |
| animation | `string` | Optional. Animation name from [Animate.css](https://daneden.github.io/animate.css/) |
| classes | `string` | Optional. Additional CSS classes to apply |
| properties | `string` | Optional. Properties like `duration` |

## Properties

| Property | Description |
| :--- | :--- |
| `duration` | Sets `animation-duration` CSS property. Format: `duration <time>` (e.g., `duration 2s`) |

## Asset Declaration

Declare image assets in your `script.js` or `main.js`:

```javascript
monogatari.assets('images', {
    'flower': 'flower.png',
    'logo': 'company_logo.png',
    'item_sword': 'items/sword.png'
});
```

Images are loaded from `assets/images/` by default.

## Examples

### Using Declared Assets

```javascript
'show image flower with fadeIn'
```

### Using Filename Directly

If you haven't declared an asset, use the filename:

```javascript
'show image flower.png with fadeIn'
```

### Positioning

```javascript
// Center (default)
'show image logo with fadeIn'

// Specific position
'show image flower at left with fadeIn'
'show image flower at right with slideInRight'
```

### Animation Duration

```javascript
'show image logo with fadeIn duration 3s'
```

### Multiple Classes

```javascript
'show image flower at center with fadeIn myCustomClass'
```

## Image Caching

The action checks if the image has been preloaded and cached. If cached, it clones the cached image for faster display.

## Complete Example

```javascript
monogatari.assets('images', {
    'flower': 'flower.png',
    'butterfly': 'butterfly.png'
});

monogatari.script({
    'Start': [
        'show scene garden with fadeIn',
        'show image flower at left with fadeIn',
        'The garden is beautiful.',
        'show image butterfly at right with bounceIn duration 2s',
        'A butterfly appears!',
        'hide image butterfly with fadeOut',
        'hide image flower with fadeOut',
        'end'
    ]
});
```

## Related Actions

- [Hide Image](hide-image.md) - Remove an image from screen
- [Show Character](characters.md) - Display character sprites
- [Show Scene](show-scene.md) - Change the background
