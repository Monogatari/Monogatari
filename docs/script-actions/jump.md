---
title: Jump
order: 34
description: Jump to a different label in your script
---


# Jump

## Description

```text
'jump <label_id>'
```

The `jump` action moves script execution to a different label. This is essential for creating branching narratives, chapters, and non-linear story structures.

**Action ID**: `Jump`

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

| Name | Type | Optional | Description |
| :--- | :--- | :--- | :--- |
| `label_id` | `string` | No | The name of the label to jump to. |

## Behavior

When a `jump` action is executed:

1. Validates that the target label exists
2. Stops any ambient audio
3. Records the jump in history (source and destination)
4. Changes the current label and resets step to 0
5. Clears the dialog (unless in NVL mode)
6. Executes the first statement of the new label

## Basic Usage

```javascript
monogatari.script({
    'Start': [
        'y Hello! Let me take you to Chapter 1.',
        'jump Chapter1'
    ],
    'Chapter1': [
        'show scene forest',
        'y Welcome to Chapter 1!',
        'end'
    ]
});
```

## Branching with Choices

The `jump` action is commonly used with choices to create branching paths:

```javascript
monogatari.script({
    'Start': [
        'y Where do you want to go?',
        {'Choice': {
            'Forest': {
                'Text': 'Go to the forest',
                'Do': 'jump Forest'
            },
            'Beach': {
                'Text': 'Go to the beach',
                'Do': 'jump Beach'
            },
            'Mountain': {
                'Text': 'Go to the mountain',
                'Do': 'jump Mountain'
            }
        }}
    ],
    'Forest': [
        'show scene forest',
        'y The forest is peaceful.',
        'end'
    ],
    'Beach': [
        'show scene beach',
        'y The ocean breeze is refreshing!',
        'end'
    ],
    'Mountain': [
        'show scene mountain',
        'y The view from up here is amazing!',
        'end'
    ]
});
```

## Organizing Large Scripts

Use labels to organize your script into logical sections:

```javascript
monogatari.script({
    // Story start
    'Start': [
        'show scene title_screen',
        'wait 2000',
        'jump Prologue'
    ],
    
    // Prologue
    'Prologue': [
        'show scene city_night',
        'y It all started on a rainy night...',
        'jump Chapter1'
    ],
    
    // Chapter 1
    'Chapter1': [
        'show scene apartment',
        'y Chapter 1: A New Beginning',
        // Chapter content...
        'jump Chapter2'
    ],
    
    // Chapter 2
    'Chapter2': [
        'show scene school',
        'y Chapter 2: First Day',
        // Chapter content...
        'end'
    ]
});
```

## HTML Data Attribute

You can trigger jumps from HTML elements using the `data-jump` attribute:

```html
<button data-action="jump" data-jump="SpecialScene">Go to Special Scene</button>
```

When clicked, this will execute `jump SpecialScene`.

## Error Handling

If the target label doesn't exist, the engine will display an error showing:
- The target label that wasn't found
- All available labels in your script
- The current location in your script

```javascript
// This will show an error if 'NonExistent' label doesn't exist
'jump NonExistent'
```

## Rollback Behavior

The `jump` action records history to support the back button:

- Pressing back after a jump returns to the source label and step
- The jump history tracks both source and destination
- Label history is also maintained for proper rollback

> [!NOTE]
> While jump is technically reversible, complex jump sequences may have unexpected rollback behavior. Test your back button functionality when using multiple jumps.

## Examples

### Conditional Jumps with Functions

```javascript
monogatari.script({
    'Start': [
        function() {
            const affection = monogatari.storage().game.affection;
            if (affection >= 50) {
                return 'jump GoodRoute';
            } else {
                return 'jump NormalRoute';
            }
        }
    ],
    'GoodRoute': [
        'y You\'ve been so kind to me!',
        'end'
    ],
    'NormalRoute': [
        'y It was nice meeting you.',
        'end'
    ]
});
```

### Loop Back Pattern

```javascript
monogatari.script({
    'Start': [
        'jump DailyLoop'
    ],
    'DailyLoop': [
        'y Another day begins...',
        'y What should I do today?',
        {'Choice': {
            'Study': {
                'Text': 'Study',
                'Do': 'jump Study'
            },
            'Rest': {
                'Text': 'Rest',
                'Do': 'jump Rest'
            }
        }}
    ],
    'Study': [
        'y I studied hard today.',
        function() {
            monogatari.storage().game.studyCount++;
            return true;
        },
        'jump CheckProgress'
    ],
    'Rest': [
        'y I took a relaxing break.',
        'jump DailyLoop'  // Loop back
    ],
    'CheckProgress': [
        function() {
            if (monogatari.storage().game.studyCount >= 3) {
                return 'jump Graduation';
            }
            return 'jump DailyLoop';  // Loop back
        }
    ],
    'Graduation': [
        'y I graduated!',
        'end'
    ]
});
```

## Related Actions

- [End](end.md) - End the game
- [Wait](wait.md) - Pause execution
- [Clear](clear.md) - Clear the text box
- [Choices](choices.md) - Present choices to the player
