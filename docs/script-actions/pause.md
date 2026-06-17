---
title: Pause
order: 36
description: Pause playing media
---


# Pause

## Description

```javascript
'pause <type> [media_id]'
```

The pause action allows you to pause currently playing media. This is useful for temporarily stopping music, sounds, or voices that you want to resume later.

**Action ID**: `Pause`

**Reversible**: Yes (resumes the paused media on revert)

**Requires User Interaction**: No

## Parameters

| Parameter | Description |
| :--- | :--- |
| `type` | The type of media to pause: `music`, `sound`, or `voice`. |
| `media_id` | (Optional) The specific asset name to pause. If omitted, all media of the specified type will be paused. |

## Examples

### Pause All Music

```javascript
'pause music'
```

### Pause a Specific Music Track

```javascript
'pause music mainTheme'
```

### Pause All Sounds

```javascript
'pause sound'
```

### Pause a Specific Sound

```javascript
'pause sound explosion'
```

### Pause All Voices

```javascript
'pause voice'
```

### Pause a Specific Voice

```javascript
'pause voice dialog_001'
```

## Resuming Paused Media

To resume paused media, use the corresponding play action without specifying a new asset:

```javascript
'pause music',           // Pause all music
'Some dialogue here...',
'play music',            // Resume all paused music

'pause sound fireCracks',  // Pause specific sound
'Something happens...',
'play sound',              // Resume all paused sounds (including fireCracks)
```

**Note**: When resuming with `play <type>`, ALL paused media of that type will resume. The play action with a media ID will start new playback, not resume the paused instance.

## Pause vs Stop

| Action | Effect | Reversible | Can Resume |
| :--- | :--- | :--- | :--- |
| **Pause** | Temporarily stops playback, preserving position | Yes (resumes) | Yes, with `play <type>` |
| **Stop** | Completely stops and removes the player | Yes (restarts from history) | No, must replay from start |

Use **pause** when you want to temporarily stop media and resume from where it left off. Use **stop** when you're done with the media entirely.

## Use Cases

### Scene Transition

```javascript
monogatari.script({
    'Start': [
        'play music peaceful with loop',
        'The village was quiet...',
        'pause music',
        'Suddenly, a loud crash!',
        'play sound crash',
        'play music',  // Resume peaceful music
        'The villagers looked around nervously.',
        'end'
    ]
});
```

### Dramatic Pause

```javascript
monogatari.script({
    'Start': [
        'play music suspense with loop',
        'play sound heartbeat with loop',
        'The tension was unbearable...',
        'pause music',
        'pause sound',
        '...',
        'play music',
        'play sound',
        'And then it happened!',
        'end'
    ]
});
```

## Related Actions

- [Play Music](play-music.md) - Play background music
- [Play Sound](play-sound.md) - Play sound effects
- [Play Voice](play-voice.md) - Play voice audio
- [Stop Music](stop-music.md) - Stop music completely
- [Stop Sound](stop-sound.md) - Stop sounds completely
- [Stop Voice](stop-voice.md) - Stop voices completely
