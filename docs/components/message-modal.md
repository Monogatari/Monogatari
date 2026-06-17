---
title: Message Modal
order: 72
description: A modal with a title, subtitle and body shown by the Show Message action, which blocks the game until the player closes it.
---

# Message Modal

## Description

```markup
<message-modal></message-modal>
```

The message-modal component displays a modal window with an optional title, an optional subtitle and a body of text, plus a single button to close it. It is shown by the [Show Message action](../script-actions/message.md) and is meant for short, in-script messages such as notes, hints or warnings. While a message modal is open, the game cannot advance until the player closes it.

**Source Code**: [https://github.com/Monogatari/Monogatari/tree/develop/src/components/message-modal](https://github.com/Monogatari/Monogatari/tree/develop/src/components/message-modal)

## Usage

Message modals are not created directly. They are shown from the script with the `show message` statement, where `<id>` is the key of a message you registered beforehand:

```javascript
'show message Help'
```

You can also append custom CSS classes after the id:

```javascript
'show message Help fullscreen'
```

Messages themselves are registered with `monogatari.messages ()`:

```javascript
monogatari.messages ({
    'Help': {
        title: 'Help',
        subtitle: 'Some useful information',
        body: 'This is the body of the message shown to the player.'
    }
});
```

The action reads the message, fills the modal's props with the message fields (running each through variable replacement) and appends a `<message-modal>` to the game screen. See the [Show Message action](../script-actions/message.md) for the full message format.

## Structure

The component renders a content container with a message section and a single close button:

```html
<message-modal class="modal modal--active">
    <div class="modal__content">
        <div data-ui="message-content">
            <h3 data-content="title">Help</h3>
            <p data-content="subtitle">Some useful information</p>
            <p data-content="body">This is the body of the message shown to the player.</p>
        </div>
        <div class="horizontal horizontal--center" data-ui="inner-menu">
            <button data-action="close" data-close="message-modal" data-string="Close">Close</button>
        </div>
    </div>
</message-modal>
```

The `title`, `subtitle` and `body` elements are only rendered when their corresponding prop is a non-empty string, so a message with only a body will render just the `<p data-content="body">` element.

## Content Areas

| Name | Selector | Description |
| :--- | :--- | :--- |
| `title` | `[data-content="title"]` | The message title (only rendered when `title` is set) |
| `subtitle` | `[data-content="subtitle"]` | The message subtitle (only rendered when `subtitle` is set) |
| `body` | `[data-content="body"]` | The message body (only rendered when `body` is set) |

## Props

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string \| null` | `null` | The message title, rendered as an `<h3>` |
| `subtitle` | `string \| null` | `null` | The message subtitle, rendered as a `<p>` |
| `body` | `string` | `''` | The main message text, rendered as a `<p>` |
| `actionString` | `string` | `'Close'` | A translation key used for the close button's label, resolved with `monogatari.string ()` |

> [!NOTE]
> The title, subtitle and body props are rendered as-is (they are filled with the message text after variable replacement). Only `actionString` is treated as a translation key. The button text is therefore `monogatari.string (actionString)`, defaulting to the translated `Close` string.

## Blocking Behavior

The message modal blocks the game from proceeding while it is open. This is handled in two places:

- The [Show Message action](../script-actions/message.md) sets a `blocking` flag while the modal is visible and rejects `shouldProceed` until the player clicks the close button.
- The component itself overrides `shouldProceed` to reject (`'Message Modal awaiting for user to close the modal window.'`), so any attempt to advance, auto-play or skip is prevented until the modal is removed.

The close button carries both `data-action="close"` and `data-close="message-modal"`. When clicked, the action's listener clears the blocking flag, removes the modal and lets the game proceed.

## Methods

The message-modal overrides several lifecycle methods. All of them simply remove the modal from the DOM when the relevant event occurs.

| Method | Behavior |
| :--- | :--- |
| `shouldProceed()` | Always rejects, blocking advancement while the modal is open |
| `willProceed()` | Removes the modal |
| `willRollback()` | Removes the modal so the game can revert to the previous statement |
| `onReset()` | Removes the modal when the game is reset |
| `willMount()` | Adds the `modal` and `modal--active` classes |

## Styling

```css
/* Main container (uses the shared .modal styles) */
message-modal {
    /* Modal base styles inherited from the .modal class */
}

message-modal div {
    width: auto;
    padding: 1rem;
}

message-modal a {
    color: #00bcd4;
}

/* Message content is left-aligned and selectable */
message-modal [data-ui="message-content"] {
    text-align: left;
    max-width: 100%;
}

message-modal [data-ui="message-content"] * {
    user-select: text;
}
```

## Related

- [Show Message Action](../script-actions/message.md) - Registers messages and shows this modal
- [Alert Modal](alert-modal.md) - A related confirmation modal opened from JavaScript
- [Text Box](text-box.md) - Displays regular dialog
