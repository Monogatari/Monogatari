---
title: Responsiveness
order: 90
---

# Responsiveness

Part of what makes Monogatari unique is how it is responsive out of the box, meaning people in all kind of devices with different form factors will be able to play your game.

It is important to note that responsiveness is not the same as simply scaling your game up or down to fit the screen it's being displayed on. Responsiveness actually let's you create different stylings and layouts for different sizes so you can take advantage when there's more space or adapt your elements when it's less.

Adapting to the device is done using CSS media queries.

## Default Screen-Width Breakpoints

These are the width breakpoints Monogatari defines out of the box. Each one is a `min-width` media query (except the first, which is the default style), so the rules inside apply from that width upward.

```css
/** Default Style. Don't change. (320px) **/
@media screen and (max-width: 20em) {}

/** Extra Small Devices, Phones (480px) **/
@media screen and (min-width: 30em) {}

/** Medium Screens, Tablets (601px) **/
@media screen and (min-width: 37.56255em) {}

/** Medium Devices, Desktops (768px) **/
@media screen and (min-width: 48em) {}

/** Medium Devices, Desktops (992px) **/
@media screen and (min-width: 62em) {}

/** HD Screen, Large Devices, Wide Screens (1200px) **/
@media screen and (min-width: 75em) {}

/** Full HD Screen, Large Devices, Wide Screens (1920px) **/
@media screen and (min-width: 120em) {}

/** Retina Screen, Large Devices, Wide Screens (2560px) **/
@media screen and (min-width: 160em) {}

/** 4k Screens, Large Devices, Wide Screens (3840px) **/
@media screen and (min-width: 240em) {}

/** 5k Screens, Large Devices, Wide Screens (5120px) **/
@media screen and (min-width: 320em) {}
```

| Breakpoint | Approx. width | Targets |
| :--- | :--- | :--- |
| `max-width: 20em` | up to 320px | Default styling, applied before any breakpoint kicks in. |
| `min-width: 30em` | 480px+ | Extra small devices / phones. |
| `min-width: 37.56255em` | 601px+ | Medium screens / tablets. |
| `min-width: 48em` | 768px+ | Medium devices / small desktops. |
| `min-width: 62em` | 992px+ | Larger tablets / desktops. |
| `min-width: 75em` | 1200px+ | HD screens / wide screens. |
| `min-width: 120em` | 1920px+ | Full HD screens. |
| `min-width: 160em` | 2560px+ | Retina / QHD wide screens. |
| `min-width: 240em` | 3840px+ | 4K screens. |
| `min-width: 320em` | 5120px+ | 5K screens (the largest breakpoint). |

> [!NOTE]
> Monogatari also pairs some of these widths with a `min-height` query (for
> example `min-width: 48em` and `min-height: 27em`) to bump up font and button
> sizes only when there's enough vertical space as well.
