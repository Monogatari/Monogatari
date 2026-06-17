---
title: Save Slot
order: 65
---

# Save Slot

## Component Structure

The following code is this component's initial HTML structure. Remember you can change this structure any time by using the [`template()` component built-in function](../building-blocks/components/built-in-functions.md#get-or-modify-the-html-structure).

```javascript
let background = '';

if (this.props.screenshot) {
    // With the `Screenshots` setting enabled, each save stores a screenshot
    // taken at the moment it was created and it's used as the slot background.
    background = `url(${this.props.screenshot})`;
} else {
    const assetsPath = this.engine.setting ('AssetsPath');
    const hasImage = this.props.image && this.engine.asset ('scenes', this.props.image);

    if (hasImage) {
        background = `url(${assetsPath.root}/${assetsPath.scenes}/${this.engine.asset ('scenes', this.props.image)})`;
    } else if (this.data && 'game' in this.data && this.data.game) {
        if (this.data.game.state.background) {
            background = this.data.game.state.background;

            if (background.indexOf (' with ') > -1) {
                background = Text.prefix (' with ', background);
            }

            background = Text.suffix ('show background', background);
        } else if (this.data.game.state.scene) {
            background = this.data.game.state.scene;

            if (background.indexOf (' with ') > -1) {
                background = Text.prefix (' with ', background);
            }

            background = Text.suffix ('show scene', background);
        }
    }
}

const useBackgroundImage = !!this.props.screenshot || (this.props.image && this.engine.asset ('scenes', this.props.image));

return `
    <button data-delete='${this.props.slot}' aria-label="${this.engine.string ('Delete')} Slot ${this.props.name}"><span class='fas fa-times'></span></button>
    <small class='badge'>${this.props.name}</small>
    <div data-content="background" style="${useBackgroundImage ? 'background-image' : 'background'}: ${background}"></div>
    <figcaption>${DateTime.fromISO (this.props.date).toLocaleString (DateTime.DATETIME_MED_WITH_SECONDS)}</figcaption>
`;
```

> [!NOTE]
> Save dates are formatted with [Luxon](https://moment.github.io/luxon/)'s `DateTime`
> (`DateTime.fromISO (...).toLocaleString (...)`), **not** Moment.js. Older
> customizations that call `moment (...)` must be updated to use Luxon.

## Slot Backgrounds

Each slot previews where the player was when they saved, in this order of preference:

1. If the [`Screenshots`](../configuration-options/game-configuration/saving.md) setting is enabled, the slot uses the screenshot captured at save time (`this.props.screenshot`).
2. Otherwise, if the current scene has an associated image, that scene image is used.
3. Otherwise, the slot falls back to the saved `background` / `scene` state.

> [!NOTE]
> The save-time screenshot inlines every on-screen image, so background and
> character assets served from another origin must send CORS headers or they
> are captured as black. See [Cross-Origin Assets Require CORS](../configuration-options/game-configuration/saving.md#cross-origin-assets-require-cors).

## Customizing

### Restyle the slot

A save slot renders four pieces: a delete `<button>` (with a `data-delete` attribute), the slot name in a `<small class='badge'>`, the preview in `<div data-content="background">`, and the date in a `<figcaption>`. The most common tweak is restyling those parts with CSS:

```css
/* The slot preview image / background */
save-slot [data-content="background"] {
    border-radius: 0.5rem;
}

/* The name badge */
save-slot .badge {
    /* Your styles */
}

/* The delete button */
save-slot button[data-delete] {
    /* Your styles */
}

/* The save date caption */
save-slot figcaption {
    /* Your styles */
}
```

### Change the structure

To change the markup itself (for example to show extra information on each slot), override it with the [`template()`](../building-blocks/components/built-in-functions.md#get-or-modify-the-html-structure) function. The structure shown above is what the default template produces; keep the `data-delete` button and the `data-content="background"` element so deletion and the slot preview keep working.
