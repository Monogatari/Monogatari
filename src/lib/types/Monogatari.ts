/**
 * Type definitions for the Monogatari engine class.
 *
 * The Monogatari class is a static-only class - it is never instantiated.
 * All methods and properties are static, so there is only a "static" interface.
 *
 * @packageDocumentation
 */

import type { DOM, EventCallback, Space } from '@aegis-framework/artemis';
import type { ActionInstance, StaticAction } from './Action';
import type { StaticComponent } from './Component';
import type { GameSettings } from './GameSettings';
import type { PlayerPreferences } from './PlayerPreferences';
import type TypeWriterComponent from '../../components/type-writer';
import type AudioPlayer from '../AudioPlayer';
import type {
  StateMap,
  HistoryMap,
  GlobalsMap,
  Character,
} from './index';

// ============================================================================
// Listener Types
// ============================================================================

/**
 * Listener definition for game events.
 *
 * Listeners are registered with `Monogatari.registerListener()` and can be
 * triggered by name using `Monogatari.runListener()`.
 *
 * @example
 * ```typescript
 * Monogatari.registerListener('myListener', {
 *   keys: 'space',
 *   callback: () => console.log('Space pressed!')
 * });
 * ```
 */
export interface GameListener {
  /** Unique identifier for the listener */
  name: string;

  /** Keyboard key(s) that trigger this listener */
  keys?: string | string[];

  /** Callback function invoked when the listener is triggered */
  callback: (...args: unknown[]) => unknown;
}

// ============================================================================
// Static Monogatari Interface
// ============================================================================

/**
 * Static interface for the Monogatari engine class.
 *
 * The Monogatari class is a static-only class - it is never instantiated.
 * This interface documents all public static methods and properties available
 * on the Monogatari class itself.
 *
 * @example
 * ```typescript
 * // All access is through static methods
 * Monogatari.init('#monogatari');
 * Monogatari.state('step');
 * Monogatari.next();
 * ```
 */
export interface VisualNovelEngine {
  // ===== Static Properties =====

  /**
   * Engine version string from package.json
   */
  version: string;

  /**
   * Main menu ambient audio player
   */
  ambientPlayer: HTMLAudioElement | null;

  /**
   * Web Audio API context for audio playback with effects
   */
  audioContext?: AudioContext;

  /**
   * Language metadata (code, icon) for each language
   * @internal
   */
  _languageMetadata: Record<string, { code: string; icon: string }>;

  /**
   * Storage adapter for persistent data (save files, settings)
   */
  Storage: Space;

  /**
   * Internal script storage
   * @internal
   */
  _script: Record<string, unknown>;

  // ===== Lifecycle Methods =====

  /**
   * Called when the game starts. Triggers onStart for all components and actions.
   * @returns Promise resolving to array of results from all onStart handlers
   */
  onStart: () => Promise<unknown[]>;

  /**
   * Called when a game is loaded. Triggers onLoad for all components and actions.
   * @returns Promise resolving to array of results from all onLoad handlers
   */
  onLoad: () => Promise<unknown[]>;

  /**
   * Setup phase of the mounting cycle.
   * Initializes all components and actions with the given selector.
   * @param selector - CSS selector for the game container
   * @returns Promise resolving when setup is complete
   */
  setup: (selector: string) => Promise<void | undefined>;

  /**
   * Bind phase of the mounting cycle.
   * Binds event listeners for all components and actions.
   * @param selector - CSS selector for the game container
   * @returns Promise resolving when binding is complete
   */
  bind: (selector: string) => Promise<void>;

  /**
   * Init phase - final step of the mounting cycle.
   * Initializes all components and actions, sets up the game environment.
   * @param selector - CSS selector for the game container (default: '#monogatari')
   * @returns Promise resolving when initialization is complete
   */
  init: (selector?: string) => Promise<void>;

  // ===== Configuration Methods =====

  /**
   * Get or set configuration values.
   * @param key - Configuration key or object of key-value pairs
   * @param object - Value to set (when key is a string)
   * @returns Configuration value or object
   */
  configuration: (key?: string | Record<string, unknown>, object?: Record<string, unknown>) => unknown;

  /**
   * Get or set a game setting.
   * Settings are defined in GameSettings and control game behavior.
   */
  setting: {
    /**
     * Get a setting value.
     * @param key - Setting key
     * @returns The setting value
     */
    <K extends keyof GameSettings>(key: K): GameSettings[K];
    /**
     * Set a setting value.
     * @param key - Setting key
     * @param value - New value for the setting
     * @returns The updated setting value
     */
    <K extends keyof GameSettings>(key: K, value: GameSettings[K]): GameSettings[K];
  };

