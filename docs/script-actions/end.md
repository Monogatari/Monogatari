---
title: End
order: 24
description: End your game
---


# End

## Description

```text
'end'
```

The `end` action terminates the game and returns to the main menu. It resets all storage, actions, and components to their initial state.

**Action ID**: `End`

**Reversible**: No

**Requires User Interaction**: No

## Behavior

When the `end` action is executed:

1. All screens are hidden
2. The `playing` global is set to `false`
3. The game is fully reset (state, history, storage)
4. The main menu is displayed
5. UI elements are restored to their initial state

## Usage

Every script path should end with the `end` action:

```javascript
monogatari.script({
    'Start': [
        'Hello, this is my visual novel!',
        'Thank you for playing!',
        'end'
    ]
});
```

### Multiple Endings

You can have multiple endings in your game:

```javascript
monogatari.script({
    'Start': [
        'y Do you want the good ending or bad ending?',
        {'Choice': {
            'Good': {
                'Text': 'Good ending',
                'Do': 'jump GoodEnd'
            },
            'Bad': {
                'Text': 'Bad ending',
                'Do': 'jump BadEnd'
            }
        }}
    ],
    'GoodEnd': [
        'y Everything worked out perfectly!',
        'centered THE GOOD END',
        'end'
    ],
    'BadEnd': [
        'y Things didn\'t go so well...',
        'centered THE BAD END',
        'end'
    ]
});
```

## Keyboard Shortcut

Players can trigger a quit confirmation using **Shift+Q** during gameplay. This displays an alert with:
- **Quit** button - Ends the game
- **Cancel** button - Dismisses the alert

This shortcut is automatically registered when the game initializes.

## Electron/Desktop Integration

When running in Electron (desktop builds), if the game is not currently playing and the quit action is triggered, a quit request is sent to the Electron process to close the application window.

## Important Notes

> [!WARNING]
> The `end` action is **not reversible**. Once executed, the player cannot use the back button to return to the game. Make sure to provide save opportunities before critical endings.

## Examples

### Simple Ending

```javascript
monogatari.script({
    'Start': [
        'y Welcome to my story.',
        'y And that\'s the end!',
        'end'
    ]
});
```

### Ending with Credits

```javascript
monogatari.script({
    'Start': [
        'show scene sunset with fadeIn',
        'y Thank you for playing...',
        'wait 2000',
        'show scene black with fadeIn',
        'centered Thanks for playing!',
        'wait 3000',
        'end'
    ]
});
```

### Ending After Unlocking Gallery

```javascript
monogatari.script({
    'Start': [
        // Game content...
        'y You reached the true ending!',
        // Unlock gallery item
        function() {
            monogatari.storage().game.gallery.trueEnd = true;
            return true;
        },
        'centered TRUE END',
        'end'
    ]
});
```

## Related Actions

- [Jump](jump.md) - Navigate to different labels
- [Clear](clear.md) - Clear the text box
