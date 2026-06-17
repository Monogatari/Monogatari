---
title: HTML Data Attributes
order: 92
description: The data-* attributes Monogatari uses to wire up the interface, and how to use them when customizing.
---

# HTML Data Attributes

## Overview

Monogatari's interface is driven by `data-*` attributes rather than fixed markup. The engine finds elements by their data attributes, so as long as you keep the right attributes in place you can restructure the HTML of any [component](../components/README.md) freely and everything keeps working.

## General attributes

| Attribute | Purpose |
| :--- | :--- |
| `data-component` | Marks a custom element as a Monogatari component, e.g. `data-component="text-box"`. The engine and your CSS target components through it. |
| `data-content` | Marks a region **inside** a component that the component reads or writes — e.g. `data-content="text"` for the dialog text. This is the main hook you'll use when [changing a component's structure](../building-blocks/components/built-in-functions.md). |
| `data-screen` | Marks a full-screen component and names the screen, e.g. `data-screen="settings"`. |
| `data-action` | Declares an interactive control; clicks are handled centrally by the engine. See the table below. |
| `data-open` | Names the screen a `data-action="open-screen"` control opens (e.g. `data-open="settings"`). |
| `data-ui` | Marks a part of the user interface the engine manipulates. |
| `data-target` | Targets a specific element for an action — for example, which audio channel a `set-volume` control changes. |
| `data-string` | Marks text that is replaced with the matching [translation](../advanced-monogatari-development/translations.md) for the current language. |
| `data-background` | Set an image URL on it and the engine applies it as the element's background. |
| `data-close` | Closes another element, referenced by its name. |
| `data-jump` | On a choice, the label the game jumps to when the choice is clicked. |

## `data-action` values

`data-action` turns an element into a control. The most common values:

| Value | What it does |
| :--- | :--- |
| `open-screen` | Opens the screen named in the neighbouring `data-open` and closes the others. |
| `back` | While playing, rolls back to the previous statement; on a screen, returns to the previous screen. |
| `close` | Closes the element named in the neighbouring `data-close`. |
| `close-video` | Closes the video element. |
| `set-language` | Sets the interface language (used by the [language selection](../components/language-selection-screen.md) and [settings](../components/settings-screen.md) screens). |
| `set-volume` | Changes the volume of the channel named in `data-target` (`music`, `sound`, `voice`, `video`). |
| `jump` | Jumps to the label named in the element's `data-jump`. |

> [!NOTE]
> Older versions used `data-menu` and `data-ui="who"` / `"say"` to mark screens and
> dialog regions. Current components use `data-screen` for screens and
> `data-content="…"` for their internal regions — for example the text box exposes
> `data-content="text"`, `data-content="character-name"`, and
> `data-content="character-expression"`.

## Text effects (`data-effect-*`)

When a line of dialog uses an inline effect (see the [Type Writer](../components/type-writer.md)), the typewriter wraps that span in a `data-effect-*` attribute your CSS can target. The family includes emphasis (`data-effect-bold`, `data-effect-italic`, `data-effect-big`, `data-effect-small`), motion (`data-effect-shake`, `data-effect-wave`, `data-effect-slide-up`, `data-effect-scale`), mood (`data-effect-angry`, `data-effect-happy`, `data-effect-sad`, `data-effect-excited`, `data-effect-scared`, `data-effect-dreamy`, `data-effect-mysterious`), and stylized looks (`data-effect-glitch`, `data-effect-rainbow`, `data-effect-glow`, `data-effect-redacted`, `data-effect-invisible-ink`, `data-effect-handwriting`, `data-effect-robotic`) — with `-slow` / `-hard` / `-fast` variants for several.

```css
/* Restyle the "glow" effect to match your game */
[data-effect-glow] {
    text-shadow: 0 0 0.4em var(--color-primary);
}
```

See the [Type Writer](../components/type-writer.md) component for the full list of effects and how to use them in dialog.

## See also

- [CSS Classes](classes.md) — The styling hooks that pair with these attributes.
- [Components](../components/README.md) — Each component documents its own `data-content` regions.
- [Built-in Functions](../building-blocks/components/built-in-functions.md) — How to change a component's HTML structure.
