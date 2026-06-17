---
title: Type Writer
order: 69
description: Animated text rendering that reveals characters one at a time, with inline effects, pauses and speed changes.
---

# Type Writer

## Description

```markup
<type-writer></type-writer>
```

The type-writer component handles animated text display, revealing characters one at a time with support for inline effects, pauses, and speed changes. It is used by the [text-box](text-box.md) and [centered-dialog](centered-dialog.md) components.

**Source Code**: [https://github.com/Monogatari/Monogatari/tree/develop/src/components/type-writer](https://github.com/Monogatari/Monogatari/tree/develop/src/components/type-writer)

## Properties

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `string` | `string \| false` | `false` | The text to display |
| `typeSpeed` | `number` | User preference | Typing speed in milliseconds per character |
| `loop` | `boolean \| number` | `false` | Whether to loop the animation, or number of loops |
| `showCursor` | `boolean` | `false` | Show a blinking cursor during typing |
| `hideCursorOnEnd` | `boolean` | `false` | Hide cursor when typing completes |
| `delay` | `number` | `undefined` | Delay before starting animation (ms) |
| `start` | `boolean` | `false` | Auto-start animation on mount |

## Methods

### `setContent(text: string, animate?: boolean): void`

The primary API for displaying text. Sets the content and optionally animates it.

```javascript
const typeWriter = document.querySelector('type-writer');

// With animation
typeWriter.setContent('Hello, world!', true);

// Without animation (instant display)
typeWriter.setContent('Hello, world!', false);
```

### `finish(instant?: boolean): void`

Complete the typing animation immediately.

```javascript
const typeWriter = document.querySelector('type-writer');

// Rush through remaining text at max speed
typeWriter.finish(false);

// Instantly show all text
typeWriter.finish(true);
```

### `stop(): void`

Stop the typing animation at its current position.

```javascript
typeWriter.stop();
```

### `start(): void`

Resume a stopped animation.

```javascript
typeWriter.start();
```

### `destroy(): void`

Stop and clean up the animation.

```javascript
typeWriter.destroy();
```

## Action Markers

The type-writer supports inline action markers that control the animation. These are stripped from the final displayed text.

### Pause

Pause the animation for a specified duration:

```javascript
'Hello...{pause:1000} How are you?'  // Pause for 1 second
'Hello...{pause 1000} How are you?'  // Alternative syntax
```

### Speed

Change the typing speed as a percentage (100 = normal):

```javascript
'Normal speed. {speed:50}Half speed. {speed:200}Double speed!'
```

### Enclosed Effects

Apply visual effects to portions of text using `{effect}text{/effect}` syntax:

#### Animation Effects

| Effect | Description |
| :--- | :--- |
| `{shake}` | Shaking text |
| `{shake-hard}` | Intense shaking |
| `{shake-slow}` | Slow shaking |
| `{shake-little}` | Subtle shaking |
| `{shake-horizontal}` | Horizontal shaking only |
| `{shake-vertical}` | Vertical shaking only |
| `{wave}` | Wavy animation |
| `{wave-slow}` | Slow wave |
| `{wave-fast}` | Fast wave |
| `{fade}` | Fading in/out |
| `{fade-slow}` | Slow fade |
| `{blur}` | Blurred text |
| `{scale}` | Scaling animation |
| `{scale-bounce}` | Bouncy scaling |
| `{slide-up}` | Sliding up |
| `{slide-down}` | Sliding down |
| `{glitch}` | Glitch effect |
| `{glitch-hard}` | Intense glitch |
| `{glitch-slow}` | Slow glitch |
| `{flicker}` | Flickering |

#### Style Effects

| Effect | Description |
| :--- | :--- |
| `{bold}` | Bold text |
| `{italic}` | Italic text |
| `{big}` | Larger text |
| `{small}` | Smaller text |
| `{strike}` | Strikethrough |
| `{redacted}` | Redacted/censored |
| `{invisible-ink}` | Hidden until hover |
| `{handwriting}` | Handwritten style |
| `{impact}` | Impact emphasis |

#### Emotion Effects

| Effect | Description |
| :--- | :--- |
| `{angry}` | Angry styling (red, shaking) |
| `{scared}` | Scared styling |
| `{happy}` | Happy styling |
| `{sad}` | Sad styling |
| `{mysterious}` | Mysterious styling |
| `{excited}` | Excited styling |
| `{whisper}` | Whisper (small, faded) |
| `{shout}` | Shouting (large, bold) |
| `{dizzy}` | Dizzy effect |
| `{dreamy}` | Dreamy styling |
| `{robotic}` | Robotic/monospace |
| `{static}` | Static noise effect |
| `{rainbow}` | Rainbow colors |
| `{glow}` | Glowing text |

#### Example

```javascript
'y I am {angry}so frustrated{/angry}! {pause:500}{whisper}But it will be okay{/whisper}.'
```

## Registering Custom Actions

You can register custom actions using the static `action` method:

```javascript
// Number action (like pause/speed)
TypeWriter.action({
    name: 'myaction',
    type: 'number',
    action: function(number) {
        console.log('Action with value:', number);
    }
});

// Usage: {myaction:500}

// Enclosed action (wraps text)
TypeWriter.action({
    name: 'highlight',
    type: 'enclosed',
    action: function() {
        // Effects are applied via CSS using the action name as a class
    }
});

// Usage: {highlight}text{/highlight}
```

### Action Types

| Type | Syntax | Description |
| :--- | :--- | :--- |
| `number` | `{name:N}` or `{name N}` | Action with a numeric parameter |
| `enclosed` | `{name}...{/name}` | Wraps text, applies CSS class |
| `instance` | `{name/}` | Self-closing, single-point action |

## Static Methods

### `TypeWriter.actions(): TypeWriterActions`

Get all registered actions.

### `TypeWriter.action(action: TypeWriterAction): TypeWriterAction`

Register a new action or get an existing one.

### `TypeWriter.stripActionMarkers(str: string): string`

Remove all action markers from a string, returning plain text.

```javascript
const clean = TypeWriter.stripActionMarkers('Hello {pause:500} {shake}world{/shake}!');
// Returns: 'Hello  world!'
```

### `TypeWriter.configuration(config?: object): object`

Get or set the component configuration.

## Events

The type-writer triggers engine events during its lifecycle:

| Event | Description |
| :--- | :--- |
| `didStartTyping` | Fired when typing animation begins |
| `didFinishTyping` | Fired when typing animation completes |

## Global State

| Global | Description |
| :--- | :--- |
| `finished_typing` | `true` when typing is complete, `false` during animation |

## Styling

Each character is wrapped in a `<type-character>` element:

```css
/* Individual characters */
type-character {
    /* Base character styles */
}

/* Cursor (when enabled) */
type-character.cursor::after {
    content: '|';
    animation: blink 1s infinite;
}

/* Effect classes are applied to type-character elements */
type-character[data-special*="shake"] {
    animation: shake 0.5s infinite;
}
```

## Related

- [Text Box](text-box.md) - Contains type-writer for dialog display
- [Centered Dialog](centered-dialog.md) - Contains type-writer for centered text
- [Dialog Action](../script-actions/dialogs.md) - Uses type-writer for text animation

