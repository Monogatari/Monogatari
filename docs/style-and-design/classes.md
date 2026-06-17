---
title: CSS Classes
order: 91
description: The helper CSS classes Monogatari ships with for positioning and aligning interface elements.
---

# CSS Classes

There are already some CSS classes declared to make your designing a little easier. As you may have already noticed, many are already used in the basic interface you get by default.

## Positioning

| Class | Description |
| :--- | :--- |
| `center` | Positions the element in the horizontal center of the screen. |
| `left` | Positions the element on the left side of the screen. |
| `right` | Positions the element on the right side of the screen. |
| `bottom` | Positions the element at the bottom of the screen. |
| `middle` | Positions the element in the middle of the screen, vertically and horizontally. |

## Text alignment

| Class | Description |
| :--- | :--- |
| `text--left` | Aligns the text content to the left. |
| `text--center` | Aligns the text content to the center. |
| `text--right` | Aligns the text content to the right. |
| `text--justify` | Justifies the text content. |

## Layout

| Class | Description |
| :--- | :--- |
| `horizontal` | Lays the content out in a horizontal row. |
| `horizontal--left` / `horizontal--center` / `horizontal--right` | Align the items of a `horizontal` container to the start, center, or end. |
| `vertical` | Lays the content out in a vertical column. |
| `vertical--left` / `vertical--center` / `vertical--right` | Align the items of a `vertical` container to the start, center, or end. |

## Modals

| Class | Description |
| :--- | :--- |
| `modal--active` | Applied to a modal element (such as the [dialog log](../components/dialog-log.md)) to make it visible. |

## Common patterns

These classes are meant to be combined. A few combinations you'll reach for often:

A horizontal row of buttons, centered:

```html
<div class="horizontal horizontal--center">
    <button>Yes</button>
    <button>No</button>
</div>
```

An element pinned to the middle of the screen with its text centered:

```html
<div class="middle text--center">
    <h1>Chapter One</h1>
</div>
```

A vertical stack of options, centered both as a group and in their text:

```html
<div class="vertical vertical--center text--center">
    <button>New Game</button>
    <button>Load Game</button>
    <button>Settings</button>
</div>
```

## See also

- [HTML Data Attributes](data-attributes.md) — The `data-*` hooks that pair with these classes.
