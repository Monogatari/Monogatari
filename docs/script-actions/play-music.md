---
title: Play Music
order: 38
description: Play music media
---


# Play Music

## Description

```javascript
'play music <music_id> [with [loop] [fade <time>] [volume <percentage>] [<effects>]]'
'play music'  // Resume all paused music
```

The `play music` action lets you play background music for your game. You can play as many songs as you want simultaneously.

To stop the music, check out the [Stop Music documentation](stop-music.md).

**Action ID**: `Play`

**Reversible**: Yes

**Requires User Interaction**: No

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| music\_id | `string` | The name of the music you want to play. These assets must be declared beforehand. |
| loop | `flag` | Optional. Makes the music loop indefinitely. |
| fade | `number` | Optional. Fade in time in seconds. |
| volume | `number` | Optional. Volume percentage (0-100). |
| effects | `various` | Optional. Audio effects to apply (see [Audio Effects](#audio-effects)). |

## Assets Declarations

To play a song, you must first add the file to your **`assets/music/`** directory and then declare it. To do so, Monogatari has a function that will let you declare all kinds of assets for your game.

```javascript
monogatari.assets('music', {
    '<music_id>': 'musicFileName'
});
```

### Supported Formats

Each browser has its own format compatibility. **MP3** however is the format supported by every browser.

If you wish to use other formats, you can check a [compatibility table](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#Browser_compatibility) to discover what browsers will be able to play it.

## Examples

### Play Music

The following will play the song, and once the song ends, it will simply stop.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play music mainTheme',
        'end'
    ]
});
```



**Music Assets**

```javascript
monogatari.assets('music', {
    'mainTheme': 'mainThemeSong.mp3'
});
```



### Loop Music

The following will play the song, and once the song ends, it will start over on an infinite loop until it is stopped using the [Stop Music Action](stop-music.md).



**Script**

```javascript
monogatari.script({
    'Start': [
        'play music mainTheme with loop',
        'end'
    ]
});
```



**Music Assets**

```javascript
monogatari.assets('music', {
    'mainTheme': 'mainThemeSong.mp3'
});
```



### Fade In Effect

The following will play the song with a fade in effect.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play music mainTheme with fade 3',
        'end'
    ]
});
```



**Music Assets**

```javascript
monogatari.assets('music', {
    'mainTheme': 'mainThemeSong.mp3'
});
```



### Custom Volume

The following will set the volume of this song to 73%.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play music mainTheme with volume 73',
        'end'
    ]
});
```



**Music Assets**

```javascript
monogatari.assets('music', {
    'mainTheme': 'mainThemeSong.mp3'
});
```



Please note that the user's preferences regarding volumes are always respected, which means this percentage is taken from the current player preferences. If the player has set the volume to 50%, the actual volume value for the song will be:

$$
50\% \times 73\% = 36.5\%
$$

### Resume Paused Music

If music has been paused using the [Pause action](pause.md), you can resume it:

```javascript
'play music'  // Resume all paused music
```

### All Together

You can combine all properties. The order doesn't matter.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play music mainTheme with volume 100 loop fade 2',
        'end'
    ]
});
```



**Music Assets**

```javascript
monogatari.assets('music', {
    'mainTheme': 'mainThemeSong.mp3'
});
```



## Audio Effects

You can apply multiple audio effects to your music by specifying them in the properties. These effects use the Web Audio API for real-time audio processing.

### Effect Syntax

Effects are specified by their name followed by their parameters:

```javascript
'play music <music_id> with <effect_name> <param1> <param2> ...'
```

### Available Effects

#### Filter

Applies a Biquad filter (lowpass, highpass, etc.)

**Parameters:**

* `type` - Filter type: `lowpass`, `highpass`, `bandpass`, `notch`, `allpass`, `peaking`, `lowshelf`, `highshelf` (default: `lowpass`)
* `frequency` - Cutoff frequency in Hz (default: `800`)
* `Q` - Quality factor (default: `1`)
* `gain` - Filter gain in dB (default: `0`)

**Example:**

```javascript
'play music mainTheme with filter lowpass 400 2'
```

#### Delay

A simple delay effect with feedback.

**Parameters:**

* `time` - Delay time in seconds (default: `0.4`)
* `feedback` - Feedback amount 0-1 (default: `0.5`)
* `mix` - Wet/dry mix 0-1 (default: `0.5`)

**Example:**

```javascript
'play music mainTheme with delay 0.5 0.3 0.7'
```

#### Compressor

Dynamic range compression.

**Parameters:**

* `threshold` - Compression threshold in dB (default: `-24`)
* `knee` - Knee width in dB (default: `30`)
* `ratio` - Compression ratio (default: `12`)
* `attack` - Attack time in seconds (default: `0.003`)
* `release` - Release time in seconds (default: `0.25`)

**Example:**

```javascript
'play music mainTheme with compressor -20 20 8 0.01 0.1'
```

#### Tremolo

Modulates the amplitude of the signal.

**Parameters:**

* `frequency` - Modulation frequency in Hz (default: `5`)
* `depth` - Modulation depth 0-1 (default: `0.8`)

**Example:**

```javascript
'play music mainTheme with tremolo 3 0.6'
```

#### Distortion

Applies wave-shaping distortion.

**Parameters:**

* `amount` - Distortion amount (default: `50`)
* `oversample` - Oversampling: `2x`, `4x`, or `none` (default: `4x`)

**Example:**

```javascript
'play music mainTheme with distortion 30 2x'
```

#### Convolution Reverb

