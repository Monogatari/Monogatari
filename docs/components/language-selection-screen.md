---
title: Language Selection Screen
order: 79
description: A pre-game screen letting players pick a language, shown for multi-language games that have the language selection screen enabled.
---

# Language Selection Screen

## Description

```markup
<language-selection-screen></language-selection-screen>
```

The language-selection-screen component lets the player choose a language before the game starts. For [multi-language](../configuration-options/game-configuration/internationalization.md) games, it shows one button per language detected in your script, each with the language's flag icon and name. Selecting a language saves it as the player's `Language` preference and localizes the engine.

**Source Code**: [https://github.com/Monogatari/Monogatari/tree/develop/src/components/language-selection-screen](https://github.com/Monogatari/Monogatari/tree/develop/src/components/language-selection-screen)

## When It Appears

The screen only does any work when **both** of these settings are `true`:

- `MultiLanguage` - marks the game as having a script in multiple languages.
- `LanguageSelectionScreen` - enables this screen before the asset loading screen.

Both are configured in `options.js`. When either is `false`, the screen renders no buttons and stays out of the way (players change language from the [Settings Screen](settings-screen.md) instead). See [Internationalization](../configuration-options/game-configuration/internationalization.md) for the full setup.

> [!NOTE]
> You most likely **won't see this screen** if you converted an existing single-language game, because your `Language` preference is already saved. To trigger it, clear the stored settings (for example, with your browser's dev tools).

## How Languages Are Detected

The list of languages comes from the keys of your script. By default the `languages` prop is set to `Object.keys (monogatari._script)`, which is the list of language objects you defined in `monogatari.script ()`. For each language, the screen looks up its metadata (registered via `monogatari.languageMetadata ()`) to get the flag `icon`. If a language has no metadata, an error is shown telling you which language is missing it.

## Structure

The component renders a heading and a row of language buttons:

```html
<language-selection-screen data-screen="language-selection">
    <div data-content="wrapper">
        <h1 data-content="title" data-string="SelectYourLanguage">Select your language</h1>
        <div data-content="buttons">
            <button data-language="English" title="English">
                <span data-content="icon">🇺🇸</span>
                <span data-content="language">English</span>
            </button>
            <button data-language="Español" title="Español">
                <span data-content="icon">🇲🇽</span>
                <span data-content="language">Español</span>
            </button>
            <!-- ...one button per detected language... -->
        </div>
    </div>
</language-selection-screen>
```

Each button carries a `data-language` attribute with the language name. The icon span is only rendered when the language metadata provides an `icon`.

## Content Areas

| Name | Selector | Description |
| :--- | :--- | :--- |
| `wrapper` | `[data-content="wrapper"]` | The screen content container |
| `title` | `[data-content="title"]` | The "Select your language" heading |
| `buttons` | `[data-content="buttons"]` | The container holding the language buttons |
| `icon` | `[data-content="icon"]` | A language's flag icon (only rendered when metadata provides one) |
| `language` | `[data-content="language"]` | A language's name |

## Props

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `languages` | `string[]` | `Object.keys (monogatari._script)` | The languages to show, taken from the script's top-level keys |
| `timeout` | `number` | `2000` | The interval, in milliseconds, used to cycle the heading translation (see below) |

## State

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | `false` | Whether the screen is visible (inherited from the base screen component) |
| `index` | `number` | `0` | The index of the language whose translation is currently shown in the heading |

## Cycling Heading

To hint that multiple languages are available, the heading cycles through each language's translation of the `SelectYourLanguage` string. After the screen mounts, a timer advances the `index` state every `timeout` milliseconds (2 seconds by default), wrapping back to the first language at the end of the list. Each time `index` changes, the heading text is replaced with that language's translation.

> [!NOTE]
> This cycling only runs while the screen is visible, and only when both `MultiLanguage` and `LanguageSelectionScreen` are enabled. The timer is cleared automatically when the screen unmounts.

## Selecting a Language

Clicking a button reads its `data-language` value and applies it:

```javascript
monogatari.preference ('Language', language);
monogatari.localize ();
```

This saves the chosen language as the player's `Language` preference and re-localizes the engine so the rest of the game appears in that language.

## Styling

```css
language-selection-screen [data-content="wrapper"] {
    flex-direction: column;
    padding: 2rem;
    height: 100%;
    justify-content: center;
}

language-selection-screen [data-content="buttons"] {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

language-selection-screen button {
    background: transparent;
    border: 4px solid var(--main-color);
    border-radius: 10px;
    padding: 1rem;
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    align-items: center;
}

language-selection-screen button [data-content="icon"] {
    font-size: 3rem;
    line-height: 1;
    margin: 1rem 0;
}

language-selection-screen button [data-content="language"] {
    font-weight: bold;
}
```

## Related

- [Internationalization](../configuration-options/game-configuration/internationalization.md) - The `MultiLanguage` and `LanguageSelectionScreen` settings and the full multi-language setup
- [Settings Screen](settings-screen.md) - Where players can change their language during play
- [Loading Screen](loading-screen.md) - Shown after a language is selected
