---
title: Text-Box
order: 66
---

# Text Box

## Description

```markup
<text-box></text-box>
```

The text-box component is responsible for displaying character dialogs, narrator text, and NVL (Novel) mode content. It contains the character name, side image (expression), and the dialog text itself.

**Source Code**: [https://github.com/Monogatari/Monogatari/tree/develop/src/components/text-box](https://github.com/Monogatari/Monogatari/tree/develop/src/components/text-box)

## Structure

The text-box component renders the following structure:

```html
<text-box data-component="text-box">
    <div data-content="name">
        <span data-ui="who" data-content="character-name"></span>
    </div>
    <div data-content="side-image">
        <img data-ui="face" alt="" data-content="character-expression">
    </div>
    <div data-content="text">
        <type-writer data-ui="say" data-content="dialog"></type-writer>
    </div>
</text-box>
```

In NVL mode, the `<type-writer>` element is not included in the initial render, as dialogs are appended dynamically.

## Properties

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `mode` | `'adv'` \| `'nvl'` | `'adv'` | The display mode. `adv` is the standard Adventure mode (single dialog at a time). `nvl` is Novel mode (multiple dialogs on screen). |

## State

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `hidden` | `boolean` | `false` | Whether the text box is hidden. When set to `true` the element is hidden; when set back to `false` it is shown again (as a CSS grid). While `hidden` is `true`, calling `show()` is a no-op, so the box stays hidden until it is explicitly unhidden. |

The `hidden` state is toggled by the [Show Text Box](../script-actions/show-textbox.md) and [Hide Text Box](../script-actions/hide-textbox.md) script actions, which set it to `false` and `true` respectively (and persist the choice in the game state so it survives saving/loading).

> [!NOTE]
> The quick-menu **Hide** button is a separate, *distraction-free* mechanism. It hides the text-box element directly (toggling the `distraction_free` global), and does **not** change this `hidden` state.

> [!TIP]
> The typewriter animation used inside the text box is controlled by the `TypeAnimation` family of settings. See [Game Configuration](../configuration-options/game-configuration/README.md) for details.

## Data Attributes

| Attribute | Description |
| :--- | :--- |
| `data-speaking` | Set to the character ID currently speaking. Updated by the Dialog action. |
| `data-expression` | Set to the current expression name when a side image is displayed. |

## Methods

### `show(): void`

Shows the text-box element using CSS grid display. If the `hidden` state is currently `true`, this method returns early and does nothing, so a box hidden via the [Hide Text Box](../script-actions/hide-textbox.md) action stays hidden.

```javascript
const textBox = document.querySelector('text-box');
textBox.show();
```

### `checkUnread(): void`

Checks if there is content in the text box that the player hasn't scrolled to see. If there is unread content (overflow), adds the `unread` CSS class to the text-box.

This is automatically called by the [Dialog action](../script-actions/dialogs.md) after writing NVL dialogs.

```javascript
const textBox = document.querySelector('text-box');
textBox.checkUnread();
```

### `setProps(props: object): void`

Update component properties. Used to switch between modes:

```javascript
const textBox = document.querySelector('text-box');
textBox.setProps({ mode: 'nvl' });
```

### `content(name: string): DOM`

Access named content areas within the component:

```javascript
const textBox = document.querySelector('text-box');
const dialogArea = textBox.content('dialog');
const nameArea = textBox.content('name');
```

## CSS Classes

| Class | Description |
| :--- | :--- |
| `unread` | Applied when there is scrollable content the player hasn't seen. Typically used to show a scroll indicator. |
| Custom classes | The [Dialog action](../script-actions/dialogs.md) can apply custom classes via the dialog syntax (e.g., `'y:happy:highlight Dialog text'`). |

## Content Areas

| Name | Selector | Description |
| :--- | :--- | :--- |
| `name` | `[data-content="name"]` | Container for the character name |
| `character-name` | `[data-content="character-name"]` | The character name span element |
| `side-image` | `[data-content="side-image"]` | Container for the expression/side image |
| `character-expression` | `[data-content="character-expression"]` | The expression image element |
| `text` | `[data-content="text"]` | Container for the dialog text |
| `dialog` | `[data-content="dialog"]` | The type-writer element containing dialog |

## Display Modes

### ADV Mode (Adventure)

The default mode. Displays one dialog at a time with character name, optional side image, and text. When a new dialog is shown, the previous one is replaced.

### NVL Mode (Novel)

Displays multiple dialogs on screen simultaneously, scrolling as new dialogs are added. Each dialog entry includes the speaker's name (if not narrator) and the dialog text.

In NVL mode:
- Side images are not displayed
- Dialogs are appended rather than replaced
- The text area is scrollable
- The `unread` class indicates when new content is below the visible area

## Styling

The text-box component can be styled using CSS. Key selectors:

```css
/* Main text-box container */
text-box {
    /* Your styles */
}

/* ADV mode specific */
text-box[data-speaking] {
    /* Styles when a character is speaking */
}

/* NVL mode specific */
text-box[mode="nvl"] {
    /* NVL mode styles */
}

/* Character name */
text-box [data-ui="who"] {
    /* Character name styles */
}

/* Side image */
text-box [data-ui="face"] {
    /* Expression/side image styles */
}

/* Dialog text area */
text-box [data-content="text"] {
    /* Text container styles */
}

/* Unread indicator */
text-box.unread {
    /* Show scroll indicator */
}
text-box.unread::after {
    content: '▼';
    /* Position indicator */
}
```

## Related

- [Dialog Action](../script-actions/dialogs.md) - The action that controls text-box content
- [Type Writer](#type-writer) - The component that handles text animation
- [Centered Dialog](#centered-dialog) - Alternative display for centered text
