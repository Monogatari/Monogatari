---
title: Play Sound
order: 39
description: Play a sound effect
---


# Play Sound

## Description

```javascript
'play sound <sound_id> [with [loop] [fade <time>] [volume <percentage>] [<effects>]]'
'play sound'  // Resume all paused sounds
```

The `play sound` action lets you play sound effects in your game. You can play as many sound effects as you want simultaneously.

To stop the sound, check out the [Stop Sound documentation](stop-sound.md).

**Action ID**: `Play`

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| sound\_id | `string` | The name of the sound you want to play. These assets must be declared beforehand. |
| loop | `flag` | Optional. Makes the sound loop indefinitely. |
| fade | `number` | Optional. Fade in time in seconds. |
| volume | `number` | Optional. Volume percentage (0-100). |
| effects | `various` | Optional. Audio effects to apply (see [Audio Effects](play-music.md#audio-effects)). |

## Assets Declarations

To play a sound, you must first add the file to your **`assets/sounds/`** directory and then declare it. To do so, Monogatari has a function that will let you declare all kinds of assets for your game.

```javascript
monogatari.assets('sounds', {
    '<sound_id>': 'soundFileName'
});
```

### Supported Formats

Each browser has its own format compatibility. **MP3** however is the format supported by every browser.

If you wish to use other formats, you can check a [compatibility table](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#Browser_compatibility) to discover what browsers will be able to play it.

## Examples

### Play Sound

The following will play the sound, and once the sound ends, it will simply stop.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play sound riverFlow',
        'end'
    ]
});
```



**Sound Assets**

```javascript
monogatari.assets('sounds', {
    'riverFlow': 'river_water_flowing.mp3'
});
```



### Loop Sound

The following will play the sound, and once the sound ends, it will start over on an infinite loop until it is stopped using the [Stop Sound Action](stop-sound.md).



**Script**

```javascript
monogatari.script({
    'Start': [
        'play sound riverFlow with loop',
        'end'
    ]
});
```



**Sound Assets**

```javascript
monogatari.assets('sounds', {
    'riverFlow': 'river_water_flowing.mp3'
});
```



### Fade In Effect

The following will play the sound with a fade in effect.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play sound riverFlow with fade 3',
        'end'
    ]
});
```



**Sound Assets**

```javascript
monogatari.assets('sounds', {
    'riverFlow': 'river_water_flowing.mp3'
});
```



### Custom Volume

The following will set the volume of this sound to 73%.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play sound riverFlow with volume 73',
        'end'
    ]
});
```



**Sound Assets**

```javascript
monogatari.assets('sounds', {
    'riverFlow': 'river_water_flowing.mp3'
});
```



Please note that the user's preferences regarding volumes are always respected, which means this percentage is taken from the current player preferences. If the player has set the volume to 50%, the actual volume value for the sound will be:

$$
50\% \times 73\% = 36.5\%
$$

### Resume Paused Sounds

If sounds have been paused using the [Pause action](pause.md), you can resume them:

```javascript
'play sound'  // Resume all paused sounds
```

### All Together

You can combine all properties. The order doesn't matter.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play sound riverFlow with volume 100 loop fade 2',
        'end'
    ]
});
```



**Sound Assets**

```javascript
monogatari.assets('sounds', {
    'riverFlow': 'river_water_flowing.mp3'
});
```



## Audio Effects

Sound effects support the same [audio effects system](play-music.md#audio-effects) available for music, including filter, delay, compressor, tremolo, distortion, reverb, and many more. See the [Play Music documentation](play-music.md#audio-effects) for a complete list of available effects and their usage.

### Example with Effects

```javascript
'play sound explosion with filter lowpass 800 2 convreverb 2 1.5'
```

This plays an explosion sound with a low-pass filter and reverb for a more distant, muffled effect.

## Related Actions

- [Stop Sound](stop-sound.md) - Stop playing sounds
- [Pause](pause.md) - Pause playing media
- [Play Music](play-music.md) - Play background music (includes full audio effects documentation)
