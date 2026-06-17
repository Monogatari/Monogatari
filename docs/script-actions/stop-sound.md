---
title: Stop Sound
order: 54
description: Stop playing sound effects
---


# Stop Sound

## Description

```javascript
'stop sound [sound_id] [with fade <time>]'
```

The stop sound action will let you stop either all sounds currently playing or only one in specific. To learn more about sounds, read the [Play Sound documentation](play-sound.md).

**Action ID**: `Stop`

**Reversible**: Yes (restores the previously playing sounds from history)

**Requires User Interaction**: No

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| sound\_id | `string` | Optional. The name of the specific sound you want to stop. If omitted, all sounds will be stopped. |
| fade | `number` | Optional. Fade out time in seconds. |

## Examples

### Stop a Specific Sound

The following will stop a specific sound, identified by its name.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play sound night with loop',
        'play sound fireCracks with loop',
        'Two sounds are currently playing',
        'stop sound fireCracks',
        'I guess someone put out the fire, only the night sounds are heard now',
        'end'
    ]
});
```



**Sound Assets**

```javascript
monogatari.assets('sounds', {
    'fireCracks': 'fire-cracks.mp3',
    'night': 'night.mp3'
});
```



### Stop All Sounds

The following will stop all sounds currently playing.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play sound night with loop',
        'play sound fireCracks with loop',
        'Two sounds are currently playing',
        'stop sound',
        'It really is a silent night, nothing is heard anymore',
        'end'
    ]
});
```



**Sound Assets**

```javascript
monogatari.assets('sounds', {
    'fireCracks': 'fire-cracks.mp3',
    'night': 'night.mp3'
});
```



### Fade Out Effect

The following will stop the sound with a fade out effect. You can also use a fade out effect when stopping all sounds.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play sound night with loop',
        'play sound fireCracks with loop',
        'Two sounds are currently playing',
        'stop sound fireCracks with fade 12',
        'The fire slowly dies down...',
        'end'
    ]
});
```



**Sound Assets**

```javascript
monogatari.assets('sounds', {
    'fireCracks': 'fire-cracks.mp3',
    'night': 'night.mp3'
});
```



### Fade Out All Sounds

```javascript
'stop sound with fade 3'  // Fade out all sounds over 3 seconds
```

## Related Actions

- [Play Sound](play-sound.md) - Play sound effects
- [Pause](pause.md) - Pause playing media (can be resumed later)
