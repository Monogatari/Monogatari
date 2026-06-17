---
title: Dialogs
order: 23
description: The text your players are going to read.
---


# Dialogs

## Description

```javascript
'[character_id][:<expression_id>][:<class_names>] <dialog_text>'
```

Dialogs are the primary way to display text to the player. Any statement in your script that doesn't match any other action will be displayed as dialog.

**Action ID**: `Dialog`

**Reversible**: Yes

**Requires User Interaction**: Yes (player must click/tap to proceed)

**Related Components:**

* [Text Box](../components/text-box.md)

## Syntax

The full dialog syntax is:

```text
[identifier][:<expression>][:<classes>] <text>
```

| Part | Required | Description |
| :--- | :--- | :--- |
| identifier | No | Character ID, `centered`, `nvl`, or `narrator`. If omitted, treated as narrator dialog. |
| expression | No | Expression/side image to show (only for characters with defined expressions). |
| classes | No | Custom CSS classes separated by `\|` (pipe). |
| text | Yes | The dialog text to display. Supports HTML and [text effects](#text-effects). |

## Dialog Types

### Narrator Dialogs

Any statement that doesn't start with a recognized character ID, `centered`, or `nvl` is displayed as a narrator dialog. Narrator dialogs don't show a name in the text box.

```javascript
'The sun was setting over the horizon.'
'It was a peaceful evening.'
```

You can also explicitly use `narrator`:

```javascript
'narrator The story begins here...'
```

### Character Dialogs

To make a character speak, prefix the dialog with their character ID:

```javascript
'y Hi! My name is Yui.'
```

The character's name (as defined in their character declaration) will be displayed in the text box.

#### With Expression/Side Image

If you've defined `expressions` in your character declaration, you can specify which expression to show:

```javascript
'y:happy Hi! I am so glad to meet you!'
'y:sad But I have to go now...'
```

The expression image appears as a side image next to the text.

#### Default Expression

If a character has a `default_expression` defined, it will be shown automatically when no expression is specified:

```javascript
// Character definition
monogatari.characters({
    'y': {
        name: 'Yui',
        color: '#ff0000',
        default_expression: 'normal',
        expressions: {
            'normal': 'yui_normal.png',
            'happy': 'yui_happy.png',
            'sad': 'yui_sad.png'
        }
    }
});

// In script - will show 'normal' expression
'y Hello there!'
```

### Centered Dialogs

The `centered` keyword displays text in a floating box in the center of the screen, hiding the regular text box:

```javascript
'centered This is a dramatic moment.'
```

Centered dialogs use the `<centered-dialog>` component instead of `<text-box>`.

### NVL Dialogs

NVL (Novel) mode displays multiple lines of dialog on screen at once, similar to visual novels like Fate/stay Night. The screen fills up with consecutive dialog entries.

```javascript
'nvl The rain continued to fall.',
'nvl I stood there, watching the droplets hit the window.',
'nvl Each one seemed to carry a memory with it.'
```

#### NVL Characters

Characters can be set to always use NVL mode by adding `nvl: true` to their definition:

```javascript
monogatari.characters({
    'narrator_nvl': {
        name: '',
        nvl: true
    }
});

// This will automatically use NVL mode
'narrator_nvl A long time ago, in a distant land...'
```

**Note**: Side images/expressions are not supported in NVL mode.

## Custom Classes

You can apply custom CSS classes to the text-box (or centered-dialog) element by adding them after the expression:

```javascript
'y:happy:highlight Hello!'           // Single class
'y:sad:warning|urgent Important!'    // Multiple classes (pipe-separated)
'narrator::thought A quiet thought'  // No expression, just class
'centered::dramatic A revelation!'   // Centered with class
```

Classes are reset on every dialog, so you must include them on each dialog where you want them applied.

### Example CSS for Custom Classes

```css
text-box.highlight {
    background: rgba(255, 255, 0, 0.3);
}

text-box.warning {
    border: 2px solid red;
}

centered-dialog.dramatic {
    font-size: 2em;
    text-shadow: 0 0 10px white;
}
```

## Clear Command

The `clear` command removes all text from the dialog area:

```javascript
'clear'
```

The clear command automatically advances to the next statement without requiring player interaction. Use a `wait` command after it if you want the player to see a blank dialog box:

```javascript
'y I need a moment to think...',
'clear',
'wait 2000',
'y Okay, I have decided!'
```

## Text Effects

Dialogs support inline text effects using special markers. These are processed by the TypeWriter component.

### Pause

Pause the typing animation for a specified duration:

```javascript
'y Hello...{pause:1000} Are you there?'
```

The `{pause:N}` marker pauses for N milliseconds.

### Speed

Change the typing speed mid-dialog:

```javascript
'y This is normal speed. {speed:50}This is slower. {speed:200}This is faster!'
```

The `{speed:N}` marker changes speed as a percentage (100 = normal, 50 = half speed, 200 = double speed).

### Visual Effects

Enclosed effects apply visual styling to text. Use `{effect}text{/effect}` syntax:

**Animation Effects:**
- `{shake}text{/shake}` - Shaking text
- `{shake-hard}`, `{shake-slow}`, `{shake-little}`, `{shake-horizontal}`, `{shake-vertical}` - Shake variants
- `{wave}text{/wave}` - Wavy text animation
- `{wave-slow}`, `{wave-fast}` - Wave speed variants
- `{fade}text{/fade}` - Fading text
- `{fade-slow}` - Slow fade
- `{blur}text{/blur}` - Blurry text
- `{scale}text{/scale}` - Scaling animation
- `{scale-bounce}` - Bouncy scaling
- `{slide-up}`, `{slide-down}` - Sliding animations
- `{glitch}text{/glitch}` - Glitch effect
- `{glitch-hard}`, `{glitch-slow}` - Glitch variants
- `{flicker}text{/flicker}` - Flickering text

**Style Effects:**
- `{bold}text{/bold}` - Bold text
- `{italic}text{/italic}` - Italic text
- `{big}text{/big}` - Larger text
- `{small}text{/small}` - Smaller text
- `{strike}text{/strike}` - Strikethrough
- `{redacted}text{/redacted}` - Redacted/censored style
- `{invisible-ink}text{/invisible-ink}` - Hidden until hover
- `{handwriting}text{/handwriting}` - Handwritten style

**Emotion Effects:**
- `{angry}text{/angry}` - Angry styling
- `{scared}text{/scared}` - Scared styling
- `{happy}text{/happy}` - Happy styling
- `{sad}text{/sad}` - Sad styling
- `{mysterious}text{/mysterious}` - Mysterious styling
- `{excited}text{/excited}` - Excited styling
- `{whisper}text{/whisper}` - Whisper styling
- `{shout}text{/shout}` - Shouting styling
- `{dizzy}text{/dizzy}` - Dizzy effect
- `{dreamy}text{/dreamy}` - Dreamy effect
- `{robotic}text{/robotic}` - Robotic styling
- `{static}text{/static}` - Static/noise effect
- `{rainbow}text{/rainbow}` - Rainbow colors
- `{glow}text{/glow}` - Glowing text
- `{impact}text{/impact}` - Impact/emphasis styling

### Combining Effects

You can combine multiple effects and markers:

```javascript
'y I am {angry}so frustrated{/angry}!{pause:500} {whisper}But I will be okay{/whisper}...'
```

## HTML Support

Dialogs support inline HTML for additional formatting:

```javascript
'y The <span class="highlight">important</span> thing is...'
'y Press the <i class="fa fa-arrow-left"></i> button to go back.'
```

## Related Settings

| Setting | Default | Description |
| :--- | :--- | :--- |
| `TypeAnimation` | `true` | Enable/disable typing animation globally |
| `NVLTypeAnimation` | `true` | Enable/disable typing animation in NVL mode |
| `CenteredTypeAnimation` | `true` | Enable/disable typing animation for centered dialogs |
| `NarratorTypeAnimation` | `true` | Enable/disable typing animation for narrator |
| `TextSpeed` | varies | Typing speed (lower = faster). Configurable by player in settings. |

## Related Components

- [Text Box](../components/text-box.md) - The component that displays dialogs
- [Dialog Log](#dialog-log) - View history of dialogs

## Dialog Log

The dialog log stores all dialogs displayed during gameplay. Players can access it via the quick menu to review past conversations.

The log is automatically populated as dialogs are shown and supports scrolling through the entire conversation history.
