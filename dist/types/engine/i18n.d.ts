import type { VisualNovelEngine } from '../lib/types/Monogatari';
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
export declare function translateString(engine: VisualNovelEngine, key: string): string | undefined;
export declare function localize(engine: VisualNovelEngine): void;
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
export declare function translate(engine: VisualNovelEngine, statement: string): string;
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
export declare function replaceVariables(engine: VisualNovelEngine, statement: string): string;
export declare function translations(engine: VisualNovelEngine, object?: string | Record<string, Record<string, string>> | null): Record<string, string> | Record<string, Record<string, string>> | undefined;
export declare function translation(engine: VisualNovelEngine, language: string, strings?: Record<string, string>): Record<string, string>;
export declare function languageMetadata(engine: VisualNovelEngine, language: string, object?: {
    code?: string;
    icon?: string;
} | null): {
    code: string;
    icon: string;
} | Record<string, {
    code: string;
    icon: string;
}> | undefined;
//# sourceMappingURL=i18n.d.ts.map