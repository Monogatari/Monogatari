---
title: Hide Text Box
order: 31
description: Hide the dialog text box to show off the scene behind it.
---

# Hide Text Box

## Description

```text
'hide textbox'
```

The `hide textbox` action hides the dialog [text box](../components/text-box.md), leaving only the background, characters and other visuals on screen. It's perfect for letting a dramatic scene, a CG, or an animation breathe without the interface in the way. Bring the text box back with [`show textbox`](show-textbox.md).

**Action ID**: `Hide::TextBox`

**Reversible**: Yes

**Requires User Interaction**: No

## Behavior

When `hide textbox` runs:

1. The `<text-box>` component's `hidden` state is set to `true`, so the box animates out of view.
2. The engine records `textboxHidden: true` in its game state, so the text box stays hidden across saving and loading.
3. The game automatically advances to the next statement.

On rollback, the text box is shown again.

## Usage

```javascript
monogatari.script ({
    'Start': [
        'show scene cliff with fadeIn',
        'show character e normal at center with fadeIn',
        'e Here it is. Everything we worked for.',
        'hide textbox',
        'wait 2500',
        'show textbox',
        'e Worth every step.',
        'end'
    ]
});
```

> [!TIP]
> The text box is also toggled by the player at any time with the quick-menu **Hide**
> button. Use `hide textbox` when *you* want to script that beat, for example during a
> reveal or a panning background.

> [!IMPORTANT]
> `hide textbox` sets a persistent state: the text box stays hidden — even while later
> dialog lines run — until you call [`show textbox`](show-textbox.md). Always show the
> box again before the next line you want the player to read, or that dialog will be
> set on a box that is still invisible.

## Related Actions

- [Show Text Box](show-textbox.md) - Bring the dialog text box back
- [Text Box](../components/text-box.md) - The dialog component this action toggles
- [Wait](wait.md) - Hold on the scene while the text box is hidden