  /**
   * Get or set all game settings.
   * @param object - Partial settings object to merge
   * @returns Current settings object
   */
  settings: (object?: Partial<GameSettings> | null) => GameSettings;

  /**
   * Get or set a player preference.
   * Preferences are persisted and control player-configurable options.
   */
  preference: {
    /**
     * Get a preference value.
     * @param key - Preference key
     * @returns The preference value
     */
    <K extends keyof PlayerPreferences>(key: K): PlayerPreferences[K];
    /**
     * Set a preference value.
     * @param key - Preference key
     * @param value - New value for the preference
     * @returns The updated preference value
     */
    <K extends keyof PlayerPreferences>(key: K, value: PlayerPreferences[K]): PlayerPreferences[K];
  };

  /**
   * Get or set all player preferences.
   * @param object - Partial preferences object to merge
   * @param save - Whether to persist the preferences (default: true)
   * @returns Current preferences object
   */
  preferences: (object?: Partial<PlayerPreferences> | null, save?: boolean) => PlayerPreferences;

  // ===== DOM Methods =====

  /**
   * Get the main visual-novel element.
   * Returns a DOM wrapper or raw HTMLElement depending on arguments.
   */
  element: {
    /**
     * Get the element as a DOM wrapper.
     * @returns DOM wrapper for the visual-novel element
     */
    (): DOM;
    /**
     * Get the element as a raw HTMLElement.
     * @param pure - If true, return raw HTMLElement
     * @param handled - If true, element interactions are tracked
     * @returns Raw HTMLElement or null
     */
    (pure: true, handled?: boolean): HTMLElement | null;
    /**
     * Get the element as a DOM wrapper.
     * @param pure - If false, return DOM wrapper
     * @param handled - If true, element interactions are tracked
     * @returns DOM wrapper
     */
    (pure: false, handled?: boolean): DOM;
    /**
     * Get the element with optional purity.
     * @param pure - Whether to return raw HTMLElement
     * @param handled - If true, element interactions are tracked
     * @returns DOM wrapper or HTMLElement or null
     */
    (pure?: boolean, handled?: boolean): DOM | HTMLElement | null;
  };

  /**
   * Get the parent element (the selector container).
   * @returns DOM wrapper for the parent element
   */
  parentElement: () => DOM;

  /**
   * Add event listener to the game element.
   * @param event - Event type (e.g., 'click')
   * @param target - CSS selector for event delegation or callback
   * @param callback - Event callback (when target is a selector)
   */
  on: (event: string, target: string | EventCallback, callback?: EventCallback) => void;

  /**
   * Remove event listener from the game element.
   * @param event - Event type
   * @param callback - Callback to remove
   */
  off: (event: string, callback: EventCallback) => void;

  /**
   * Trigger a custom event on the game element.
   * @param event - Event name
   * @param detail - Event detail object
   */
  trigger: (event: string, detail?: Record<string, unknown>) => void;

  // ===== Component/Action Registration =====

  /**
   * Register an action to the actions list.
   * @param action - Action class to register
   * @param naturalPosition - If true, insert at natural priority position; if false, append
   */
  registerAction: (action: StaticAction, naturalPosition?: boolean) => void;

  /**
   * Remove an action from the actions list.
   * @param action - Action ID to remove
   */
  unregisterAction: (action: string) => void;

  /**
   * Get list of registered actions.
   * @returns Array of registered action classes
   */
  actions: () => StaticAction[];

  /**
   * Get a specific action by ID.
   * @param id - Action ID
   * @returns Action class or undefined if not found
   */
  action: (id: string) => StaticAction | undefined;

  /**
   * Register a component to the components list.
   * @param component - Component class to register
   */
  registerComponent: (component: StaticComponent) => void;

  /**
   * Remove a component from the components list.
   * @param component - Component tag name to remove
   */
  unregisterComponent: (component: string) => void;

  /**
   * Get list of registered components.
   * @returns Array of registered component classes
   */
  components: () => StaticComponent[];

  /**
   * Get a specific component by tag name.
   * @param id - Component tag name
   * @returns Component class or undefined if not found
   */
  component: (id: string) => StaticComponent | undefined;

