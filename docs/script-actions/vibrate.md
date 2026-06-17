---
title: Vibrate
order: 57
description: "Make the player's device vibrate"
---


# Vibrate

## Description

```javascript
'vibrate <pattern>'
```

The `vibrate` action allows you to make the player's device vibrate on a given pattern. By vibration **we refer to actual vibration, not shaking the screen** so this is only supported on mobile devices with such capabilities. If this feature is not supported on the player's device, nothing will happen and the game will continue with it's normal flow.

**Action ID**: `Vibrate`

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

| Name | Type | Optional | Description |
| :--- | :--- | :--- | :--- |
| pattern | `numbers` | No | List of **space separated** times in **milliseconds**. While there's no limit on how large a pattern can be, at least one time is required. |

## Single Vibration

You can make the device vibrate only once, for example, the following will make it vibrate for 200ms and then stop.

```javascript
monogatari.script ({
    'Start': [
        'vibrate 200'
        'end'
    ]
});
```

## Pattern Vibration

You can also make the device vibrate following a pattern by providing a list of times, the following will make the device vibrate for 200ms, then 100ms, then 150ms and so on.

```javascript
monogatari.script ({
    'Start': [
        'vibrate 200 100 150 50 200 300'
        'end'
    ]
});
```
