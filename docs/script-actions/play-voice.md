---
title: Play Voice
order: 40
description: Play a voice audio file
---


# Play Voice

## Description

```javascript
'play voice <voice_id> [with [loop] [fade <time>] [volume <percentage>] [<effects>]]'
'play voice'  // Resume all paused voices
```

The `play voice` action lets you play voice files so that you can make your characters speak. You can play as many voices as you want simultaneously.

**Important**: Voice audio is automatically stopped when the player advances to the next statement. This ensures voice lines don't overlap with subsequent dialogue.

To stop a voice manually, check out the [Stop Voice documentation](stop-voice.md).

**Action ID**: `Play`

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| voice\_id | `string` | The name of the voice file you want to play. These assets must be declared beforehand. |
| loop | `flag` | Optional. Makes the voice loop indefinitely. |
| fade | `number` | Optional. Fade in time in seconds. |
| volume | `number` | Optional. Volume percentage (0-100). |
| effects | `various` | Optional. Audio effects to apply (see [Audio Effects](play-music.md#audio-effects)). |

## Assets Declarations

To play a voice, you must first add the file to your **`assets/voices/`** directory and then declare it. To do so, Monogatari has a function that will let you declare all kinds of assets for your game.

```javascript
monogatari.assets('voices', {
    '<voice_id>': 'voiceFileName'
});
```

### Supported Formats

Each browser has its own format compatibility. **MP3** however is the format supported by every browser.

If you wish to use other formats, you can check a [compatibility table](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#Browser_compatibility) to discover what browsers will be able to play it.

## Examples

### Play Voice

The following will play the voice file, and once it ends, it will simply stop.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play voice dialog_001',
        'This is the dialog that the voice file is narrating',
        'end'
    ]
});
```



**Voice Assets**

```javascript
monogatari.assets('voices', {
    'dialog_001': 'dialog_file_1.mp3'
});
```



### Loop Voice

The following will play the voice file, and once it ends, it will start over on an infinite loop until it is stopped using the [Stop Voice Action](stop-voice.md).



**Script**

```javascript
monogatari.script({
    'Start': [
        'play voice dialog_001 with loop',
        'This is the dialog that the voice file is narrating',
        'end'
    ]
});
```



**Voice Assets**

```javascript
monogatari.assets('voices', {
    'dialog_001': 'dialog_file_1.mp3'
});
```



### Fade In Effect

The following will play the voice file with a fade in effect.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play voice dialog_001 with fade 3',
        'This is the dialog that the voice file is narrating',
        'end'
    ]
});
```



**Voice Assets**

```javascript
monogatari.assets('voices', {
    'dialog_001': 'dialog_file_1.mp3'
});
```



### Custom Volume

The following will set the volume of this voice to 73%.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play voice dialog_001 with volume 73',
        'This is the dialog that the voice file is narrating',
        'end'
    ]
});
```



**Voice Assets**

```javascript
monogatari.assets('voices', {
    'dialog_001': 'dialog_file_1.mp3'
});
```



Please note that the user's preferences regarding volumes are always respected, which means this percentage is taken from the current player preferences. If the player has set the volume to 50%, the actual volume value for the voice will be:

$$
50\% \times 73\% = 36.5\%
$$

### Resume Paused Voices

If voices have been paused using the [Pause action](pause.md), you can resume them:

```javascript
'play voice'  // Resume all paused voices
```

### All Together

You can combine all properties. The order doesn't matter.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play voice dialog_001 with volume 100 loop fade 2',
        'This is the dialog that the voice file is narrating',
        'end'
    ]
});
```



**Voice Assets**

```javascript
monogatari.assets('voices', {
    'dialog_001': 'dialog_file_1.mp3'
});
```



## Audio Effects

Voice audio supports the same [audio effects system](play-music.md#audio-effects) available for music, including filter, delay, compressor, tremolo, distortion, reverb, and many more. See the [Play Music documentation](play-music.md#audio-effects) for a complete list of available effects and their usage.

### Example with Effects

```javascript
'play voice phone_call with filter highpass 300 1 filter lowpass 3000 1'
```

This simulates a phone call effect by filtering out low and high frequencies.

## Voice Behavior

### Auto-Stop on Proceed

Voice players are automatically stopped when the player proceeds to the next statement. This prevents voice lines from overlapping. This behavior is controlled by the `shouldProceed` and `willProceed` lifecycle hooks in the Play action.

### Wait for Voice

By default, if auto-proceed is enabled (not skip mode), the game will wait for voice playback to finish before automatically advancing. This ensures the player hears the full voice line.

## Related Actions

- [Stop Voice](stop-voice.md) - Stop playing voices
- [Pause](pause.md) - Pause playing media
- [Play Music](play-music.md) - Play background music (includes full audio effects documentation)
