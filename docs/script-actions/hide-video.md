---
title: Hide Video
order: 30
description: Stop and remove a video from the screen
---


# Hide Video

## Description

```javascript
'hide video <video_id> [with <animation>]'
```

The `hide video` action stops and removes a video currently playing on the screen.

**Action ID**: `Hide::Video`

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| video_id | `string` | The ID of the video to hide (same ID used in `show video`) |
| animation | `string` | Optional. Exit animation from [Animate.css](https://daneden.github.io/animate.css/) |

## Examples

### Basic Hide

Stop and remove a video immediately:

```javascript
'hide video rain'
```

### Hide with Animation

Remove a video with a fade out effect:

```javascript
'hide video news_broadcast with fadeOut'
```

### Complete Example

```javascript
monogatari.assets('videos', {
    'rain': 'rain_loop.webm',
    'tv_static': 'static.mp4'
});

monogatari.script({
    'Start': [
        // Show a looping background video
        'show video rain background with loop',
        'e The rain has been falling all day.',
        
        // Show another video
        'show video tv_static displayable',
        'e The TV signal is acting up again.',
        
        // Hide the TV video with animation
        'hide video tv_static with fadeOut',
        'e Finally, some peace and quiet.',
        
        // Hide the rain
        'hide video rain',
        'show scene sunny_day with fadeIn',
        'e Oh, the sun is coming out!',
        'end'
    ]
});
```

## Behavior

When hiding a video:

1. The video playback is stopped
2. Video resources are cleaned up to prevent memory leaks
3. If an animation is specified, it plays before removal
4. The element is removed from the DOM

### Animation Behavior

When using an animation:
- The video's `data-visibility` attribute is set to `invisible`
- The animation plays
- Once the animation ends, the video element is removed

## Error Handling

If the video ID doesn't match any currently playing video, the action completes silently without error.

## Related Actions

- [Show Video](show-video.md) - Display a video
- [Hide Image](hide-image.md) - Remove an image
- [Hide Character](hide-character.md) - Remove a character sprite
