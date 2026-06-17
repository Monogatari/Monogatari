---
title: Clear
order: 21
description: Clear the text box
---


# Clear

## Description

```text
'clear'
```

The `clear` action removes all dialog content from the text box, leaving it blank. This is useful for scene transitions, dramatic pauses, or resetting the display between sections.

**Action ID**: `Clear`

**Reversible**: Yes

**Requires User Interaction**: No

## Behavior

When the `clear` action is executed:

1. Calls the Dialog action's reset method
2. Preserves and saves NVL mode state (if active)
3. Records the text box mode in history for rollback support
4. Automatically advances to the next statement

### NVL Mode Handling

The `clear` action has special handling for NVL (Novel) mode:
- If NVL mode is active, it's preserved (`keepNVL: true`)
- The current NVL state is saved for potential rollback (`saveNVL: true`)
- On rollback, NVL mode can be restored if it was active

## Basic Usage

```javascript
monogatari.script({
    'Start': [
        'y Hello there!',
        'y How are you today?',
        'clear',
        'y Now the text box is empty.',
        'end'
    ]
});
```

## Use Cases

### Scene Transitions

Clear the dialog before changing scenes:

```javascript
monogatari.script({
    'Start': [
        'show scene bedroom',
        'y I should get some rest.',
        'clear',
        'show scene black with fadeIn',
        'wait 1000',
        'show scene bedroom_morning with fadeIn',
        'y A new day begins!',
        'end'
    ]
});
```

### Dramatic Pauses

Create dramatic moments by clearing the text:

```javascript
monogatari.script({
    'Start': [
        'y I have something important to tell you...',
        'clear',
        'wait 2000',
        'y I\'m leaving tomorrow.',
        'end'
    ]
});
```

### Chapter Breaks

Use clear to separate chapters or sections:

```javascript
monogatari.script({
    'Start': [
        'y And that concludes Chapter 1.',
        'clear',
        'centered Chapter 2',
        'clear',
        'show scene new_location',
        'y The story continues...',
        'end'
    ]
});
```

### Before Centered Text

Clear the text box before displaying centered text:

```javascript
monogatari.script({
    'Start': [
        'y This is the end of our journey.',
        'clear',
        'centered THE END',
        'wait 3000',
        'end'
    ]
});
```

### NVL Mode Clearing

In NVL mode, clear removes all accumulated dialog but keeps NVL mode active:

```javascript
monogatari.script({
    'Start': [
        'nvl',  // Enable NVL mode
        'y:nvl First line of dialog.',
        'y:nvl Second line of dialog.',
        'y:nvl Third line of dialog.',
        'clear',  // Clears all lines but stays in NVL mode
        'y:nvl New page of dialog.',
        'end'
    ]
});
```

## Rollback Behavior

The `clear` action supports rollback:
- When going back past a `clear`, the previous dialog state is restored
- If NVL mode was active when `clear` was executed, it will be restored on rollback
- The engine tracks the text box mode (ADV or NVL) in history

## Examples

### Full Scene Change

```javascript
monogatari.script({
    'Start': [
        'show scene cafe',
        'show character e happy at center',
        'e Let\'s meet again sometime!',
        'clear',
        'hide character e with fadeOut',
        'show scene black with fadeIn',
        'wait 1500',
        'show scene home with fadeIn',
        'y I\'m finally home.',
        'end'
    ]
});
```

### Conversation Reset

```javascript
monogatari.script({
    'Start': [
        'y Do you remember our first conversation?',
        'clear',
        // Flashback
        'show scene park_old with sepia',
        'y:past Hello, nice to meet you!',
        'e:past Hi there!',
        'clear',
        // Return to present
        'show scene park',
        'y Those were good times.',
        'end'
    ]
});
```

## Related Actions

- [Dialog](dialogs.md) - Display character dialog
- [Wait](wait.md) - Pause execution
- [Jump](jump.md) - Jump to another label
- [End](end.md) - End the game
