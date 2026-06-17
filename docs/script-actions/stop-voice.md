---
title: Stop Voice
order: 55
description: Stop playing voice audio
---


# Stop Voice

## Description

```javascript
'stop voice [voice_id] [with fade <time>]'
```

The stop voice action will let you stop either all voices currently playing or only one in specific. To learn more about voices, read the [Play Voice documentation](play-voice.md).

**Note**: Voice audio is automatically stopped when the player advances to the next statement. This action is useful when you want to stop a voice before the player proceeds, or when you have looping voice audio.

**Action ID**: `Stop`

**Reversible**: Yes (restores the previously playing voices from history)

**Requires User Interaction**: No

## Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| voice\_id | `string` | Optional. The name of the specific voice you want to stop. If omitted, all voices will be stopped. |
| fade | `number` | Optional. Fade out time in seconds. |

## Examples

### Stop a Specific Voice

The following will stop a specific voice, identified by its name.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play voice dialog_002 with loop',
        'The previous voice will be repeating itself over and over',
        'play voice dialog_001',
        'Two voices are currently playing',
        'stop voice dialog_002',
        'Now the first one has stopped and the second one will stop as soon as it ends',
        'end'
    ]
});
```



**Voice Assets**

```javascript
monogatari.assets('voices', {
    'dialog_001': 'dialog_file_1.mp3',
    'dialog_002': 'dialog_file_2.mp3'
});
```



### Stop All Voices

The following will stop all voices currently playing.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play voice dialog_002 with loop',
        'The previous voice will be repeating itself over and over',
        'play voice dialog_001',
        'Two voices are currently playing',
        'stop voice',
        'No voice is playing now',
        'end'
    ]
});
```



**Voice Assets**

```javascript
monogatari.assets('voices', {
    'dialog_001': 'dialog_file_1.mp3',
    'dialog_002': 'dialog_file_2.mp3'
});
```



### Fade Out Effect

The following will stop the voice with a fade out effect. You can also use a fade out effect when stopping all voices.



**Script**

```javascript
monogatari.script({
    'Start': [
        'play voice dialog_002 with loop',
        'The previous voice will be repeating itself over and over',
        'play voice dialog_001',
        'Two voices are currently playing',
        'stop voice dialog_002 with fade 2',
        'The looping voice fades out...',
        'end'
    ]
});
```



**Voice Assets**

```javascript
monogatari.assets('voices', {
    'dialog_001': 'dialog_file_1.mp3',
    'dialog_002': 'dialog_file_2.mp3'
});
```



### Fade Out All Voices

```javascript
'stop voice with fade 3'  // Fade out all voices over 3 seconds
```

## Related Actions

- [Play Voice](play-voice.md) - Play voice audio
- [Pause](pause.md) - Pause playing media (can be resumed later)
