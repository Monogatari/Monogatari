---
title: Wait
order: 58
description: Wait an amount of time before continuing
---


# Wait

## Description

```text
'wait [time]'
```

The `wait` action pauses script execution for a specified amount of time or until the player interacts. Once the time has passed (or the player clicks), the game automatically continues to the next statement.

**Action ID**: `Wait`

**Reversible**: Yes

**Requires User Interaction**: Optional (required if no time specified)

## Parameters

| Name | Type | Optional | Description |
| :--- | :--- | :--- | :--- |
| `time` | `number` | Yes | The time in **milliseconds** to wait before continuing. |

## Behavior

### With Time Parameter

When a time value is provided, the game:
1. Blocks all user interaction
2. Waits for the specified duration
3. Automatically advances to the next statement

```javascript
monogatari.script({
    'Start': [
        'Hello there! I want you to wait 5 seconds now',
        'wait 5000',
        'Wow, that was a long time!',
        'end'
    ]
});
```

In this example, after the first dialog is shown and the player clicks to continue, the game waits for 5 seconds (5000 milliseconds) before showing the next dialog.

### Without Time Parameter

When no time is provided, the game pauses and waits for user interaction:

```javascript
monogatari.script({
    'Start': [
        'Hello there!',
        'wait',
        'You clicked to continue!',
        'end'
    ]
});
```

This is useful for creating pause points where you want the player to manually advance.

## Time Conversion

The `wait` action accepts time in **milliseconds**. Common conversions:

| Duration | Milliseconds |
| :--- | :--- |
| 1 second | `1000` |
| 5 seconds | `5000` |
| 10 seconds | `10000` |
| 1 minute | `60000` |
| 0.5 seconds | `500` |

## Error Handling

If an invalid (non-numeric) time value is provided, the engine will display an error:

```javascript
// This will show an error
'wait abc'
```

The error message will indicate the invalid time value and the location in your script.

## Examples

### Dramatic Pause

```javascript
monogatari.script({
    'Start': [
        'y The truth is...',
        'wait 2000',
        'y I\'ve always loved you.',
        'end'
    ]
});
```

### Scene Transition Delay

```javascript
monogatari.script({
    'Start': [
        'show scene black with fadeIn',
        'wait 1000',
        'show scene bedroom with fadeIn',
        'y Where am I?',
        'end'
    ]
});
```

### Timed Event Sequence

```javascript
monogatari.script({
    'Start': [
        'play sound thunder',
        'wait 500',
        'show scene lightning with flash',
        'wait 200',
        'show scene dark_room',
        'y What was that?!',
        'end'
    ]
});
```

## Technical Details

- During a timed wait, the `block` global is set to `true`, preventing user interaction
- When the time elapses, `block` is set back to `false`
- The action uses `setTimeout` internally for timing

## Related Actions

- [End](end.md) - End the game
- [Jump](jump.md) - Jump to another label
