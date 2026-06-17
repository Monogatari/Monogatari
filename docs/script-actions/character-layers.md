---
title: Show Character Layer
order: 45
description: Control individual layers of a character sprite
---


# Character Layers

> [!WARNING]
> This feature is currently **Experimental**. Syntax and behavior may change in future versions.
> Requires `ExperimentalFeatures` to be enabled in settings.

## Description

The Character Layer actions allow you to manipulate specific parts (layers) of a composite character sprite independently. This is useful for paper-doll systems where you want to change expressions, outfits, or accessories without replacing the entire character image.

## Actions

| Action | ID | Description |
| :--- | :--- | :--- |
| Show Layer | `Show::Character::Layer` | Display or change a specific layer |
| Hide Layer | `Hide::Character::Layer` | Remove a specific layer |

**Reversible**: Yes

**Requires User Interaction**: No

## Character Setup

To use layers, your character definition must include:

1. `layers` - An array defining the layer order (bottom to top, determines z-index)
2. `layer_assets` - An object mapping layer names to their available sprites

```javascript
monogatari.characters({
    'y': {
        name: 'Yui',
        directory: 'yui',
        // Define layer order (bottom to top)
        layers: ['base', 'clothes', 'face', 'accessories'],
        // Define available sprites for each layer
        layer_assets: {
            base: {
                body: 'base_body.png'
            },
            clothes: {
                uniform: 'clothes_uniform.png',
                casual: 'clothes_casual.png',
                swimsuit: 'clothes_swimsuit.png'
            },
            face: {
                neutral: 'face_neutral.png',
                happy: 'face_happy.png',
                sad: 'face_sad.png',
                angry: 'face_angry.png'
            },
            accessories: {
                glasses: 'acc_glasses.png',
                hat: 'acc_hat.png'
            }
        },
        // Standard sprites can still be used
        sprites: {
            normal: 'normal.png' // Fallback non-layered sprite
        }
    }
});
```

### Layer Order

The `layers` array determines the z-index of each layer. Layers listed first appear behind layers listed later:

```javascript
layers: ['base', 'clothes', 'face', 'accessories']
//        ↑ back                        front ↑
```

## Show Layer

```text
'show character <character_id>:<layer> <sprite> [with <animation> [end-<animation>] [classes] [properties]]'
```

Displays a specific sprite on a specific layer for a character.

### Properties

| Name | Description |
| :--- | :--- |
| `duration` | Sets `animation-duration` CSS property. Format: `duration <time>` |
| `transition` | Sets `transition-duration` CSS property. Format: `transition <time>` |
| `end-<animation>` | Animation to play when this layer is changed |

### Prerequisites

The parent character must be shown first using `show character` before adding layers:

```javascript
// First show the character (can be a layered sprite or regular)
'show character y normal',
// Then add/modify individual layers
'show character y:face happy'
```

### Examples

**Set Yui's face to happy:**

```javascript
'show character y:face happy'
```

**Change clothes with animation:**

```javascript
'show character y:clothes casual with fadeIn'
```

**Add glasses with a fade effect:**

```javascript
'show character y:accessories glasses with fadeIn duration 0.5s'
```

**Prepare exit animation for a layer:**

```javascript
'show character y:accessories glasses with fadeIn end-fadeOut'
```

## Hide Layer

```text
'hide character <character_id>:<layer> [with <animation> [classes] [properties]]'
```

Removes a specific layer from a displayed character.

### Properties

| Name | Description |
| :--- | :--- |
| `duration` | Sets `animation-duration` CSS property. Format: `duration <time>` |

### Examples

**Remove Yui's glasses:**

```javascript
'hide character y:accessories'
```

**Remove glasses with animation:**

```javascript
'hide character y:accessories with fadeOut'
```

**Remove with custom duration:**

```javascript
'hide character y:accessories with fadeOut duration 1s'
```

## Complete Example

```javascript
monogatari.script({
    'Start': [
        // Show the character with base layers
        'show character y normal at center with fadeIn',
        
        // Build up the character layer by layer
        'show character y:base body',
        'show character y:clothes uniform with fadeIn',
        'show character y:face neutral with fadeIn',
        
        'y Hello! I\'m Yui.',
        
        // Change expression
        'show character y:face happy',
        'y Nice to meet you!',
        
        // Add accessories
        'show character y:accessories glasses with fadeIn duration 0.3s',
        'y Let me put on my reading glasses.',
        
        // Change clothes
        'show character y:clothes casual with fadeIn end-fadeOut',
        'y I changed into something more comfortable.',
        
        // Remove accessories
        'hide character y:accessories with fadeOut',
        'y I don\'t need these anymore.',
        
        // Change expression
        'show character y:face sad',
        'y Time to say goodbye...',
        
        // Hide the whole character
        'hide character y with fadeOut'
    ]
});
```

## State Management

### State

Character layers are tracked in the engine state:

```javascript
// Get current layer states
const layers = monogatari.state('characterLayers');
```

### History

Layer changes are recorded in history for rollback support:

```javascript
// Get layer history
const history = monogatari.history('characterLayer');
```

## Error Handling

The actions will show errors if:

1. **Character not found**: The character ID doesn't exist
2. **Layer not shown**: Attempting to hide a layer that isn't displayed
3. **Parent not shown**: Attempting to add a layer when the character isn't displayed

## CSS Styling

Layer images are rendered as `<img>` elements inside a wrapper:

```css
/* Style all layer images */
[data-character] [data-layer] {
    /* Custom styles */
}

/* Style a specific layer */
[data-character="y"] [data-layer="face"] {
    /* Face layer specific styles */
}
```

## Related Actions

- [Show Character](characters.md) - Display the parent character
- [Hide Character](hide-character.md) - Remove the entire character
