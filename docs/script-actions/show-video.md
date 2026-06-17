---
title: Show Video
order: 51
description: Display videos in your visual novel
---


# Show Video

## Description

```javascript
'show video <video_id> <mode> [with <properties>]'
```

The video action allows you to show videos in your visual novel in different display modes.

**Action ID**: `Video`

**Reversible**: Yes

**Requires User Interaction**: Depends on mode and properties. Blocking modes (`modal`, `immersive`, `fullscreen`) wait for video completion unless `close` property is used.

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| video_id | `string` | The ID of a video asset previously declared |
| mode | `string` | Display mode: `modal`, `displayable`, `background`, `immersive`, or `fullscreen` |

## Display Modes

| Mode | Description | Blocks Game |
| :--- | :--- | :--- |
| `modal` | Shows video in a modal overlay | Yes |
| `displayable` | Shows video as an element on the game screen | No |
| `background` | Shows video as the background behind characters | No |
| `immersive` | Covers the full game screen | Yes |
| `fullscreen` | Attempts fullscreen mode (falls back to `immersive` if denied) | Yes |

## Properties

| Property | Description |
| :--- | :--- |
| `controls` | Shows video controls (play, pause, seeking) to the player |
| `close` | Automatically removes the video when it ends |
| `loop` | Makes the video loop continuously (overrides `close`) |

## Asset Declaration

To play a video, add the file to your **`assets/videos/`** directory and declare it:

```javascript
monogatari.assets('videos', {
    'intro': 'intro.mp4',
    'ending': 'ending_credits.mp4',
    'rain': 'rain_loop.webm'
});
```

### Supported Formats

**MP4** is recommended for maximum browser compatibility. Other formats:

| Format | Browser Support |
| :--- | :--- |
| MP4 (H.264) | All modern browsers |
| WebM | Chrome, Firefox, Edge |
| Ogg | Chrome, Firefox |

See the [MDN compatibility table](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#Browser_compatibility) for detailed browser support.

## Examples

### Modal Video

Shows a video in a modal that blocks game progression:

```javascript
monogatari.script({
    'Start': [
        'show video intro modal',
        'The intro has finished.',
        'end'
    ]
});
```

### Background Video

Use a video as an animated background:

```javascript
monogatari.script({
    'Start': [
        'show video rain background with loop',
        'e The rain keeps falling...',
        'hide video rain',
        'end'
    ]
});
```

### Auto-Close Video

Video that automatically closes when finished:

```javascript
monogatari.script({
    'Start': [
        'show video cutscene immersive with close',
        // Game continues automatically after video ends
        'e That was intense!',
        'end'
    ]
});
```

### Video with Controls

Let the player control playback:

```javascript
monogatari.script({
    'Start': [
        'show video tutorial modal with controls',
        'Did you understand the tutorial?',
        'end'
    ]
});
```

### Fullscreen Video

Attempts to play in fullscreen (falls back to immersive if permission denied):

```javascript
monogatari.script({
    'Start': [
        'show video ending fullscreen with close',
        'Thanks for playing!',
        'end'
    ]
});
```

### Displayable Video

Shows video as an element without blocking the game:

```javascript
monogatari.script({
    'Start': [
        'show video news_broadcast displayable',
        'e Look at what\'s on TV!',
        'hide video news_broadcast with fadeOut',
        'end'
    ]
});
```

## Behavior Notes

- **Blocking modes** (`modal`, `immersive`, `fullscreen`): The game waits for the video to end before proceeding, unless `close` is specified
- **Non-blocking modes** (`background`, `displayable`): The game continues immediately
- **Loop + Close**: If both are specified, `loop` takes priority and the video won't auto-close
- **Volume**: Video volume respects the player's Video volume preference setting

## Related Actions

- [Hide Video](hide-video.md) - Stop and remove a video
- [Show Scene](show-scene.md) - Change background (static images)
- [Play Music](play-music.md) - Background audio