Convolution reverb with a generated impulse response.

**Parameters:**

* `seconds` - Reverb duration in seconds (default: `2`)
* `decay` - Decay rate (default: `2`)
* `reverse` - Reverse the impulse response (default: `false`)

**Example:**

```javascript
'play music mainTheme with convreverb 3 1.5'
```

#### Bitcrusher

Reduces bit depth and sample rate of the signal.

**Parameters:**

* `bits` - Bit depth 1-16 (default: `4`)
* `frequency` - Sample rate reduction 0-1 (default: `0.1`)

**Example:**

```javascript
'play music mainTheme with bitcrusher 8 0.2'
```

#### AutoWah

An envelope-following filter (auto-wah).

**Parameters:**

* `baseFrequency` - Base frequency in Hz (default: `100`)
* `octaves` - Frequency range in octaves (default: `6`)
* `sensitivity` - Envelope sensitivity 0-1 (default: `0.5`)
* `Q` - Filter Q factor (default: `10`)

**Example:**

```javascript
'play music mainTheme with autowah 200 4 0.7 15'
```

#### Panner

Positions the sound in 3D space.

**Parameters:**

* `x` - X position (default: `0`)
* `y` - Y position (default: `0`)
* `z` - Z position (default: `0`)

**Example:**

```javascript
'play music mainTheme with panner 1 0 0'
```

#### Phaser

A sweeping phase-shifting effect.

**Parameters:**

* `frequency` - LFO frequency in Hz (default: `0.5`)
* `depth` - Modulation depth in Hz (default: `1000`)
* `feedback` - Feedback amount 0-1 (default: `0.5`)
* `stages` - Number of filter stages (default: `4`)

**Example:**

```javascript
'play music mainTheme with phaser 1 800 0.3 6'
```

#### Chorus

Creates a thicker sound by modulating a delayed signal.

**Parameters:**

* `frequency` - LFO frequency in Hz (default: `1.5`)
* `delay` - Delay time in seconds (default: `0.025`)
* `depth` - Modulation depth in seconds (default: `0.002`)
* `mix` - Wet/dry mix 0-1 (default: `0.5`)

**Example:**

```javascript
'play music mainTheme with chorus 2 0.03 0.003 0.6'
```

#### Wah

A sweeping filter effect, like a guitar wah-wah pedal.

**Parameters:**

* `baseFrequency` - Base frequency in Hz (default: `350`)
* `Q` - Filter Q factor (default: `15`)
* `depth` - Frequency sweep range in Hz (default: `1500`)
* `frequency` - LFO frequency in Hz (default: `2`)

**Example:**

```javascript
'play music mainTheme with wah 500 20 2000 1'
```

#### Ring Modulation

Ring modulation for creating metallic, bell-like sounds.

**Parameters:**

* `frequency` - Modulator frequency in Hz (default: `30`)
* `mix` - Wet/dry mix 0-1 (default: `0.5`)

**Example:**

```javascript
'play music mainTheme with ringmod 50 0.7'
```

#### Saturator

Soft clipping for warmth and harmonics.

**Parameters:**

* `drive` - Drive amount (default: `5`)

**Example:**

```javascript
'play music mainTheme with saturator 3'
```

#### Limiter

A hard compressor to prevent signal peaks from exceeding a threshold.

**Parameters:**

* `threshold` - Limiting threshold in dB (default: `-1.0`)
* `release` - Release time in seconds (default: `0.05`)

**Example:**

```javascript
'play music mainTheme with limiter -3 0.1'
```

#### Fade In

Gradually increases the volume from silence to full over a duration.

**Parameters:**

* `duration` - Fade-in time in seconds (default: `1.0`)

**Example:**

```javascript
'play music mainTheme with fadein 3'
```

#### Fade Out

Gradually decreases the volume to silence over a duration.

**Parameters:**

* `duration` - Fade-out time in seconds (default: `1.0`)

**Example:**

```javascript
'play music mainTheme with fadeout 3'
```

> [!NOTE]
> `fadein` does the same thing as the `fade <time>` parameter shown near the top of this
> page — both fade the music in. Use `fade <time>` for a quick fade-in; reach for the
> `fadein` / `fadeout` effects when you want to chain fading together with other effects.

### Multiple Effects

You can combine multiple effects on a single music track:

```javascript
'play music mainTheme with filter lowpass 600 1.5 delay 0.3 0.4 0.6 tremolo 4 0.5'
```

### Effect Compatibility

Some effects require AudioWorklet support, which may not be available in all browsers:

* **Bitcrusher** and **AutoWah** require AudioWorklet support
* If AudioWorklet is not available, these effects will fall back to a simple gain node (no effect)
* Other effects use standard Web Audio API nodes and work in all modern browsers

### Example: Complex Audio Setup



**Script**

```javascript
monogatari.script({
    'Start': [
        'play music mainTheme with volume 80 loop filter lowpass 400 2 delay 0.5 0.3 0.4',
        'play music ambient with volume 30 filter highpass 200 1 convreverb 4 1.5',
        'Listen to all the effects!',
        'end'
    ]
});
```



**Music Assets**

```javascript
monogatari.assets('music', {
    'mainTheme': 'mainThemeSong.mp3',
    'ambient': 'ambientMusic.mp3'
});
```



This example creates a layered audio experience with:

* A main theme with low-pass filtering, delay, and looping
* An ambient track with high-pass filtering and reverb

## Related Actions

- [Stop Music](stop-music.md) - Stop playing music
- [Pause](pause.md) - Pause playing media
