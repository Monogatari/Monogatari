---
title: Alert Modal
order: 71
description: A confirmation modal with a message and custom action buttons, used for quit, slot deletion and slot overwrite confirmations.
---

# Alert Modal

## Description

```markup
<alert-modal></alert-modal>
```

The alert-modal component displays a confirmation message along with one or more buttons that the player must choose from. It is the engine's general-purpose dialog for "Are you sure?" interactions, such as confirming a quit, deleting a save slot or overwriting an existing save slot. An alert can optionally show extra context (for example, the name of the slot being deleted) and can even include a text input.

**Source Code**: [https://github.com/Monogatari/Monogatari/tree/develop/src/components/alert-modal](https://github.com/Monogatari/Monogatari/tree/develop/src/components/alert-modal)

## Usage

Alert modals are not placed in the script. They are created on demand from JavaScript using the `monogatari.alert ()` helper, which builds an `<alert-modal>`, sets its props and prepends it to the engine element:

```javascript
monogatari.alert ('quit-warning', {
    message: 'Confirm',
    actions: [
        {
            label: 'Quit',
            listener: 'quit'
        },
        {
            label: 'Cancel',
            listener: 'dismiss-alert'
        }
    ]
});
```

The first argument is an `id` that is stored on the element as a `data-alert-id` attribute. It lets you dismiss a specific alert later:

```javascript
// Remove the alert with the given id
monogatari.dismissAlert ('quit-warning');

// Remove every alert currently on screen
monogatari.dismissAlert ();
```

## Structure

The component renders a single content wrapper with the message, an optional context element and a row of action buttons:

```html
<alert-modal class="modal modal--active" data-alert-id="quit-warning">
    <div class="modal__content" data-content="wrapper">
        <p data-string="Confirm" data-content="message">Do you want to quit?</p>
        <div data-content="actions">
            <button data-action="quit" data-string="Quit">Quit</button>
            <button data-action="dismiss-alert" data-string="Cancel">Cancel</button>
        </div>
    </div>
</alert-modal>
```

When the alert is given a `context` value, an extra element is rendered between the message and the actions. By default it is a `<small>` element, but if `editable` is `true` it becomes a text `<input>` instead:

```html
<!-- context (not editable) -->
<small data-content="context">My Save File</small>

<!-- context with editable: true -->
<input type="text" data-content="context" value="My Save File" />
```

## Content Areas

| Name | Selector | Description |
| :--- | :--- | :--- |
| `wrapper` | `[data-content="wrapper"]` | The modal content container |
| `message` | `[data-content="message"]` | The confirmation message text |
| `context` | `[data-content="context"]` | Optional extra context (only rendered when `context` is set) |
| `actions` | `[data-content="actions"]` | The container holding the action buttons |

## Props

The alert-modal is configured entirely through its props, which are typically supplied by `monogatari.alert ()`.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `active` | `boolean` | `true` | Whether the modal is shown. Toggling it to `true` toggles the `modal--active` class |
| `message` | `string` | `''` | A translation key. The text is resolved with `monogatari.string (message)` and rendered with a matching `data-string` attribute |
| `context` | `string \| null` | `null` | Optional extra text shown below the message. When omitted, no context element is rendered |
| `editable` | `boolean` | `false` | When `true` (and `context` is set), the context is rendered as a text `<input>` instead of a `<small>` element |
| `actions` | `Action[]` | `[]` | The list of buttons to render (see below) |

> [!NOTE]
> The `message` prop is a translation key, not literal text. It is passed through `monogatari.string ()`, so the key must exist in your translations. The built-in keys used by the engine are `Confirm` (quit), `SlotDeletion` and `SlotOverwrite`.

## Actions

Each entry in the `actions` array describes one button. Buttons render with a `data-action` attribute set to the action's `listener` and a `data-string` set to its `label`:

| Field | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | A translation key used both as the button text (`monogatari.string (label)`) and its `data-string` attribute |
| `listener` | `string` | The name of the registered listener that fires when the button is clicked. It becomes the button's `data-action` value |

The engine registers a built-in `dismiss-alert` listener that simply removes the alert, which is why most alerts include a "Cancel" button pointing at it:

```javascript
{
    label: 'Cancel',
    listener: 'dismiss-alert'
}
```

Other listeners are registered by whichever feature opens the alert. For example, the [End action](../script-actions/end.md) registers a `quit` listener, the save slot registers `delete-slot` and the slot container registers `overwrite-slot`.

## Typical Uses

### Quit Confirmation

When the player presses `Shift + Q` (or tries to close a desktop build), a quit confirmation is shown using the `Confirm` message and `quit` / `dismiss-alert` actions:

```javascript
monogatari.alert ('quit-warning', {
    message: 'Confirm',
    actions: [
        { label: 'Quit', listener: 'quit' },
        { label: 'Cancel', listener: 'dismiss-alert' }
    ]
});
```

### Slot Deletion

When the player deletes a save slot, the alert shows the slot's name (or date) as context:

```javascript
monogatari.alert ('slot-deletion', {
    message: 'SlotDeletion',
    context: saveData.name,
    actions: [
        { label: 'Delete', listener: 'delete-slot' },
        { label: 'Cancel', listener: 'dismiss-alert' }
    ]
});
```

### Slot Overwrite

When the player overwrites an existing slot, the alert is `editable` so the player can rename the save:

```javascript
monogatari.alert ('slot-overwrite', {
    message: 'SlotOverwrite',
    context: saveData.name,
    editable: true,
    actions: [
        { label: 'Overwrite', listener: 'overwrite-slot' },
        { label: 'Cancel', listener: 'dismiss-alert' }
    ]
});
```

## Styling

```css
/* Main container (uses the shared .modal styles) */
alert-modal {
    /* Modal base styles inherited from the .modal class */
}

/* Active state */
alert-modal.modal--active {
    /* Shown when the active prop is true */
}

/* Content wrapper */
alert-modal [data-content="wrapper"] {
    overflow: auto;
    overflow-x: hidden;
    flex-direction: column;
}

/* Message text */
alert-modal p {
    font-size: 1.5rem;
}

/* Editable context input */
alert-modal input[type="text"] {
    margin-bottom: 2rem;
    text-align: center;
}
```

## Related

- [End Action](../script-actions/end.md) - Registers the `quit` listener used by the quit confirmation
- [Save Slot](save-slot.md) - Opens the slot deletion alert
- [Settings Screen](settings-screen.md) - Triggers the quit confirmation on desktop builds
- [Message Modal](message-modal.md) - A related modal driven from the script
