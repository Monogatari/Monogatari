---
title: Gallery Screen
order: 77
description: A screen that displays unlockable CG images in a grid, with locked entries hidden behind a lock icon.
---

# Gallery Screen

## Description

```markup
<gallery-screen></gallery-screen>
```

The gallery-screen component displays a grid of the images registered as gallery assets. Images the player has unlocked are shown as thumbnails; images that are still locked appear as a card with a lock icon. Clicking an unlocked thumbnail opens a full-size viewer. Unlocking and locking is driven from your script by the [Gallery action](../script-actions/image-gallery.md).

**Source Code**: [https://github.com/Monogatari/Monogatari/tree/develop/src/components/gallery-screen](https://github.com/Monogatari/Monogatari/tree/develop/src/components/gallery-screen)

## Configuring Gallery Assets

Gallery images are registered with `monogatari.assets`, using `gallery` as the category. The keys are the names you reference from your script; the values are the file names inside your gallery folder:

```javascript
monogatari.assets ('gallery', {
    'someImage': 'happy-shine.png'
});
```

By default the files live in `assets/gallery`. That location is controlled by the `AssetsPath` setting (`root` and `gallery` keys).

> [!NOTE]
> If no gallery assets are defined, the screen removes itself and **no Gallery button is added** to the main menu. The [Gallery button](main-menu.md) only appears once at least one image has been registered.

## Locking and Unlocking

On a fresh game every gallery image starts locked. To reveal an image, your script reaches a `gallery unlock` statement; to hide it again, a `gallery lock` statement:

```javascript
"gallery unlock someImage", // shows the image in the gallery
"gallery lock someImage"    // hides it again behind the lock icon
```

The list of unlocked images is stored in the engine's `Storage` under the `gallery` key, so unlocks **persist independently of save files**. Updating that state re-renders the grid immediately. See the [Gallery action](../script-actions/image-gallery.md) for the full scripting reference.

## Structure

The screen renders a back button, a heading, the image grid, and a hidden full-screen image viewer:

```html
<gallery-screen data-component="gallery-screen" data-screen="gallery">
    <div class="modal" data-ui="image-viewer">
        <figure class="modal__content"></figure>
    </div>
    <button class="fas fa-arrow-left top left" data-action="back"></button>
    <h2 data-string="Gallery">Gallery</h2>
    <div data-ui="gallery">
        <!-- one <figure> per gallery asset -->
    </div>
</gallery-screen>
```

Each asset is rendered as a `<figure>` inside the gallery grid. The markup differs depending on whether it is unlocked:

```html
<!-- Unlocked: the image is shown as a clickable thumbnail -->
<figure class="card--depth--2 row__column row__column--6 row__column--tablet--4 row__column--desktop--3 row__column--retina--2"
        data-image="someImage"
        style="background-image: url('assets/gallery/happy-shine.png')"></figure>

<!-- Locked: a lock icon is shown instead -->
<figure class="card--depth--2 row__column row__column--6 row__column--tablet--4 row__column--desktop--3 row__column--retina--2">
    <span class="fas fa-lock"></span>
</figure>
```

### Data UI Keys

| Key | Element | Description |
| :--- | :--- | :--- |
| `gallery` | `<div>` | The grid that holds one `<figure>` per asset. |
| `image-viewer` | `<div class="modal">` | The full-screen viewer shown when an unlocked image is clicked. |

Only unlocked figures carry a `data-image` attribute (the asset key), which is what makes them clickable.

## The Image Viewer

When the player clicks an unlocked `<figure>`, the screen activates the viewer by adding `modal--active` to the `image-viewer` element and setting the figure's `background-image` to the full-size asset. Clicking anywhere on the open viewer closes it again and clears the background.

> [!TIP]
> The whole viewer closes on click, so there is no separate close button. If you want one, you can add it in your own theme and bind it to the same behaviour.

## State

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | `false` | Whether the screen is open. Inherited from the base screen component; toggles the `active` class. |
| `unlocked` | `string[]` | `[]` | The asset keys the player has unlocked. Loaded from `Storage` when the screen mounts. |

When `unlocked` changes, the component saves the new list back to `Storage` under `gallery` and re-renders the grid.

## Styling

```css
/* The screen container */
gallery-screen {
    /* Inherits base screen styles; shown when active */
}

/* The grid of images */
gallery-screen [data-ui="gallery"] {
    display: flex;
    flex-wrap: wrap;
}

/* Each image card */
gallery-screen figure {
    background-size: cover;
    background-position: center;
}

/* The lock icon on locked entries */
gallery-screen figure .fa-lock {
    /* Lock styling */
}

/* The full-screen viewer */
gallery-screen [data-ui="image-viewer"] {
    /* Modal viewer styling */
}

/* The viewer's image area */
gallery-screen [data-ui="image-viewer"] figure {
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

/* The back button */
gallery-screen [data-action="back"] {
    /* Back button styling */
}
```

## Related

- [Gallery Action](../script-actions/image-gallery.md) - Locks and unlocks gallery images from your script
- [Main Menu](main-menu.md) - Gains a Gallery button when gallery assets are defined
- [Show Image](../script-actions/show-image.md) - Display images during gameplay
