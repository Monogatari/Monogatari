---
title: Dialog Log
order: 68
description: A scrollable history of every dialog shown during play, opened from the Log button in the quick menu.
---

# Dialog Log

## Description

```markup
<dialog-log></dialog-log>
```

The dialog-log component provides a scrollable history of all dialogs displayed during gameplay. Players can access it to review past conversations they may have missed or want to re-read.

**Source Code**: [https://github.com/Monogatari/Monogatari/tree/develop/src/components/dialog-log](https://github.com/Monogatari/Monogatari/tree/develop/src/components/dialog-log)

## Usage

The dialog-log automatically appears in the quick menu as a "Log" button. Clicking it toggles the dialog log modal.

## Structure

```html
<dialog-log class="modal" data-component="dialog-log">
    <div class="modal__content">
        <div data-content="log">
            <!-- Dialog entries appear here -->
            <div class="text--center padded" data-string="NoDialogsAvailable" data-content="placeholder">
                No dialogs available. Dialogs will appear here as they show up.
            </div>
        </div>
        <button data-string="Close" data-action="dialog-log">Close</button>
    </div>
</dialog-log>
```

## Dialog Entry Structure

Each dialog entry is rendered as:

```html
<!-- Character dialog -->
<div data-spoke="character_id" class="named">
    <span style="color:#ff0000;">Character Name </span>
    <p>The dialog text here.</p>
</div>

<!-- Narrator dialog -->
<div data-spoke="_narrator" class="unnamed">
    <p>Narrator text here.</p>
</div>
```

## State

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `active` | `boolean` | `false` | Whether the dialog log modal is currently visible |

## Methods

### `write(entry: DialogEntry): void`

Add a new dialog entry to the log. This is called automatically by the [Dialog action](../script-actions/dialogs.md).

```typescript
interface DialogEntry {
    id: string;           // Character ID or '_narrator'
    character: Character; // Character object with name/color
    dialog: string;       // The dialog text
}
```

### `pop(): void`

Remove the last dialog entry from the log. Used during rollback/revert operations.

## Events

The dialog-log registers a listener for the `dialog-log` action, which toggles its visibility:

```javascript
// Toggle dialog log programmatically
monogatari.trigger('dialog-log');
```

## Quick Menu Integration

During setup, the dialog-log automatically adds a "Log" button to the quick menu:

```javascript
// This happens automatically during component setup
quickMenu.addButtonAfter('Hide', {
    string: 'Log',
    icon: 'far fa-comments',
    data: {
        action: 'dialog-log'
    }
});
```

## Styling

```css
/* Modal container */
dialog-log {
    /* Modal base styles inherited from .modal class */
}

/* Active state */
dialog-log.modal--active {
    display: flex;
    /* Or your preferred display method */
}

/* Log content area */
dialog-log [data-content="log"] {
    overflow-y: auto;
    max-height: 60vh;
}

/* Character dialog entry */
dialog-log [data-spoke].named {
    /* Named character styling */
}

dialog-log [data-spoke].named span {
    /* Character name styling (color is inline from character definition) */
}

/* Narrator dialog entry */
dialog-log [data-spoke].unnamed {
    /* Narrator styling */
}

/* Placeholder when empty */
dialog-log [data-content="placeholder"] {
    text-align: center;
    padding: 2em;
    opacity: 0.7;
}

/* Close button */
dialog-log button[data-action="dialog-log"] {
    /* Close button styling */
}
```

## Reset Behavior

When the game is reset, the dialog log is cleared and the placeholder message is restored:

```javascript
// Automatically called on game reset
dialogLog.onReset();
```

## Localization

The component uses data-string attributes for translatable text:

| String Key | Default | Description |
| :--- | :--- | :--- |
| `NoDialogsAvailable` | "No dialogs available..." | Placeholder text |
| `Close` | "Close" | Close button text |

## Related

- [Dialog Action](../script-actions/dialogs.md) - Populates the dialog log
- [Text Box](text-box.md) - Displays current dialog
- [Quick Menu](quick-menu.md) - Contains the Log button

