---
title: Save Screen
order: 75
description: The in-game save screen where players name a save and store their current progress into a slot.
---

# Save Screen

## Description

```markup
<save-screen></save-screen>
```

The save-screen component lets the player store their current progress. It renders a text input for naming the save, a Save button, and the list of existing save slots. Saving creates a new slot (or overwrites an existing one) labelled with the name the player typed.

**Source Code**: [https://github.com/Monogatari/Monogatari/tree/develop/src/components/save-screen](https://github.com/Monogatari/Monogatari/tree/develop/src/components/save-screen)

## Usage

The save-screen is a screen component, so it is shown like any other screen:

```javascript
// Open the save screen
monogatari.showScreen('save');
```

While a game is playing, the keyboard shortcut `Shift + S` opens the save screen.

## Structure

The save-screen renders the following structure:

```html
<save-screen data-component="save-screen" data-screen="save">
    <button class="top left" data-action="back"><span class="fas fa-arrow-left"></span></button>
    <div class="horizontal horizontal--center">
        <input type="text" placeholder="Save Slot Name" data-input="slotName" data-content="slot-name" required>
        <button data-string="Save" data-action="save">Save</button>
    </div>
    <div data-ui="slots" data-content="slots">
        <slot-container label="Save" type="save"></slot-container>
    </div>
</save-screen>
```

The `label` on the inner `<slot-container>` comes from the [`SaveLabel`](../configuration-options/game-configuration/saving.md) setting (default `Save`). The `data-screen="save"` attribute and the `active` class are managed automatically by the base screen component.

> [!NOTE]
> The slot list is rendered by the separate [`slot-container`](save-slot.md) component, which in turn renders each [Save Slot](save-slot.md). This page documents the save screen's own input and save flow; see those pages for the slot markup and behaviour.

## State

The save-screen inherits its state from the base screen component.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | `false` | Whether the screen is currently open. When it becomes `true`, the slot-name input is pre-filled with the current date and time, and the `active` class is added. |

## Content Areas

| Name | Selector | Description |
| :--- | :--- | :--- |
| `slot-name` | `[data-content="slot-name"]` | The text input where the player names the save. |
| `slots` | `[data-content="slots"]` | Container holding the `<slot-container>` that lists existing saves. |

## Save Flow

The screen registers a listener for the `save` action that the Save button triggers:

1. When the screen is opened, the slot-name input is filled with the current date and time (formatted with [Luxon](https://moment.github.io/luxon/)), giving the player a sensible default name.
2. The player may type a custom name, then press the **Save** button (`data-action="save"`).
3. The listener reads the trimmed value of the slot-name input. If it is not empty, it saves the current game state using that name under the [`SaveLabel`](../configuration-options/game-configuration/saving.md) prefix, creating a new slot.

```javascript
// What the Save button effectively does (with the typed name)
monogatari.saveTo('SaveLabel', null, slotName);
```

> [!TIP]
> Clicking an existing slot in the list saves *over* that slot instead of creating a new one. That overwrite confirmation flow is handled by the [slot-container](save-slot.md) component, not by the save screen itself.

> [!WARNING]
> If the slot-name input is empty, the Save button does nothing. The input is marked `required`, and the listener ignores empty or whitespace-only names.

## Localization

The screen uses `data-string` attributes for translatable text:

| String Key | Default | Description |
| :--- | :--- | :--- |
| `Save` | "Save" | The Save button label |

The placeholder text (`Save Slot Name`) is a static attribute on the input.

## Styling

The save-screen can be styled with CSS against its real selectors:

```css
/* The screen itself */
save-screen {
    /* Your styles */
}

/* Only when the screen is open */
save-screen.active {
    /* Visible state */
}

/* The slot-name input */
save-screen input {
    background-color: #fff;
    border: 1px solid #666;
}

/* Slot list area */
save-screen [data-content="slots"] {
    /* Layout for the list of save slots */
}
```

## Related

- [Save Slot](save-slot.md) - The individual slot markup and the slot list container
- [Load Screen](load-screen.md) - Where players resume a saved game
- [Saving](../configuration-options/game-configuration/saving.md) - Save labels, auto-save, and screenshots configuration
- [Settings Screen](settings-screen.md) - The in-game options panel
