---
title: Icons
order: 93
description: Use Font Awesome icons anywhere in your game — in menus, buttons and dialog.
---

# Icons

Monogatari ships with **[Font Awesome](https://fontawesome.com/)** (v7), so thousands of icons are available without installing anything. They're already used throughout the default interface — the quick-menu buttons, the help screen, and more.

## Using an icon

Add a `<span>` (or `<i>`) with the icon's classes. Each icon has a **style** prefix and a **name**:

```html
<span class="fas fa-floppy-disk"></span>   <!-- solid -->
<span class="far fa-floppy-disk"></span>   <!-- regular (outline) -->
<span class="fab fa-github"></span>        <!-- brands / logos -->
```

| Prefix | Style |
| :--- | :--- |
| `fas` | Solid |
| `far` | Regular (outline) |
| `fab` | Brands (logos) |

Browse and search every icon — with the exact class to copy — on the [Font Awesome icon gallery](https://fontawesome.com/icons).

## In menu buttons

Anywhere you give a Monogatari button an icon (a [quick menu](../components/quick-menu.md) or [main menu](../components/main-menu.md) button), you pass the same classes:

```javascript
monogatari.component ('quick-menu').addButton ({
    string: 'Stats',
    icon: 'fas fa-chart-simple',
    data: { action: 'show-stats' }
});
```

## In dialog and custom HTML

Because your game is a web page, you can drop an icon into any HTML you write — a [message](../script-actions/message.md), a custom [component](../building-blocks/components/README.md), or styled dialog:

```html
<p>Press <span class="fas fa-arrow-right"></span> to continue.</p>
```

> [!NOTE]
> Older Monogatari versions shipped Font Awesome 4/5, where some icons had different
> names (for example `fa-save` is now `fa-floppy-disk`). If an icon from an old tutorial
> doesn't show up, search its current name on the Font Awesome site.
