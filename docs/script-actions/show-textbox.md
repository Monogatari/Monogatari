---
title: Show Text Box
order: 52
description: Make the dialog text box visible again after it was hidden.
---

# Show Text Box

## Description

```text
'show textbox'
```

The `show textbox` action makes the dialog [text box](../components/text-box.md) visible again after it has been hidden with [`hide textbox`](hide-textbox.md). Use it to bring the interface back once the player has had a moment to take in the artwork behind it.

**Action ID**: `Show::TextBox`

**Reversible**: Yes

**Requires User Interaction**: No

## Behavior

When `show textbox` runs:

1. The `<text-box>` component's `hidden` state is set to `false`, so the box animates back into view.
2. The engine records `textboxHidden: false` in its game state, so the text box's visibility is preserved across saving and loading.
3. The game automatically advances to the next statement.

On rollback, the previous (hidden) state is restored.

## Usage

A common pattern is to hide the text box so the player can admire a scene, then show it again to resume the conversation:

```javascript
monogatari.script ({
    'Start': [
        'show scene landscape with fadeIn',
        'e Look at this view!',
        'hide textbox',
        'wait 2000',
        'show textbox',
        'e ...breathtaking, right?',
        'end'
    ]
});
```

> [!TIP]
> Pair `hide textbox` / `show textbox` with [`wait`](wait.md) or a [choice](choices.md)
> so the player has a beat to enjoy the scene before the dialog returns.

> [!NOTE]
> Because the hidden state is stored in the game state, a player who saves while the
> text box is hidden will see it hidden again when they load that save.

## Related Actions

- [Hide Text Box](hide-textbox.md) - Hide the dialog text box
- [Text Box](../components/text-box.md) - The dialog component this action toggles
- [Wait](wait.md) - Pause before showing the text box again
