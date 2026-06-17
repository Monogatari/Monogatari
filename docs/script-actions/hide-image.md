---
title: Hide Image
order: 28
description: Remove an image from the screen
---


# Hide Image

## Description

```javascript
'hide image <image_id> [at <position>] [with <animation> [classes] [properties]]'
```

The hide image action removes an image from the screen. The image must have been previously shown using [Show Image](show-image.md).

**Action ID**: `Hide::Image`

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| image_id | `string` | The asset ID or filename used when showing the image |
| position | `string` | Optional. CSS class for repositioning before hiding |
| animation | `string` | Optional. Exit animation from [Animate.css](https://daneden.github.io/animate.css/) |
| classes | `string` | Optional. Additional CSS classes |
| properties | `string` | Optional. Properties like `duration` |

## Properties

| Property | Description |
| :--- | :--- |
| `duration` | Sets `animation-duration` CSS property. Format: `duration <time>` (e.g., `duration 2s`) |

## Examples

### Basic Hide

Remove an image immediately without animation:

```javascript
'hide image flower'
```

### Hide with Animation

Remove with an exit animation:

```javascript
'hide image flower with fadeOut'
```

### Hide with Duration

Control how long the animation takes:

```javascript
'hide image flower with fadeOut duration 3s'
```

### Hide with Position Change

Move the image before hiding:

```javascript
'hide image flower at right with slideOutRight'
```

### Using Filename

If the image wasn't declared as an asset:

```javascript
'hide image flower.png with fadeOut'
```

## Animation Behavior

When hiding with an animation:
1. The image's `data-visibility` attribute is set to `invisible`
2. The animation plays
3. Once the animation ends, the element is removed from the DOM

This ensures the animation completes before the image disappears.

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
        'A beautiful flower blooms.',
        'show image butterfly at right with bounceIn',
        'A butterfly comes to visit!',
        // Hide with different animations
        'hide image butterfly with zoomOut duration 1s',
        'The butterfly flies away.',
        'hide image flower with fadeOut duration 2s',
        'The flower wilts.',
        'end'
    ]
});
```

## Related Actions

- [Show Image](show-image.md) - Display an image on screen
- [Hide Character](hide-character.md) - Remove a character sprite
- [Show Scene](show-scene.md) - Change background (also removes all images)