  // ===== Listener Registration =====

  /**
   * Register a listener for game events.
   * @param name - Unique listener name
   * @param listener - Listener configuration with optional keys and callback
   * @param replace - If true, replace existing listener with same name
   */
  registerListener: (name: string, listener: { keys?: string | string[]; callback: (this: VisualNovelEngine, event: Event, element: DOM) => unknown }, replace?: boolean) => void;

  /**
   * Remove a listener by name.
   * @param name - Listener name to remove
   */
  unregisterListener: (name: string) => void;

  /**
   * Run a registered listener by name.
   * @param name - Listener name to run
   * @param element - Optional DOM element context
   * @param event - Optional event that triggered the listener
   */
  runListener: (name: string, event?: Event | null, element?: DOM | null) => Promise<void>;

  /**
   * Register a keyboard shortcut.
   * @param shortcut - Key(s) that trigger the shortcut
   * @param callback - Callback invoked when shortcut is triggered, with `this` bound to the engine
   */
  keyboardShortcut: (shortcut: string | string[], callback: (this: VisualNovelEngine, event: KeyboardEvent, element: DOM) => void) => void;

  // ===== State Management =====

  /**
   * Get or set game state.
   * State is saved and restored with save/load.
   */
  state: {
    /**
     * Get all state values.
     * @returns Complete state object
     */
    (): StateMap;
    /**
     * Get a specific state value.
     * @param key - State key
     * @returns State value for the key
     */
    <K extends keyof StateMap>(key: K): StateMap[K];
    /**
     * Set state values.
     * @param object - Partial state object to merge
     * @returns Updated state object
     */
    (object: Partial<StateMap>): StateMap;
  };

  /**
   * Get or set game history.
   * History tracks actions for rollback functionality.
   */
  history: {
    /**
     * Get all history arrays.
     * @returns Complete history object
     */
    (): HistoryMap;
    /**
     * Get a specific history array.
     * @param key - History key
     * @returns History array for the key
     */
    <K extends keyof HistoryMap>(key: K): HistoryMap[K];
    /**
     * Set history values.
     * @param object - Partial history object to merge
     */
    (object: Partial<HistoryMap>): void;
  };

  /**
   * Get or set global runtime values.
   * Globals are not saved and are reset on game start.
   */
  global: {
    /**
     * Get a typed global value.
     * @param key - Global key from GlobalsMap
     * @returns Global value
     */
    <K extends keyof GlobalsMap>(key: K): GlobalsMap[K];
    /**
     * Set a typed global value.
     * @param key - Global key from GlobalsMap
     * @param value - New value
     * @returns The updated value
     */
    <K extends keyof GlobalsMap>(key: K, value: GlobalsMap[K]): GlobalsMap[K];
    /**
     * Get or set an untyped global value.
     * @param key - Global key
     * @param value - Optional new value
     * @returns Global value
     */
    (key: string, value?: unknown): unknown;
  };

  /**
   * Get or set all global values.
   */
  globals: {
    /**
     * Get all global values.
     * @returns Complete globals object
     */
    (): GlobalsMap;
    /**
     * Set global values.
     * @param object - Partial globals object to merge
     * @returns Updated globals object
     */
    (object: Partial<GlobalsMap>): GlobalsMap;
  };

  /**
   * Get or set storage variables (persisted in save files).
   * Storage is the primary way to persist game data across saves.
   * @param object - Key to get, or object to merge into storage
   * @returns Storage value(s)
   */
  storage: (object?: string | Record<string, unknown> | null) => unknown;

  /**
   * Get or set temporary values (cleared between uses).
   * Temp values are not saved and are cleared automatically.
   * @param key - Temp key
   * @param value - Optional value to set
   * @returns Temp value
   */
  temp: (key: string, value?: unknown) => unknown;

  /**
   * Get the current game state as an object (for saving).
   * @returns Object containing history, state, and storage
   */
  object: () => { history: HistoryMap; state: StateMap; storage: unknown };

  // ===== Script & Labels =====

  /**
   * Get or set the game script.
   * The script contains all labels and their statements.
   * @param object - Key to get, or script object to set
   * @returns Script value(s)
   */
  script: (object?: string | Record<string, unknown> | null) => unknown;

