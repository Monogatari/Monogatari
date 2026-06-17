---
title: Translations
order: 106
description: Help translate Monogatari's interface into more languages.
---

# Translations

Beyond translating your own game's content, you can help translate **Monogatari's interface** — the built-in buttons, labels and messages — into more languages. If you speak a language Monogatari doesn't support yet, your help is more than welcome!

> [!NOTE]
> This page is about contributing UI translations to the Monogatari engine itself.
> To translate the *content of your own game*, see
> [Internationalization](../configuration-options/game-configuration/internationalization.md).

## Where the translations live

Each language is a single TypeScript file under [`src/translations/`](https://github.com/Monogatari/Monogatari/tree/develop/src/translations) that exports a default object mapping string keys to their translated text:

```typescript
// src/translations/English.ts
export default {
    'AdvanceHelp': 'To advance through the game, left-click or tap anywhere on the game screen or press the space key',
    'Audio': 'Audio',
    'AutoPlay': 'Auto',
    'Back': 'Back',
    'Cancel': 'Cancel',
    'Close': 'Close',
    // ...one entry per interface string
};
```

The **keys** are fixed identifiers used throughout the engine — keep them exactly as they are. Only translate the **values**.

## Adding a new language

1. **Copy `English.ts`** to a new file named after your language in its own script, e.g. `src/translations/Italiano.ts`. English is the most complete file, so it's the best starting point.

2. **Translate every value**, leaving the keys untouched:

   ```typescript
   // src/translations/Italiano.ts
   export default {
       'AdvanceHelp': 'Per avanzare nel gioco, fai clic o tocca lo schermo, oppure premi la barra spaziatrice',
       'Audio': 'Audio',
       'AutoPlay': 'Auto',
       'Back': 'Indietro',
       // ...
   };
   ```

3. **Register the language** in [`src/index.ts`](https://github.com/Monogatari/Monogatari/blob/develop/src/index.ts). Import your file, add it to `Monogatari._translations` keyed by the language's native name, and add its metadata — an [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) and a flag emoji — to `Monogatari._languageMetadata`:

   ```typescript
   import italian from './translations/Italiano';

   Monogatari._translations = {
       // ...existing languages
       'Italiano': italian,
   };

   Monogatari._languageMetadata = {
       // ...existing metadata
       'Italiano': {
           code: 'it',
           icon: '🇮🇹',
       },
   };
   ```

4. **Open a pull request** with your new translation file and the registration changes.

> [!TIP]
> If a string has no natural translation in your language, it's fine to keep the
> English value — a partial translation is still a great contribution, and others can
> fill in the gaps later.

## See also

- [Internationalization](../configuration-options/game-configuration/internationalization.md) — Translate your own game's content and offer a language-selection screen.
- [Language Selection Screen](../components/language-selection-screen.md) — The screen players use to pick a language.
