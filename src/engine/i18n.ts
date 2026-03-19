import type { VisualNovelEngine } from '../lib/types/Monogatari';
import { $_ } from '@aegis-framework/artemis';
import { FancyError } from '../lib/FancyError';
import { Settings } from 'luxon';

/**
 * Gets the translation of a string. This is of course limited
 * to the translations defined for each language using the translation
 * function.
 *
 * @param  engine - The VisualNovelEngine instance
 * @param  key - The key of the string whose translation is needed
 *
 * @return String translation in the current language given the
 * user's preferences.
 */
export function translateString (engine: VisualNovelEngine, key: string): string | undefined {
  const language = engine.preference ('Language') as string;

  if (typeof engine._translations[language] === 'undefined') {
    FancyError.show ('engine:translation:language_not_found', {
      language: language,
      availableLanguages: Object.keys (engine._translations),
      languageSelectorValue: `<pre><code class='language-markup'>${$_('[data-action="set-language"]').value ()}</code></pre>`
    });

    return undefined;
  }

  if (typeof engine._translations[language][key] === 'undefined') {
    FancyError.show ('engine:translation:key_not_found', {
      key: key,
      language: language,
      elements: $_(`[data-string="${key}"]`).collection,
      availableStrings: Object.keys (engine._translations[language])
    });
  }

  return engine._translations[language][key];
}

export function localize (engine: VisualNovelEngine): void {
  engine.trigger ('willLocalize');

  // Setup the correct locale for the dates
  const language = engine.preference ('Language') as string;

  const langMetadata = engine._languageMetadata[language];

  if (langMetadata?.code) {
    Settings.defaultLocale = langMetadata.code;
  }

  engine.element ().find ('[data-string]').each ((element) => {
    const stringKey = $_(element).data ('string');

    if (stringKey) {
      const string_translation = translateString (engine, stringKey);

      // Check if the translation actually exists and is not empty before
      // replacing the text.
      if (typeof string_translation !== 'undefined' && string_translation !== '') {
        $_(element).text (string_translation);
      }
    }
  });

  engine.trigger ('didLocalize');
}

/**
 * This method will try to translate parts of a string
 * using the translation strings available. Any string containing a format
 * like this one: "_(SomeKey)" will get that replaced with the translated
 * string of that key.
 *
 * @param engine - The VisualNovelEngine instance
 * @param statement - String to translate.
 *
 * @returns The translated string
 */
export function translate (engine: VisualNovelEngine, statement: string): string {
  // Find all elements in the string that match the "_(key)" format
  const matches = statement.match (/_\(\S+\)/g);
  const language = engine.preference ('Language') as string;

  // Check if any matches were found, if not then no translation is needed
  if (matches === null) {
    return statement;
  }

  // Go through all the found matches so we can get the string it maps to
  for (const match of matches) {
    // Remove the _() from the key
    const path = match.replace ('_(', '').replace (')', '').split ('.');

    // Retrieve the string from the translations using the given key
    const translationsForLang = translations (engine, language) as Record<string, unknown> | undefined;
    if (!translationsForLang) continue;

    let data: unknown = translationsForLang[path[0]];

    for (let j = 1; j < path.length; j++) {
      if (typeof data === 'object' && data !== null) {
        data = (data as Record<string, unknown>)[path[j]];
      }
    }
    if (typeof data === 'string') {
      statement = statement.replace (match, data);
    }
  }

  return statement;
}

/**
 * Recursively replace all occurrences of
 * {{variable_name}} with the actual value for that variable name on the
 * storage object.
 *
 * @param engine - The VisualNovelEngine instance
 * @param statement - The text where to interpolate the variables
 *
 * @returns The text with the interpolated variables
 */
export function replaceVariables (engine: VisualNovelEngine, statement: string): string {
  let newStatement = translate (engine, statement);

  const matches = newStatement.match (/{{\S+?}}/g);

  if (matches === null) {
    return newStatement;
  }

  for (const match of matches) {
    const path = match.replace ('{{', '').replace ('}}', '').split ('.');

    let data: unknown = engine.storage ();

    for (let j = 0; j < path.length; j++) {
      const name = path[j];
      if (typeof data === 'object' && data !== null && name in data) {
        data = (data as Record<string, unknown>)[name];
      } else {
        FancyError.show ('engine:storage:variable_not_found', {
          variable: match,
          statement: newStatement,
          partNotFound: name,
          availableVariables: typeof data === 'object' && data !== null ? Object.keys (data) : []
        });

        // TODO: Is an empty string correct here?
        return '';
      }
    }

    newStatement = newStatement.replace (match, String(data));
  }

  return replaceVariables (engine, newStatement);
}

export function translations (engine: VisualNovelEngine, object: string | Record<string, Record<string, string>> | null = null): Record<string, string> | Record<string, Record<string, string>> | undefined {
  if (object === null) {
    return engine._translations;
  }

  if (typeof object === 'string') {
    return engine._translations[object];
  }

  engine._translations = Object.assign ({}, engine._translations, object);

  return engine._translations;
}

export function translation (engine: VisualNovelEngine, language: string, strings?: Record<string, string>): Record<string, string> {
  if (typeof strings === 'undefined') {
    return engine._translations[language];
  }

  if (typeof engine._translations[language] !== 'undefined') {
    engine._translations[language] = Object.assign ({}, engine._translations[language], strings);
  } else {
    engine._translations[language] = strings;
  }

  return engine._translations[language];
}

export function languageMetadata (engine: VisualNovelEngine, language: string, object: { code?: string; icon?: string } | null = null): { code: string; icon: string } | Record<string, { code: string; icon: string }> | undefined {
  if (typeof language !== 'undefined') {
    if (object !== null) {
      if (typeof engine._languageMetadata[language] !== 'object') {
        engine._languageMetadata[language] = { code: '', icon: '' };
      }

      engine._languageMetadata[language] = Object.assign ({}, engine._languageMetadata[language], object) as { code: string; icon: string };
    }

    return engine._languageMetadata[language];
  }

  return engine._languageMetadata;
}
