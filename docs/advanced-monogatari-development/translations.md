---
title: Translations
order: 104
description: Add or override Monogatari's interface strings for your game, in any language.
---

# Translations

Monogatari's interface — buttons, labels and messages — ships translated into many languages. For your own game you can **add a language**, **override individual strings**, or tweak the wording, all from your game's JavaScript with no engine changes.

> [!NOTE]
> This page is about UI strings **in your game**. To translate the *content* of your
> story across languages, see [Internationalization](../configuration-options/game-configuration/internationalization.md).
> To contribute a translation back to Monogatari itself, see
> [Contributing Translations](../contribute/translations.md).

## How UI strings work

Every translatable piece of interface text has a **key** (e.g. `Save`, `Settings`, `Loading`). The engine looks up that key for the current language and shows the matching string. In markup, an element with `data-string="Save"` is filled with the translation of `Save` automatically — so the same interface works in every language.

## Add or override strings

Call `monogatari.translation()` with a language name and an object of `key: value` strings. It merges into that language, so you can override built-in strings or add new ones (handy for custom buttons and components):

```javascript
// Override a built-in string and add a custom one (English)
monogatari.translation ('English', {
    'Quit': 'Exit',
    'Stats': 'Statistics'   // a custom key your own button/component uses
});

// Provide strings for a whole language
monogatari.translation ('Italiano', {
    'Save': 'Salva',
    'Load': 'Carica',
    'Settings': 'Impostazioni'
});
```

Then reference a custom key from your own markup with `data-string`:

```html
<span data-string="Stats">Statistics</span>
```

## Offering multiple languages

To let players choose a language, enable multi-language mode and Monogatari shows a [language-selection screen](../components/language-selection-screen.md) before the game starts:

```javascript
monogatari.settings ({
    'MultiLanguage': true
});
```

See [Internationalization](../configuration-options/game-configuration/internationalization.md) for the full multi-language setup, including translating your story's dialog.

## See also

- [Internationalization](../configuration-options/game-configuration/internationalization.md) — Multi-language games and the language-selection screen.
- [Contributing Translations](../contribute/translations.md) — Add a language to Monogatari itself.
- [HTML Data Attributes](../style-and-design/data-attributes.md) — The `data-string` mechanism.