  /**
   * Get a label from the script or the current label.
   */
  label: {
    /**
     * Get the current label's statements.
     * @returns Array of statements
     */
    (): unknown[];
    /**
     * Get a label by name.
     * @param key - Label name
     * @returns Label content
     */
    (key: string): unknown;
    /**
     * Set a label with language variants.
     * @param key - Label name
     * @param language - Object mapping language codes to statement arrays
     */
    (key: string, language: Record<string, unknown[]>): void;
    /**
     * Set a label for a specific language.
     * @param key - Label name
     * @param language - Language code
     * @param value - Array of statements
     */
    (key: string, language: string, value: unknown[]): void;
  };

  /**
   * Get or set placeholders (saved actions for later use).
   * Placeholders allow defining reusable statement sequences.
   * @param name - Placeholder name or object of placeholders
   * @param value - Placeholder value when name is a string
   * @returns Placeholder value(s)
   */
  $: (name?: string | Record<string, unknown>, value?: unknown) => unknown;

  /**
   * Get or set custom functions.
   * Custom functions can have apply and revert callbacks.
   * @param name - Function name
   * @param callbacks - Optional apply and revert callbacks
   * @returns Function object with apply and revert methods
   */
  fn: (name: string, callbacks?: { apply?: () => boolean; revert?: () => boolean }) => { apply: () => boolean; revert: () => boolean };

  // ===== Character & Asset Access =====

  /**
   * Get or set a character definition.
   * @param id - Character ID (e.g., 'y' for Yui)
   * @param object - Optional character definition to set
   * @returns Character definition or undefined
   */
  character: (id: string, object?: Partial<Character> | null) => Character | undefined;

  /**
   * Get or set all character definitions.
   * @param object - Optional characters object to set
   * @returns All character definitions
   */
  characters: (object?: Record<string, Character> | null) => Record<string, Character>;

  /**
   * Get or set an asset by type and name.
   * @param type - Asset type (e.g., 'images', 'music')
   * @param name - Asset name
   * @param value - Optional asset path to set (null to get)
   * @returns Asset path or undefined
   */
  asset: (type: string, name: string, value?: string | null) => string | undefined;

  /**
   * Get or set assets by type.
   * @param type - Asset type (optional, returns all types if null)
   * @param object - Optional assets object to set
   * @returns Assets object
   */
  assets: (type?: string | null, object?: Record<string, string> | null) => Record<string, Record<string, string>> | Record<string, string> | undefined;

  // ===== Asset Caches =====

  /**
   * Get or set a cached AudioBuffer.
   * @param key - Cache key (e.g., 'music/theme')
   * @param buffer - AudioBuffer to cache (if setting)
   * @returns The cached AudioBuffer if getting, undefined otherwise
   */
  audioBufferCache: {
    (key: string): AudioBuffer | undefined;
    (key: string, buffer: AudioBuffer): void;
  };

  /**
   * Remove an AudioBuffer from the cache.
   * @param key - Cache key to remove
   * @returns true if the key existed and was removed
   */
  audioBufferUncache: (key: string) => boolean;

  /**
   * Clear AudioBuffer cache, optionally filtered by prefix.
   * @param pattern - If provided, only clear keys starting with this pattern
   */
  audioBufferClearCache: (pattern?: string) => void;

  /**
   * Get or set a cached HTMLImageElement.
   * @param key - Cache key (e.g., 'scenes/forest')
   * @param image - HTMLImageElement to cache (if setting)
   * @returns The cached HTMLImageElement if getting, undefined otherwise
   */
  imageCache: {
    (key: string): HTMLImageElement | undefined;
    (key: string, image: HTMLImageElement): void;
  };

  /**
   * Remove an HTMLImageElement from the cache.
   * @param key - Cache key to remove
   * @returns true if the key existed and was removed
   */
  imageUncache: (key: string) => boolean;

  /**
   * Clear image cache, optionally filtered by prefix.
   * @param pattern - If provided, only clear keys starting with this pattern
   */
  imageClearCache: (pattern?: string) => void;

  /**
   * Clear all asset caches (audio and image).
   */
  clearAllCaches: () => void;

  /**
   * Serialize an AudioBuffer into a plain object for IndexedDB storage.
   * @param buffer - AudioBuffer to serialize
   * @returns Serialized representation with channel data, sample rate, length, and channel count
   */
  serializeAudioBuffer: (buffer: AudioBuffer) => {
    channels: Float32Array[];
    sampleRate: number;
    length: number;
    numberOfChannels: number;
  };

