---
title: Quick Menu
order: 61
description: The in-game toolbar with save, load, settings, skip and other shortcuts — and how to add your own buttons.
---

# Quick Menu

## Description

```markup
<quick-menu></quick-menu>
```

The quick menu is the small toolbar at the bottom of the screen (top on mobile) that gives players quick access to common actions while playing. It renders one button per entry in its configuration, so you can add, remove and reorder buttons freely.

## Default buttons

Out of the box the quick menu shows:

| Button | What it does | Notes |
| :--- | :--- | :--- |
| **Back** | Roll back to the previous statement | Removed if [`AllowRollback`](../configuration-options/game-configuration/README.md) is `false`. |
| **Hide** | Hide the text box to admire the scene | |
| **Log** | Open the [dialog log](dialog-log.md) | Added by the dialog-log component. |
| **Auto** | Toggle auto-play | |
| **Skip** | Enter skip mode | Removed if the [`Skip`](../configuration-options/game-configuration/README.md) speed is `0`. |
| **Save** | Open the [Save screen](save-screen.md) | |
| **Load** | Open the [Load screen](load-screen.md) | |
| **Settings** | Open the [Settings screen](settings-screen.md) | |
| **Quit** | Quit to the main menu | |

> [!NOTE]
> Two buttons are conditional: **Skip** only appears when the `Skip` setting is greater
> than `0`, and **Back** only appears when `AllowRollback` is `true`.

## A button definition

Each button is an object with these properties:

| Key | Description |
| :--- | :--- |
| `string` | The translation key for the button's label (see [Translations](../advanced-monogatari-development/translations.md)). |
| `icon` | A [Font Awesome](../style-and-design/icons.md) icon class, e.g. `'fas fa-tasks'`. |
| `data` | An object of `data-*` attributes. `data.action` is usually the [action](../style-and-design/data-attributes.md) the button triggers. |
| `element` | *Optional.* The tag to render (defaults to `button`). |

## Methods

The quick menu shares its button API with the [Main Menu](main-menu.md) (both are menu components).

### Add Button

```javascript
static addButton ({ string, icon, data, ... }): void
```

Adds a button to the end of the menu.

```javascript
monogatari.component ('quick-menu').addButton ({
    string: 'Stats',
    icon: 'fas fa-tasks',
    data: {
        action: 'show-stats'
    }
});
```

### Add Button After

```javascript
static addButtonAfter (after: string, { string, icon, data, ... }): void
```

Adds a button immediately after the one whose `string` matches `after`:

```javascript
monogatari.component ('quick-menu').addButtonAfter ('Back', {
    string: 'Stats',
    icon: 'fas fa-tasks',
    data: { action: 'show-stats' }
});
```

### Add Button Before

```javascript
static addButtonBefore (before: string, { string, icon, data, ... }): void
```

Adds a button immediately before the one whose `string` matches `before`:

```javascript
monogatari.component ('quick-menu').addButtonBefore ('Back', {
    string: 'Stats',
    icon: 'fas fa-tasks',
    data: { action: 'show-stats' }
});
```

### Remove Button

```javascript
static removeButton (string: string): void
```

Removes a button by its `string`. For example, to hide the Settings button:

```javascript
monogatari.component ('quick-menu').removeButton ('Settings');
```

> [!TIP]
> Your button's `data.action` needs something to respond to it. Pair a custom button
> with a [Component](../building-blocks/components/README.md) or an event listener that
> reacts to that action — see [HTML Data Attributes](../style-and-design/data-attributes.md).

## Related

- [Main Menu](main-menu.md) — Shares the same button API.
- [Dialog Log](dialog-log.md) — Adds the **Log** button to the quick menu.
- [Help Screen](help-screen.md) — Documents these buttons and their keyboard shortcuts for players.
