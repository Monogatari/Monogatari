import { Space, Debug } from '@aegis-framework/artemis';
import type { DOM, EventCallback } from '@aegis-framework/artemis';
import AudioPlayer from './lib/AudioPlayer';
import type { StaticComponent, StaticAction, Character, GameSettings, PlayerPreferences, StateMap, HistoryMap, GlobalsMap, ActionInstance, StorageInterface } from './lib/types';
import type TypeWriterComponent from './components/type-writer';
import type { VisualNovelEngine } from './lib/types/Monogatari';
declare global {
    interface Window {
        Cypress?: unknown;
    }
}
/**
 * Every Monogatari Game is composed mainly of the following items:
 *
 * Actions: The list of capabilities a Monogatari script can run.
 *
 * Components: The list of screens and other HTML elements available in the game.
 *
 * State: The current state of the game, this simple object contains the current
 *        label and step as well as the things being shown or played by every action.
 *
 * History: Every action and even components may keep a history on what statements
 *			have been applied. The history is
 *
 * Assets: The list of different assets declared by the developer to use in throughout
 * 		   the game.
 *
 * Script: All the labels and statements that make up the story and game play.
 *
 * Characters: The list of characters that participate in the script of the game.
 *
 * Monogatari follows a 3-step life cycle:
 *
 * 1. Setup - All needed elements are added to the DOM and all variables get
 * 			  initialized. This first step is all about preparing all the needed
 * 			  elements.
 *
 * 2. Bind - Once the game has been setup, its time to bind all the necessary
 *           event listeners or perform more operations on the DOM.
 *
 * 3. Init - Finally, once the game was setup and it performed all the needed
 *           bindings, it may declare or modify variables that needed the HTML to
 *           be setup first or perform any other needed final operations. In this
 * 			 step, all needed elements will now be shown and the game will begin.
 *
 */
