---
title: Show Notification
order: 48
description: Show a notification to the player
---


# Show Notification

## Description

```javascript
'show notification <notification_id> [time]'
```

The `notification` action shows a system notification to the player. Notifications are useful for achievement unlocks, event alerts, or other non-intrusive messages.

**Action ID**: `Notification`

**Reversible**: Yes

**Requires User Interaction**: If no time is provided, the player must dismiss the notification, but the game continues without waiting.

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| notification_id | `string` | The ID of the notification to show (must be declared beforehand) |
| time | `number` | Optional. Time in **milliseconds** before auto-dismiss |

## Configuration

Declare notifications with their properties before using them:

```javascript
monogatari.action('Notification').notifications({
    '<notification_id>': {
        title: '',
        body: '',
        icon: ''
    }
});
```

### Properties

| Name | Type | Description |
| :--- | :--- | :--- |
| title | `string` | The notification title (required) |
| body | `string` | The notification body text |
| icon | `string` | Path to an image for the notification icon |

## Browser Permissions

> [!NOTE]
> Notifications use the browser's native Notification API. The player must grant permission when prompted. If denied, notifications won't be shown but the game continues normally.

## Examples

### Simple Notification

A notification the player dismisses manually:

**Configuration:**

```javascript
monogatari.action('Notification').notifications({
    'Welcome': {
        title: 'Welcome!',
        body: 'Thanks for playing our game!',
        icon: 'assets/icons/game_icon.png'
    }
});
```

**Script:**

```javascript
monogatari.script({
    'Start': [
        'show notification Welcome',
        'e Let\'s begin our adventure!',
        'end'
    ]
});
```

### Timed Notification

A notification that auto-dismisses after 5 seconds (5000ms):

**Configuration:**

```javascript
monogatari.action('Notification').notifications({
    'Achievement': {
        title: 'Achievement Unlocked!',
        body: 'You found the secret passage!',
        icon: 'assets/icons/trophy.png'
    }
});
```

**Script:**

```javascript
monogatari.script({
    'SecretRoom': [
        'show notification Achievement 5000',
        'e Wow, I never knew this was here!',
        'end'
    ]
});
```

### Multiple Notifications

**Configuration:**

```javascript
monogatari.action('Notification').notifications({
    'NewItem': {
        title: 'New Item',
        body: 'You received a mysterious key.',
        icon: 'assets/icons/key.png'
    },
    'QuestComplete': {
        title: 'Quest Complete',
        body: 'The mystery has been solved!',
        icon: 'assets/icons/check.png'
    },
    'Save': {
        title: 'Game Saved',
        body: 'Your progress has been saved.',
        icon: 'assets/icons/save.png'
    }
});
```

**Script:**

```javascript
monogatari.script({
    'FindKey': [
        'show notification NewItem 3000',
        'e What\'s this? A key!',
        'jump SolveMyster'
    ],
    'SolveMystery': [
        'show notification QuestComplete 5000',
        'e I finally figured it out!',
        'end'
    ]
});
```

### Using Variable Interpolation

Notification text supports storage variable interpolation:

**Configuration:**

```javascript
monogatari.action('Notification').notifications({
    'LevelUp': {
        title: 'Level Up!',
        body: '{{player.name}} reached level {{player.level}}!',
        icon: 'assets/icons/star.png'
    }
});
```

## Behavior Notes

- The game does **not** wait for notifications to be dismissed
- If permission is denied, no error is thrown—the game continues
- Notification appearance depends on the browser and OS
- Icons should be appropriate size (usually 64x64 or 128x128 pixels)

## Error Handling

The action will show an error if:
- The notification ID doesn't exist in the configuration
- The time parameter is not a valid number

## Related Actions

- [Show Message](message.md) - In-game modal messages
- [Choices](choices.md) - Present options to players