  /**
   * Reconstruct an AudioBuffer from serialized data.
   * Much faster than re-decoding from raw audio file.
   * @param data - Serialized audio buffer data
   * @param audioContext - AudioContext to use for buffer creation
   * @returns Reconstructed AudioBuffer
   */
  deserializeAudioBuffer: (
    data: { channels: ArrayLike<number>[]; sampleRate: number; length: number; numberOfChannels: number },
    audioContext: AudioContext
  ) => AudioBuffer;

  // ===== Service Worker Communication =====

  /**
   * Request the service worker to cache specified asset URLs.
   * @param urls - Array of URLs to cache
   * @returns Promise resolving to cache result
   */
  cacheInServiceWorker: (urls: string[]) => Promise<{ success: boolean; cached?: number; total?: number; error?: string }>;

  /**
   * Check if an asset URL is cached in the service worker.
   * @param url - URL to check
   * @returns Promise resolving to whether the URL is cached
   */
  isInServiceWorkerCache: (url: string) => Promise<boolean>;

  /**
   * Get cached raw data from service worker (for decoding).
   * @param url - URL of the cached asset
   * @returns Promise resolving to ArrayBuffer if found, undefined otherwise
   */
  getFromServiceWorkerCache: (url: string) => Promise<ArrayBuffer | undefined>;

  // ===== Persistent Audio Storage (IndexedDB) =====

  /**
   * Get the persistent audio buffer Space instance (IndexedDB).
   * Lazily initialized on first access.
   * @returns Promise resolving to the Space instance, or null if IndexedDB is unavailable
   */
  audioBufferSpace: () => Promise<Space | null>;

  /**
   * Check if IndexedDB is available for audio caching.
   * @returns true if available, false if not, null if not yet checked
   */
  isIndexedDBAvailable: () => boolean | null;

  /**
   * Store a decoded AudioBuffer in persistent storage (IndexedDB).
   * @param key - Cache key (e.g., 'music/theme')
   * @param buffer - AudioBuffer to store
   */
  storeAudioBufferPersistent: (key: string, buffer: AudioBuffer) => Promise<void>;

  /**
   * Retrieve a decoded AudioBuffer from persistent storage (IndexedDB).
   * @param key - Cache key (e.g., 'music/theme')
   * @returns The AudioBuffer if found, undefined otherwise
   */
  getAudioBufferPersistent: (key: string) => Promise<AudioBuffer | undefined>;

  /**
   * Remove an AudioBuffer from persistent storage (IndexedDB).
   * @param key - Cache key to remove
   */
  removeAudioBufferPersistent: (key: string) => Promise<void>;

  /**
   * Clear all AudioBuffers from persistent storage (IndexedDB).
   */
  clearAudioBufferPersistent: () => Promise<void>;

  // ===== Media Players =====

  /**
   * Get media players by type.
   * @param type - Media type (e.g., 'music', 'sound', 'voice')
   * @param object - If true, return as object; if false, return as array
   * @returns Media players
   */
  mediaPlayers: (type?: string, object?: boolean) => Record<string, Record<string, HTMLAudioElement | HTMLVideoElement | AudioPlayer>> | (HTMLAudioElement | HTMLVideoElement | AudioPlayer)[] | Record<string, unknown>;

  /**
   * Get or set a specific media player.
   * @param type - Media type
   * @param key - Player key
   * @param value - Optional player element to set
   * @returns Media player element or undefined
   */
  mediaPlayer: (type: string, key: string, value?: HTMLAudioElement | HTMLVideoElement | AudioPlayer) => HTMLAudioElement | HTMLVideoElement | AudioPlayer | undefined;

  /**
   * Remove media player(s) by type and optionally key.
   * @param type - Media type
   * @param key - Optional specific player key to remove
   */
  removeMediaPlayer: (type: string, key?: string) => void;

  /**
   * Play the main menu ambient music.
   */
  playAmbient: () => void;

  /**
   * Stop the main menu ambient music.
   */
  stopAmbient: () => void;

  // ===== Game Flow =====

