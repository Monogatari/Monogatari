---
title: Stop Music
order: 53
description: Stop playing music
---


# Stop Music

## Description

```javascript
'stop music [music_id] [with fade <time>]'
```

The stop music action will let you stop either all music currently playing or only one in specific. To learn more about music, read the [Play Music documentation](play-music.md).

**Action ID**: `Stop`

**Reversible**: Yes (restores the previously playing music from history)

**Requires User Interaction**: No

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| music\_id | `string` | Optional. The name of the specific music you want to stop. If omitted, all music will be stopped. |
| fade | `number` | Optional. Fade out time in seconds. |

## Examples

### Stop a Specific Music

The following will stop a specific music track, identified by its name.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play music mainTheme with loop',
        'play music mystery with loop',
        'Two songs are currently playing',
        'stop music mainTheme',
        'Only the mystery song is playing now',
        'end'
    ]
});
```



**Music Assets**

```javascript
monogatari.assets('music', {
    'mainTheme': 'mainThemeSong.mp3',
    'mystery': 'mysterious_song.ogg'
});
```



### Stop All Music

The following will stop all music currently playing.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play music mainTheme with loop',
        'play music mystery with loop',
        'Two songs are currently playing',
        'stop music',
        'No music is playing anymore',
        'end'
    ]
});
```



**Music Assets**

```javascript
monogatari.assets('music', {
    'mainTheme': 'mainThemeSong.mp3',
    'mystery': 'mysterious_song.ogg'
});
```



### Fade Out Effect

The following will stop the music with a fade out effect. You can also use a fade out effect when stopping all music.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play music mainTheme with loop',
        'play music mystery with loop',
        'Two songs are currently playing',
        'stop music mystery with fade 5',
        'The mystery music is fading out over 5 seconds',
        'end'
    ]
});
```



**Music Assets**

```javascript
monogatari.assets('music', {
    'mainTheme': 'mainThemeSong.mp3',
    'mystery': 'mysterious_song.ogg'
});
```



### Fade Out All Music

```javascript
'stop music with fade 3'  // Fade out all music over 3 seconds
```

## Related Actions

- [Play Music](play-music.md) - Play background music
- [Pause](pause.md) - Pause playing media (can be resumed later)
