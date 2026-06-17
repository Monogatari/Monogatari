---
title: Centered Dialog
order: 67
description: A floating dialog box centered on the screen, shown when a line begins with the `centered` keyword.
---

# Centered Dialog

## Description

```markup
<centered-dialog></centered-dialog>
```

The centered-dialog component displays text in a floating box centered on the screen. It is used when dialogs begin with the `centered` keyword. While a centered dialog is visible, the regular [text-box](text-box.md) is hidden.

**Source Code**: [https://github.com/Monogatari/Monogatari/tree/develop/src/components/centered-dialog](https://github.com/Monogatari/Monogatari/tree/develop/src/components/centered-dialog)

## Usage

Centered dialogs are created automatically by the [Dialog action](../script-actions/dialogs.md) when the `centered` keyword is used:

```javascript
'centered This is a dramatic moment.'
'centered::dramatic An even more dramatic moment!'
```

## Structure

The centered-dialog component renders a simple structure with a type-writer for animated text:

```html
<centered-dialog data-component="centered-dialog">
    <type-writer data-content="wrapper"></type-writer>
</centered-dialog>
```

## Content Areas

| Name | Selector | Description |
| :--- | :--- | :--- |
| `wrapper` | `[data-content="wrapper"]` | The type-writer element containing the centered text |

## Lifecycle

1. When `centered` dialog is triggered, a new `<centered-dialog>` element is created
2. The regular `<text-box>` is hidden
3. The centered dialog is appended to the game screen
4. When the player proceeds, the centered dialog is removed and text-box is restored

## Custom Classes

Custom CSS classes can be applied to the centered-dialog using the dialog syntax:

```javascript
'centered::highlight Important announcement!'
'centered::dramatic|urgent Critical message!'
```

Classes are specified after double colons and separated by `|` (pipe).

## Styling

```css
/* Main container */
centered-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* Add your styling */
}

/* Animated entrance */
centered-dialog.animated {
    animation: fadeIn 0.3s ease-out;
}

/* Custom class example */
centered-dialog.dramatic {
    font-size: 2em;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
}

/* The text wrapper */
centered-dialog [data-content="wrapper"] {
    /* Type-writer container styles */
}
```

## Animation Settings

The typing animation for centered dialogs can be controlled via the `CenteredTypeAnimation` setting:

```javascript
// Enable/disable typing animation for centered dialogs
monogatari.setting('CenteredTypeAnimation', true);  // default
monogatari.setting('CenteredTypeAnimation', false); // instant display
```

`CenteredTypeAnimation` is part of the `TypeAnimation` family of settings that control the typewriter animation. See [Game Configuration](../configuration-options/game-configuration/README.md) for the full family.

## Methods

The centered-dialog component inherits from the base Component class. The type-writer inside provides all text animation functionality.

### Accessing the Type Writer

```javascript
const centeredDialog = document.querySelector('centered-dialog');
const typeWriter = centeredDialog.content('wrapper').get(0);

// Force finish animation
typeWriter.finish(true);
```

## Related

- [Text Box](text-box.md) - The regular dialog display component
- [Type Writer](type-writer.md) - Handles text animation
- [Dialog Action](../script-actions/dialogs.md) - Controls when centered dialogs appear