  /**
   * Prepare an action for execution.
   * Finds the matching action class and instantiates it.
   */
  prepareAction: {
    /**
     * Prepare a string statement.
     * @param statement - Statement string
     * @param options - Options with cycle and extras
     * @returns Action instance or null if no match
     */
    (statement: string, options: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
    /**
     * Prepare an object statement.
     * @param statement - Statement object
     * @param options - Options with cycle and extras
     * @returns Action instance or null if no match
     */
    (statement: Record<string, unknown>, options: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
    /**
     * Prepare any statement type (union of all possible types).
     * @param statement - Statement of any supported type
     * @param options - Options with cycle and extras
     * @returns Action instance, function, or null
     */
    (statement: string | Record<string, unknown>, options: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
  };

  /**
   * Run a statement.
   * Prepares and executes the action for the statement.
   * @param statement - Statement to run
   * @param shouldAdvance - Whether to advance after running (default: true)
   * @returns Promise with advance flag
   */
  run: (statement: unknown, shouldAdvance?: boolean) => Promise<{ advance: boolean }>;

  /**
   * Revert to a previous statement.
   * Undoes the effects of the statement.
   * @param statement - Statement to revert (optional, uses current)
   * @param shouldAdvance - Whether to advance after reverting
   * @param shouldStepBack - Whether to step back in the script
   * @returns Promise with advance and step flags
   */
  revert: (statement?: unknown, shouldAdvance?: boolean, shouldStepBack?: boolean) => Promise<{ advance: boolean; step: boolean } | void>;

  /**
   * Proceed to the next statement (with checks).
   * Checks shouldProceed before advancing.
   * @param options - Options for proceed behavior
   */
  proceed: (options?: { userInitiated?: boolean; skip?: boolean; autoPlay?: boolean }) => Promise<void>;

  /**
   * Rollback to the previous statement (with checks).
   * Checks shouldRollback before reverting.
   */
  rollback: () => Promise<void>;

  /**
   * Advance to the next statement (without checks).
   * Directly moves to the next statement.
   */
  next: () => Promise<void>;

  /**
   * Revert to the previous statement (without checks).
   * Directly undoes the previous statement.
   */
  previous: () => Promise<void>;

  /**
   * Check if the game should proceed.
   * Queries all components and actions.
   * @param options - Options for the check
   * @returns Promise resolving to array of check results
   */
  shouldProceed: (options: { userInitiated?: boolean; skip?: boolean; autoPlay?: boolean }) => Promise<unknown[]>;

  /**
   * Called when the game will proceed.
   * Notifies all components and actions.
   * @returns Promise resolving to array of results
   */
  willProceed: () => Promise<unknown[]>;

  /**
   * Check if the game should rollback.
   * Queries all components and actions.
   * @returns Promise resolving to array of check results
   */
  shouldRollback: () => Promise<unknown[]>;

  /**
   * Called when the game will rollback.
   * Notifies all components and actions.
   * @returns Promise resolving to array of results
   */
  willRollback: () => Promise<unknown[]>;

  // ===== Text Processing =====

  /**
   * Replace {{variables}} in a string with storage values.
   * @param statement - String containing variable placeholders
   * @returns String with variables replaced
   */
  replaceVariables: (statement: string) => string;

  /**
   * Translate _(key) patterns in a string.
   * @param statement - String containing translation patterns
   * @returns String with translations applied
   */
  translate: (statement: string) => string;

  /**
   * Get a translated string by key.
   * @param key - Translation key
   * @returns Translated string or undefined
   */
  string: (key: string) => string | undefined;

  /**
   * Localize all elements with data-string attributes.
   * Updates text content based on current language.
   */
  localize: () => void;

  // ===== Translations =====

  /**
   * Get or set translations.
   * @param object - Language code to get, or translations object to set
   * @returns Translations
   */
  translations: (object?: string | Record<string, Record<string, string>> | null) => Record<string, string> | Record<string, Record<string, string>> | undefined;

  /**
   * Get or set translations for a specific language.
   * @param language - Language code
   * @param strings - Optional strings object to set
   * @returns Translation strings for the language
   */
  translation: (language: string, strings?: Record<string, string>) => Record<string, string>;

  /**
   * Get or set language metadata (code, icon).
   * @param language - Language code
   * @param object - Optional metadata to set
   * @returns Language metadata
   */
  languageMetadata: (language: string, object?: { code?: string; icon?: string } | null) => { code: string; icon: string } | Record<string, { code: string; icon: string }> | undefined;

  // ===== Typing Control =====

  /**
   * Stop the typing animation on a component.
   * @param component - TypeWriter component with typing animation
   */
  stopTyping: (component: TypeWriterComponent) => void;

  // ===== UI Methods =====

  /**
   * Show an alert modal.
   * @param id - Alert ID
   * @param options - Alert options
   */
  alert: (id: string, options: Record<string, unknown>) => void;

  /**
   * Dismiss an alert modal.
   * @param id - Optional specific alert ID; if null, dismisses all
   */
  dismissAlert: (id?: string | null) => void;

  /**
   * Hide all screens.
   */
  hideScreens: () => void;

  /**
   * Show a specific screen.
   * @param screen - Screen name to show
   */
  showScreen: (screen: string) => void;

  /**
   * Show the main screen (or start game if ShowMainScreen is false).
   */
  showMainScreen: () => void;

  /**
   * Show the splash screen if configured.
   */
  showSplashScreen: () => void;

  /**
   * Toggle distraction-free mode.
   * Hides UI elements for a cleaner view.
   */
  distractionFree: () => void;

  /**
   * Display the initial screen (splash or main).
   */
  displayInitialScreen: () => void;

  // ===== Auto-play & Skip =====

  /**
   * Enable or disable auto-play mode.
   * @param enable - Whether to enable auto-play
   */
  autoPlay: (enable: boolean) => void;

  /**
   * Enable or disable skip mode.
   * @param enable - Whether to enable skip
   */
  skip: (enable: boolean) => void;

  // ===== Save/Load =====

  /**
   * Reset the game to initial state.
   * Triggers onReset for all components and actions.
   * @returns Promise resolving to array of reset results
   */
  resetGame: () => Promise<unknown[]>;

  /**
   * Save the game to a slot.
   * @param prefix - Save slot prefix (e.g., 'Save', 'AutoSave')
   * @param id - Optional slot ID (auto-generated if not provided)
   * @param name - Optional save name
   * @returns Promise resolving when save is complete
   */
  saveTo: (prefix?: string, id?: number | null, name?: string | null) => Promise<unknown | undefined>;

  /**
   * Load a game from a slot.
   * @param slot - Slot key to load from
   * @returns Promise resolving when load is complete
   */
  loadFromSlot: (slot: string) => Promise<void>;

  /**
   * Register an upgrade function for save migration.
   * @param oldVersion - Version to upgrade from
   * @param newVersion - Version to upgrade to
   * @param callbacks - Migration callbacks
   */
  upgrade: (oldVersion: string, newVersion: string, callbacks: { storage?: (oldData: unknown) => unknown }) => void;

  /**
   * Setup the storage adapter.
   */
  setupStorage: () => void;

  /**
   * Preload game assets.
   * @returns Promise resolving when preload is complete
   */
  preload: () => Promise<void>;

  // ===== Utility Methods =====

  /**
   * Run a function asynchronously and assert its result.
   * @param callable - Function to call
   * @param self - Optional `this` context
   * @param args - Optional arguments array
   * @returns Promise resolving when complete
   */
  assertAsync: (callable: (...args: unknown[]) => unknown, self?: unknown, args?: unknown[] | null) => Promise<void>;

  /**
   * Get a random integer between min and max (inclusive).
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random integer
   */
  random: (min: number, max: number) => number;

  /**
   * Get the computed width of the game element.
   * @returns Width in pixels
   */
  width: () => number;

  /**
   * Get the computed height of the game element.
   * @returns Height in pixels
   */
  height: () => number;

  /**
   * Resize elements for aspect ratio enforcement.
   * @param element - Element to resize
   * @param proportionWidth - Width proportion
   * @param proportionHeight - Height proportion
   */
  resize: (element: unknown, proportionWidth: number, proportionHeight: number) => void;

  /**
   * Handle back navigation.
   * @param event - Navigation event
   * @param selector - Selector for the container
   */
  goBack: (event: Event, selector: string) => void;

  /**
   * Get or set templates.
   * @param key - Template key
   * @param value - Optional template value to set
   * @returns Template value
   */
  template: (key: string, value?: unknown) => unknown;

  // ===== Debug =====

  /**
   * Debug utilities (proxied from Artemis Debug).
   * Only active when debug mode is enabled.
   */
  debug: {
    /** Log a message */
    log: (...args: unknown[]) => void;
    /** Log a debug message */
    debug: (...args: unknown[]) => void;
    /** Log a warning */
    warn: (...args: unknown[]) => void;
    /** Log an error */
    error: (...args: unknown[]) => void;
    /** Log a stack trace */
    trace: () => void;
    /** Start a collapsed console group */
    groupCollapsed: (label: string) => void;
    /** End a console group */
    groupEnd: (label?: string) => void;
  };
}