declare class Monogatari {
    /**
     * Returns the class typed as VisualNovelEngine.
     * This enables type-safe access while allowing external users to extend
     * the VisualNovelEngine interface via declaration merging.
     *
     * @internal
     */
    private static asEngine;
    static _languageMetadata: Record<string, {
        code: string;
        icon: string;
    }>;
    static _events: Record<string, unknown>;
    static _selector: string;
    static _actions: StaticAction[];
    static _components: StaticComponent[];
    static _translations: Record<string, Record<string, string>>;
    static _script: Record<string, unknown>;
    static _characters: Record<string, Character>;
    static _storage: Record<string, unknown>;
    static audioContext: AudioContext | undefined;
    static _audioBufferCache: Map<string, AudioBuffer>;
    static _imageCache: Map<string, HTMLImageElement>;
    static _audioBufferSpace: Space | null;
    static _screenshotSpace: Space | null;
    static _indexedDBAvailable: boolean | null;
    static _hasCustomSaveScreenshot: boolean;
    static _pendingScreenshot: Promise<Blob | null> | null;
    static Storage: StorageInterface;
    private static _blobToDataURL;
    private static _onSaveScreenshot;
    static get onSaveScreenshot(): (slotKey: string, blob: Blob) => Promise<string>;
    static set onSaveScreenshot(callback: (slotKey: string, blob: Blob) => Promise<string>);
    static onLoadScreenshot: (key: string) => Promise<string>;
    static onDeleteScreenshot: (key: string) => Promise<void>;
    static _mediaPlayers: Record<string, Record<string, HTMLAudioElement | HTMLVideoElement | AudioPlayer | (HTMLAudioElement & {
        stop?: () => void;
    }) | (HTMLVideoElement & {
        stop?: () => void;
    })>>;
    static _state: StateMap;
    static _history: HistoryMap;
    static ambientPlayer: HTMLAudioElement | null;
    static _functions: Record<string, {
        apply: () => boolean;
        revert: () => boolean;
    }>;
    static _$: Record<string, unknown>;
    static _assets: Record<string, Record<string, string>>;
    static _settings: GameSettings;
    static _preferences: PlayerPreferences;
    static _globals: Partial<GlobalsMap>;
    static _listeners: Array<{
        name: string;
        keys?: string | string[];
        callback: (this: VisualNovelEngine, event: Event, element: DOM) => unknown;
    }>;
    static _configuration: Record<string, unknown>;
    static _templates: Record<string, unknown>;
    static _upgrade: Record<string, {
        storage?: (oldData: unknown) => unknown;
        replaceStorage?: boolean;
    }>;
    static _temp: Record<string, unknown>;
    static version: string;
    static _id: string;
    /**
     * @static onStart - This is the main onStart function, it acts as an event
     * listener when the game is started. This function will call its action
     * counterparts.
     *
     * @return {Promise} - The promise is resolved if all action's onStart function
     * was resolved and is rejected if any were rejected.
     */
    static onStart(): Promise<void[]>;
    /**
     * @static onLoad - This is the main onStart function, it acts as an event
     * listener when a game is loaded. This function will call its action
     * counterparts so that each action is able to run any operations needed
     * when a game is loaded such as restoring their state.
     *
     * @return {Promise} - The promise is resolved is all action's onLoad function
     * was resolved and is rejected if any were rejected.
     */
    static onLoad(): Promise<unknown[]>;
    /**
     * @static width - Determines the real width of the Monogatari element, pretty
     * useful when dealing with canvas or other things that require specific measurements.
     *
     * @return {number} - Computed Width of the element
     */
    static width(): number;
    /**
     * @static height - Determines the real height of the Monogatari element, pretty
     * useful when dealing with canvas or other things that require specific measurements.
     *
     * @return {number} - Computed Width of the element
     */
    static height(): number;
    /**
     * @static debug - If the Monogatari debug file is present, this function
     * will give access to the debug tools that are a replacement for the console
     * log functions.
     *
     * @returns {Debug} - Proxy to the Artemis Debug Class
     */
    static get debug(): typeof Debug;
    static set debug(_: typeof Debug);
    /**
     * @static string - Gets the translation of a string. This is of course limited
     * to the translations defined for each language using the translation
     * function.
     *
     * @param  {string} key - The key of the string whose translation is needed
     *
     * @return {string} - String translation in the current language given the
     * user's preferences.
     */
    static string(key: string): string | undefined;
    /**
     * @static history - Simple function to access, create and modify history
     * objects. Each history is a simple array.
     *
     * @param  {Object|string} [object = null] - Object with which current
     * history object will be updated with (i.e. Object.assign) or a string to access
     * a specific history. If a string is given and that history does not exists,
     * this method will create it for us.
     *
     * @return {type} - If the parameter passed was a string, this function will
     * return the history associated with that name. If no argument was passed,
     * it will return the whole history object containing all histories.
     */
    /**
     * Get the entire history object
     */
    static history(): HistoryMap;
    /**
     * Get a specific history array by key (creates if doesn't exist)
     */
    static history<K extends keyof HistoryMap>(key: K): HistoryMap[K];
    /**
     * Update history with partial object
     */
    static history(object: Partial<HistoryMap>): void;
    /**
     * Get the entire state object
     */
    static state(): StateMap;
    /**
     * Get a specific state value by key
     */
    static state<K extends keyof StateMap>(key: K): StateMap[K];
    /**
     * Update state with partial object (triggers willUpdateState/didUpdateState events)
     */
    static state(object: Partial<StateMap>): StateMap;
    /**
     * @static registerAction - Register an Action to the actions list. All actions
     * should be registered before calling the init () method so their Mounting
     * cycle is done correctly.
     *
     * @param  {Action} action - Action to register. Remember each action must
     * have an unique ID.
     */
    static registerAction(action: StaticAction, naturalPosition?: boolean): void;
    /**
     * @static unregisterAction - Removes an action from the actions list. Any
     * action you want to remove should be removed before calling the init ()
     * method so that their Mounting cycle is not executed.
     *
     * @param  {string} action - ID of the Action to unregister. Remember each action must
     * have an unique ID.
     */
    static unregisterAction(action: string): void;
    /**
     * @static actions - Returns the list of registered Actions.
     *
     * @return {Action[]} - List of registered Actions
     */
    static actions(): StaticAction[];
    /**
     * @static action - Access to an specific action class
     *
     * @param  {string} id - ID of the action you want to access to.
     * @return {Action} - Returns the action that matches the given ID
     */
    static action(id: string): StaticAction | undefined;
    /**
     * @static registerComponent - Register a Component to the components list.
     * All components should be registered before calling the init () method so
     * their Mounting cycle is done correctly.
     *
     * @param  {Component} component - Component to register. Remember each
     * component must have an unique ID.
     */
    static registerComponent(component: StaticComponent): void;
    /**
     * @static unregisterComponent - Removes a component from the components list.
     * Any component you want to remove should be removed before calling the
     * init () method so that their Mounting cycle is not executed.
     *
     * @param  {string} component - ID of the Component to unregister. Remember
     * each component must have an unique ID.
     */
    static unregisterComponent(component: string): void;
    /**
     * @static components - Returns the list of registered Components.
     *
     * @return {Component[]} - List of registered Components
     */
    static components(): StaticComponent[];
    /**
     * @static component - Access to an specific component class
     *
     * @param {string} id - ID of the component you want to access to.
     *
     * @return {Component} - Returns the component class that matches the ID
     */
    static component(id: string): StaticComponent | undefined;
    /**
     * @static assets - Simple function to modify and access the assets object,
     * all declared assets such as audio, videos and images should be registered
     * in these objects.
     *
     * @param  {string} [type = null] - The type of asset you are referring to
     * @param  {Object} [object = null] - The key/value object to assign to that asset type
     *
     * @return {Object} - If this function is called with no arguments, the whole
     * assets object will be returned.
     */
    static assets(type?: string | null, object?: Record<string, string> | null): Record<string, Record<string, string>> | Record<string, string> | undefined;
    static asset(type: string, name: string, value?: string | null): string | undefined;
    /**
     * Get or set a cached AudioBuffer
     * @param key - Cache key (e.g., 'music/theme')
     * @param buffer - AudioBuffer to cache (if setting)
     * @returns The cached AudioBuffer if getting, undefined otherwise
     */
    static audioBufferCache(key: string): AudioBuffer | undefined;
    static audioBufferCache(key: string, buffer: AudioBuffer): void;
    /**
     * Remove an AudioBuffer from the cache
     * @param key - Cache key to remove
     * @returns true if the key existed and was removed
     */
    static audioBufferUncache(key: string): boolean;
    /**
     * Clear AudioBuffer cache, optionally filtered by prefix
     * @param pattern - If provided, only clear keys starting with this pattern
     */
    static audioBufferClearCache(pattern?: string): void;
    /**
     * Get or set a cached HTMLImageElement
     * @param key - Cache key (e.g., 'scenes/forest')
     * @param image - HTMLImageElement to cache (if setting)
     * @returns The cached HTMLImageElement if getting, undefined otherwise
     */
    static imageCache(key: string): HTMLImageElement | undefined;
    static imageCache(key: string, image: HTMLImageElement): void;
    /**
     * Remove an HTMLImageElement from the cache
     * @param key - Cache key to remove
     * @returns true if the key existed and was removed
     */
    static imageUncache(key: string): boolean;
    /**
     * Clear image cache, optionally filtered by prefix
     * @param pattern - If provided, only clear keys starting with this pattern
     */
    static imageClearCache(pattern?: string): void;
    /**
     * Clear all asset caches (audio and image)
     */
    static clearAllCaches(): void;
    /**
     * Request the service worker to cache specified asset URLs
     * @param urls - Array of URLs to cache
     * @returns Promise resolving to cache result
     */
    static cacheInServiceWorker(urls: string[]): Promise<{
        success: boolean;
        cached?: number;
        total?: number;
        error?: string;
    }>;
    /**
     * Check if an asset URL is cached in the service worker
     * @param url - URL to check
     * @returns Promise resolving to whether the URL is cached
     */
    static isInServiceWorkerCache(url: string): Promise<boolean>;
    /**
     * Get cached raw data from service worker (for decoding)
     * @param url - URL of the cached asset
     * @returns Promise resolving to ArrayBuffer if found, undefined otherwise
     */
    static getFromServiceWorkerCache(url: string): Promise<ArrayBuffer | undefined>;
    /**
     * Serialized AudioBuffer format for IndexedDB storage
     */
    static serializeAudioBuffer(buffer: AudioBuffer): {
        channels: Float32Array[];
        sampleRate: number;
        length: number;
        numberOfChannels: number;
    };
    /**
     * Reconstruct an AudioBuffer from serialized data
     * This is much faster than re-decoding from raw audio file
     */
    static deserializeAudioBuffer(data: {
        channels: ArrayLike<number>[];
        sampleRate: number;
        length: number;
        numberOfChannels: number;
    }, audioContext: AudioContext): AudioBuffer;
    /**
     * Get the persistent audio buffer Space instance (IndexedDB)
     * Lazily initialized on first access. Returns null if IndexedDB is unavailable.
     */
    static audioBufferSpace(): Promise<Space | null>;
    /**
     * Get the save screenshot Space instance (IndexedDB)
     * Lazily initialized on first access. Returns null if IndexedDB is unavailable.
     */
    static screenshotSpace(): Promise<Space | null>;
    /**
     * Check if IndexedDB is available for audio caching
     * @returns true if available, false if not, null if not yet checked
     */
    static isIndexedDBAvailable(): boolean | null;
    /**
     * Store a decoded AudioBuffer in persistent storage (IndexedDB)
     * @param key - Cache key (e.g., 'music/theme')
     * @param buffer - AudioBuffer to store
     */
    static storeAudioBufferPersistent(key: string, buffer: AudioBuffer): Promise<void>;
    /**
     * Retrieve a decoded AudioBuffer from persistent storage (IndexedDB)
     * @param key - Cache key (e.g., 'music/theme')
     * @returns The AudioBuffer if found, undefined otherwise
     */
    static getAudioBufferPersistent(key: string): Promise<AudioBuffer | undefined>;
    /**
     * Remove an AudioBuffer from persistent storage (IndexedDB)
     * @param key - Cache key to remove
     */
    static removeAudioBufferPersistent(key: string): Promise<void>;
    /**
     * Clear all AudioBuffers from persistent storage (IndexedDB)
     */
    static clearAudioBufferPersistent(): Promise<void>;
    static characters(object?: Record<string, Character> | null): Record<string, Character>;
    static character(id: string, object?: Partial<Character> | null): Character | undefined;
    static languageMetadata(language: string, object?: {
        code?: string;
        icon?: string;
    } | null): {
        code: string;
        icon: string;
    } | Record<string, {
        code: string;
        icon: string;
    }> | undefined;
    static translations(object?: string | Record<string, Record<string, string>> | null): Record<string, string> | Record<string, Record<string, string>> | undefined;
    static translation(language: string, strings?: Record<string, string>): Record<string, string>;
    /**
     * Get a setting value by key
     */
    static setting<K extends keyof GameSettings>(key: K): GameSettings[K];
    /**
     * Set a setting value by key
     */
    static setting<K extends keyof GameSettings>(key: K, value: GameSettings[K]): GameSettings[K];
    static settings(object?: Partial<GameSettings> | null): GameSettings;
    /**
     * Get a preference value by key
     */
    static preference<K extends keyof PlayerPreferences>(key: K): PlayerPreferences[K];
    /**
     * Set a preference value by key
     */
    static preference<K extends keyof PlayerPreferences>(key: K, value: PlayerPreferences[K]): PlayerPreferences[K];
    static preferences(object?: Partial<PlayerPreferences> | null, save?: boolean): PlayerPreferences;
    /**
     * Get or set the configuration.
     *
     * @param {string|object} key
     * @param {object} object
     */
    static configuration(key?: string | Record<string, unknown>, object?: Record<string, unknown>): unknown;
    static storage(object?: string | Record<string, unknown> | null): unknown;
    static script(object?: string | Record<string, unknown> | null): unknown;
    static label(): unknown[];
    static label(key: string): unknown;
    static label(key: string, language: Record<string, unknown[]>): void;
    static label(key: string, language: string, value: unknown[]): void;
    static fn(name: string, { apply, revert }?: {
        apply?: () => boolean;
        revert?: () => boolean;
    }): {
        apply: () => boolean;
        revert: () => boolean;
    };
    /**
     * Placeholders. Saves up an action (any kind of action) for later use within
     * the game in a key-value manner.
     *
     * @param {string} name - The name with which the action will be saved and later used
     * @param {any} value - The value (an action) to save up
     *
     * @returns {(any|void)} - The value of an action given its name, the whole
     * object if both params are missing and void if used for assigning the value.
     *
     */
    static $(name: string | Record<string, unknown> | undefined, value?: unknown): unknown;
    static globals(): GlobalsMap;
    static globals(object: Partial<GlobalsMap>): GlobalsMap;
    static global<K extends keyof GlobalsMap>(key: K): GlobalsMap[K];
    static global<K extends keyof GlobalsMap>(key: K, value: GlobalsMap[K]): GlobalsMap[K];
    static template(key: string, value?: unknown): unknown;
    static mediaPlayers(key?: string, object?: boolean): Record<string, HTMLAudioElement | HTMLVideoElement | AudioPlayer | (HTMLAudioElement & {
        stop?: () => void;
    }) | (HTMLVideoElement & {
        stop?: () => void;
    })> | Record<string, Record<string, HTMLAudioElement | HTMLVideoElement | AudioPlayer | (HTMLAudioElement & {
        stop?: () => void;
    }) | (HTMLVideoElement & {
        stop?: () => void;
    })>> | (HTMLAudioElement | HTMLVideoElement | AudioPlayer | (HTMLAudioElement & {
        stop?: () => void;
    }) | (HTMLVideoElement & {
        stop?: () => void;
    }))[];
    static mediaPlayer(type: string, key: string, value?: HTMLAudioElement | HTMLVideoElement | AudioPlayer): HTMLAudioElement | HTMLVideoElement | AudioPlayer | undefined;
    static removeMediaPlayer(type: string, key?: string): void;
    static temp(key: string, value?: unknown): unknown;
    /**
     * Localize every element with a data-string property using the translations
     * available. If no translation is found for the current language, the current
     * text of the element will be kept.
     */
    static localize(): void;
    /**
     * Preload game assets
     */
    static preload(): Promise<void>;
    /**
     * @static translate - This method will try to translate parts of a string
     * using the translation strings available. Any string containing a format
     * like this one: "_(SomeKey)" will get that replaced with the translated
     * string of that key.
     *
     * @param {string} statement - String to translate.
     *
     * @returns {string} - The translated string
     */
    static translate(statement: string): string;
    /**
     * @static replaceVariables - Recursively replace all occurrences of
     * {{variable_name}} with the actual value for that variable name on the
     * storage object.
     *
     * @param {string} statement - The text where to interpolate the variables
     *
     * @returns {string} - The text with the interpolated variables
     */
    static replaceVariables(statement: string): string;
    /**
     * @static saveTo - Save the current game state into a given Slot
     *
     * @param {string} [prefix = 'SaveLabel'] - The prefix label to be used for the
     * slot. Should be either 'SaveLabel' or 'AutoSaveLabel'.
     * @param {int} [id = null] - The numeric ID to be used for the slot. If none
     * is given, it will be determined using the getMaxSlotId function and upping
     * it by 1
     * @param {string} [name = null] - The name given by the player to the slot. If none is
     * given, the current date will be used
     *
     * @returns {Promise} - The promise of the save operation
     */
    static saveTo(prefix?: string, id?: number | null, name?: string | null): Promise<unknown>;
    static assertAsync(callable: (...args: unknown[]) => unknown, self?: unknown, args?: unknown[] | null): Promise<void>;
    static next(): Promise<void>;
    static previous(): Promise<void>;
    static resetGame(): Promise<unknown[]>;
    /**
     * @static keyBoardShortcut - Register a new callback for a custom keyboard
     * shortcut
     *
     * @param {string|Array<string>} shortcut - Sequence of keys that represent
     * the shortcut
     * @param {function} callback - The function to run when that sequence of keys
     * is pressed
     *
     * @returns {void}
     */
    static keyboardShortcut(shortcut: string | string[], callback: (this: VisualNovelEngine, event: KeyboardEvent, element: DOM) => void): void;
    static upgrade(oldVersion: string, newVersion: string, callbacks: {
        storage?: (oldData: unknown) => unknown;
        replaceStorage?: boolean;
    }): void;
    static setupStorage(): void;
    static registerListener(name: string, listener: {
        keys?: string | string[];
        callback: (this: VisualNovelEngine, event: Event, element: DOM) => unknown;
    }, replace?: boolean): void;
    static unregisterListener(name: string): void;
    static runListener(name: string, event?: Event | null, element?: DOM | null): Promise<void>;
    /**
     * @static object - Get all the relevant information of the game state
     *
     * @returns {Object} - An object containing the current histories, state and
     * storage variables.
     * @returns {Object} history - The full history object
     * @returns {Object} state - The full state object
     * @returns {Object} storage- The full storage object
     */
    static object(): {
        history: HistoryMap;
        state: StateMap;
        storage: unknown;
    };
    static prepareAction(statement: string, { cycle, extras }: {
        cycle: 'Application' | 'Revert';
        extras?: Record<string, unknown>;
    }): ActionInstance | null;
    static prepareAction(statement: Record<string, unknown>, { cycle, extras }: {
        cycle: 'Application' | 'Revert';
        extras?: Record<string, unknown>;
    }): ActionInstance | null;
    static prepareAction(statement: string | Record<string, unknown>, { cycle, extras }: {
        cycle: 'Application' | 'Revert';
        extras?: Record<string, unknown>;
    }): ActionInstance | null;
    static revert(statement?: unknown, shouldAdvance?: boolean, shouldStepBack?: boolean): Promise<{
        advance: boolean;
        step: boolean;
    } | void>;
    static run(statement: unknown, shouldAdvance?: boolean): Promise<{
        advance: boolean;
    }>;
    static alert(id: string, options: Record<string, unknown>): void;
    static dismissAlert(id?: string | null): void;
    /**
     * @static loadFromSlot - Load a slot from the storage. This will recover the
     * state of the game from what was saved in it.
     *
     * @param {string} slot - The key with which the slot was saved on the storage
     */
    static loadFromSlot(slot: string): Promise<void>;
    static proceed({ userInitiated, skip, autoPlay }?: {
        userInitiated?: boolean | undefined;
        skip?: boolean | undefined;
        autoPlay?: boolean | undefined;
    }): Promise<void>;
    static rollback(): Promise<void>;
    static shouldProceed({ userInitiated, skip, autoPlay }: {
        userInitiated?: boolean | undefined;
        skip?: boolean | undefined;
        autoPlay?: boolean | undefined;
    }): Promise<unknown[]>;
    static willProceed(): Promise<unknown[]>;
    static stopTyping(component: TypeWriterComponent): void;
    static shouldRollback(): Promise<unknown[]>;
    static willRollback(): Promise<unknown[]>;
    /**
     * @static playAmbient - Play the main menu music using the key defined in the
     * 'MainScreenMusic' property of the game settings.
     */
    static playAmbient(): void;
    static stopAmbient(): void;
    static showMainScreen(): void;
    static showSplashScreen(): void;
    /**
     * @static autoPlay - Enable or disable the autoplay feature which allows the
     * game to play itself (of sorts), it will go through the dialogs alone but
     * will wait when user interaction is needed.
     *
     * @param {boolean} enable - Wether the auto play feature will be enabled (true)
     * or disabled (false);
     */
    static autoPlay(enable: boolean): void;
    /**
     * @static distractionFree - Enable or disable the distraction free mode
     * where the dialog box is hidden so that the player can look at the characters
     * and background with no other elements on the way. A 'transparent' class
     * is added to the quick menu when this mode is enabled.
     */
    static distractionFree(): void;
    static setup(selector: string): Promise<void | undefined>;
    /**
     * @static skip - Enable or disable the skip mode which is similar to auto
     * play but simply skips fast through the game.
     *
     * @param {boolean} enable - Wether it should be enabled (true) or disabled (false)
     */
    static skip(enable: boolean): void;
    static showScreen(screen: string): void;
    static hideScreens(): void;
    static resize(_element: unknown, proportionWidth: number, proportionHeight: number): void;
    static goBack(event: Event, selector: string): void;
    /**
     * Every event listener should be binded in this function.
     */
    static bind(selector: string): Promise<void>;
    /**
     * @static element - Get the main visual-novel element
     *
     * @template {boolean} T
     * @param {T} pure - Wether to get an Artemis DOM instance of the element
     * or a pure HTML element
     * @param {boolean} handled - Wether the case of the element not existing is
     * being handled in some way or not. If it doesn't exist and it is not being
     * handled, an error will be shown.
     *
     * @returns {T extends true ? HTMLElement : DOM}
     */
    static element(): DOM;
    static element(pure: true, handled?: boolean): HTMLElement | null;
    static element(pure: false, handled?: boolean): DOM;
    static on(event: string, target: string | EventCallback, callback?: EventCallback): void;
    static off(event: string, callback: EventCallback): void;
    static parentElement(): DOM;
    /**
     * @static trigger - Trigger a custom element with custom details data
     *
     * @param {string} name - The name of the event to trigger
     * @param {Object} [details = {}] - A key/value object with additional details
     * for the event
     *
     * @returns {void}
     */
    static trigger(name: string, details?: Record<string, unknown>): void;
    static displayInitialScreen(): void;
    /**
     * @static _setupRegistry - Configure the Pandora Registry for centralized
     * component lifecycle tracking and error handling.
     *
     * This provides:
     * - Centralized error handling for all component lifecycle methods
     * - Debug logging when Monogatari debug mode is enabled
     * - Mount/unmount tracking for debugging purposes
     *
     * @private
     */
    static _setupRegistry(): void;
    static init(selector?: string): Promise<void>;
    /**
     * Random number between `min` and `max`
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    static random(min: number, max: number): number;
}
export { Monogatari };
export default Monogatari;
//# sourceMappingURL=monogatari.d.ts.map