import {
  $_,
  $_ready,
  Space,
  SpaceAdapter,
  Platform,
  Preload,
  Util,
  FileSystem,
  Text,
  Debug
} from '@aegis-framework/artemis';
import type { DOM, EventCallback, Callable } from '@aegis-framework/artemis';
import {  Registry } from '@aegis-framework/pandora';
import mousetrap, { ExtendedKeyboardEvent } from 'mousetrap';
import { FancyError } from './lib/FancyError';
import Component  from './lib/Component';
import Action from './lib/Action';
import AudioPlayer from './lib/AudioPlayer';
import type { StaticComponent, StaticAction, ActionApplyResult, FancyErrorProps, Character, LegacySaveData, GameSettings, PlayerPreferences, StateMap, HistoryMap, GlobalsMap, ActionInstance } from './lib/types';
import deeply from 'deeply';
import { version } from '../package.json';
import { Random, browserCrypto } from 'random-js';
import migrate from './migrations';

// TODO: We need to decouple these.
import type TypeWriterComponent from './components/type-writer';
import type PreloadAction from './actions/Preload';

import { Settings, DateTime } from 'luxon';
import type { VisualNovelEngine } from './lib/types/Monogatari';

// Declare MonogatariDebug as a global variable (set by debug module when loaded)
declare const MonogatariDebug: object | undefined;

// Extend Window interface for Cypress
declare global {
  interface Window {
    Cypress?: unknown;
  }
}

/**
 * Overcome the `this` is undefined
 */
const merge = deeply.bind({});

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
class Monogatari {

  /**
   * Returns the class typed as VisualNovelEngine.
   * This enables type-safe access while allowing external users to extend
   * the VisualNovelEngine interface via declaration merging.
   *
   * @internal
   */
  private static asEngine(): VisualNovelEngine {
    return this as unknown as VisualNovelEngine;
  }

  static _languageMetadata: Record<string, { code: string; icon: string }> = {};
  static _events: Record<string, unknown> = {};

  static _selector = '#monogatari';

  static _actions: StaticAction[] = [];
  static _components: StaticComponent[] = [];
  static _translations: Record<string, Record<string, string>> = {};
  static _script: Record<string, unknown> = {};
  static _characters: Record<string, Character> = {};
  static _storage: Record<string, unknown> = {};

  // Web Audio API context for audio playback with effects
  static audioContext: AudioContext | undefined;

  // Asset caches for decoded audio and images
  static _audioBufferCache: Map<string, AudioBuffer> = new Map();
  static _imageCache: Map<string, HTMLImageElement> = new Map();

  // Persistent audio buffer storage
  static _audioBufferSpace: Space | null = null;

  // Track IndexedDB availability: null = not checked, true = available, false = unavailable
  static _indexedDBAvailable: boolean | null = null;

  static Storage: Space = new Space ();

  static _mediaPlayers: Record<string, Record<string, HTMLAudioElement | HTMLVideoElement | AudioPlayer | (HTMLAudioElement & { stop?: () => void }) | (HTMLVideoElement & { stop?: () => void })>> = {
    music: {},
    sound: {},
    voice: {},
    video: {}
  };

  static _state: StateMap = {
    step: 0,
    label: 'Start',
    music: [],
    sound: [],
    voice: [],
    scene: '',
    background: '',
    characters: [],
    characterLayers: [],
    images: [],
    particles: '',
    videos: [],
    canvas: [],
  };

  static _history: HistoryMap = {
    label: [],
    music: [],
    sound: [],
    voice: [],
    scene: [],
    background: [],
    sceneElements: [],
    sceneState: [],
    character: [],
    characterLayer: [],
    image: [],
    particle: [],
    video: [],
    canvas: [],
    nvl: [],
    clear: [],
    choice: [],
    jump: [],
    conditional: [],
  };

  static ambientPlayer: HTMLAudioElement | null = null;

  static _functions: Record<string, { apply: () => boolean; revert: () => boolean }> = {};

  static _$: Record<string, unknown> = {};

  static _assets: Record<string, Record<string, string>> = {
    music: {},
    voices: {},
    sounds: {},
    videos: {},
    images: {},
    scenes: {},
    gallery: {}
  };

  // These are the default settings and they are overwritten by the user's settings
  // New elements here will no conflict with the user's settings and allows a better
  // update experience
  static _settings: GameSettings = {

    // The name of your game, this will be used to store all the data so once
    // you've released a game using one name, it shouldn't change. Please use the
    // Version Setting to indicate a new release of your game!
    'Name': 'My Visual Novel',

    // The version of your game in semantic versioning (https://semver.org/).
    'Version': '0.1.0',

    // Initial Label *
    'Label': 'Start',

    // Number of AutoSave Slots
    'Slots': 10,

    // Change to true for a MultiLanguage GameScreen.
    'MultiLanguage': false,

    // If the 'Multilanguage' setting is set to `true`. This will enable a
    // language selection screen that will be shown before the asset loading
    // screen. If set to false, the loading screen will appear first instead and
    // players will have to change the language from the settings screen.
    'LanguageSelectionScreen': true,

    // Music for the Main Menu.
    'MainScreenMusic': '',

    // Prefix for the Save Slots in Local Storage.
    'SaveLabel': 'Save',
    'AutoSaveLabel': 'AutoSave',

    // Turn main menu on/off; Default: true *
    'ShowMainScreen': true,

    // Turn image preloading on/off, Default: true
    'Preload': true,

    // Time interval between autosaves (In Minutes). Default: 0 (Off)
    'AutoSave': 0,

    // Enable service workers; Default: true *
    'ServiceWorkers': true,

    // The Aspect Ratio your background images are on. This has no effect on
    // web deployed novels.
    'AspectRatio': '16:9',

    // Force aspect ratio, it will make all images to comply with aspect ratio.
    // Values: 'None' (don't force), 'Visuals' (force only visuals)
    // or 'Global' (force all game)
    'ForceAspectRatio': 'None',

    // Enables or disables the typing text animation for the whole game.
    'TypeAnimation': true,

    // Enables or disables the typing text animation in NVL dialogs for the
    // whole game.
    'NVLTypeAnimation': true,

    // Enables or disables the typing animation for the narrator.
    // If the previous property was set to false, the narrator won't shown
    // the animation even if this is set to true.
    'NarratorTypeAnimation': true,

    // Enables or disables the typing animation for the special centered
    // character. If the TypeAnimation property was set to false, the centered
    // character won't show the animation even if this is set to true.
    'CenteredTypeAnimation': true,

    // Force some orientation on mobile devices. If this setting is set either
    // to portrait or landscape, a warning message will be displayed so the
    // player rotates its device.
    // Possible values: any, portrait or landscape.
    'Orientation': 'any',

    // Allow players to skip through the game. Similar to the auto play feature,
    // skipping will allow players to go through the game really fast.
    // If this value is set to 0, no skipping will be allowed but if it's set
    // to a higher number, skipping will be allowed and that value will be taken
    // as the speed in milliseconds with which the game will skip through the script
    'Skip': 0,

    // Define the directories where the assets are located. The root directory is
    // the holder for the other asset specific directories, this directories are
    // used when retrieving the files on the game.
    'AssetsPath': {
      'root': 'assets',
      'characters': 'characters',
      'icons': 'icons',
      'images': 'images',
      'music': 'music',
      'scenes': 'scenes',
      'sounds': 'sounds',
      'ui': 'ui',
      'videos': 'videos',
      'voices': 'voices',
      'gallery': 'gallery'
    },

    // Name of the Splash Screen Label. If a name is given and a label with that
    // name exists on the game's script, it will be used to show a splash screen
    // right after the loading screen.
    'SplashScreenLabel': '_SplashScreen',

    // Define what storage engine should be used to save the game data. *
    // Adapters Available:
    // - LocalStorage: This one is used by default
    // - SessionStorage: Same as LocalStorage but will be cleared when the page
    // 					 is closed.
    // - IndexedDB: The information is saved using the IndexedDB web API
    // - RemoteStorage: The information will be sent and retrieved from a given
    //					URL Endpoint providing a REST API.
    'Storage': {
      'Adapter': 'LocalStorage',
      'Store': 'GameData',
      'Endpoint': ''
    },

    // Whether players can go back to previous points of the game or not.
    // Default: true
    // If this is set to false, the "Back" button on the quick menu will not be
    // shown and the left arrow keyboard shortcut will be disabled.
    'AllowRollback': true,

    // Whether experimental features should be enabled or not. Default: false
    // These features are unfinished and unstable, chances are they will still
    // go through a lot of changes and functionality won't have any backward
    // compatibility rendering your save files unusable on many cases.
    'ExperimentalFeatures': false
  };

  static _preferences: PlayerPreferences = {

    // Initial Language for Multilanguage Games or for the Default GUI Language.
    'Language': 'English',

    // Initial Volumes from 0.0 to 1.
    'Volume': {
      'Music': 1,
      'Voice': 1,
      'Sound': 1,
      'Video': 1
    },

    // Initial resolution used for Electron, it must match the settings inside
    // the electron.js file. This has no effect on web deployed novels.
    'Resolution': '800x600',

    // Speed at which dialog text will appear
    'TextSpeed': 20,

    // Speed at which the Auto Play feature will show the next statement
    // It is measured in seconds and starts counting after the text is
    // completely displayed.
    'AutoPlaySpeed': 5
  };

  static _globals: Partial<GlobalsMap> = {
    distraction_free: false,
    delete_slot: null,
    overwrite_slot: null,

    playing: false,
    current_auto_save_slot: 1,
    _auto_play_timer: null,
    skip: null,
    _log: [],
    _auto_save_interval: null,


    _restoring_state: false,
    on_splash_screen: false,

    _didSetup: false,
    _didBind: false,
    _didInit: false,
    _engine_block: false,

    // TODO: Eventually get rid of these as they are deprecated
    block: false,
    _executing_sub_action: false,

  };

  static _listeners: Array<{ name: string; keys?: string | string[]; callback: (this: VisualNovelEngine, event: Event, element: DOM) => unknown }> = [];

  static _configuration: Record<string, unknown> = {
    'main-menu': {
      buttons: [
        {
          string: 'Start',
          data: {
            action: 'start'
          }
        },
        {
          string: 'Load',
          data: {
            action: 'open-screen',
            open: 'load'
          }
        },
        {
          string: 'Settings',
          data: {
            action: 'open-screen',
            open: 'settings'
          }
        },
        {
          string: 'Help',
          data: {
            action: 'open-screen',
            open: 'help'
          }
        }
      ]
    },
    'quick-menu': {
      buttons: [
        {
          string: 'Back',
          icon: 'fas fa-arrow-left',
          link: '#',
          data: {
            action: 'back'
          }
        },
        {
          string: 'Hide',
          icon: 'fas fa-eye',
          data: {
            action: 'distraction-free'
          }
        },
        {
          string: 'AutoPlay',
          icon: 'fas fa-play-circle',
          data: {
            action: 'auto-play'
          }
        },
        {
          string: 'Skip',
          icon: 'fas fa-fast-forward',
          data: {
            action: 'skip'
          }
        },
        {
          string: 'Save',
          icon: 'fas fa-save',
          data: {
            action: 'open-screen',
            open: 'save'
          }
        },
        {
          string: 'Load',
          icon: 'fas fa-undo',
          data: {
            action: 'open-screen',
            open: 'load'
          }
        },
        {
          string: 'Settings',
          icon: 'fas fa-cog',
          data: {
            action: 'open-screen',
            open: 'settings'
          }
        },
        {
          string: 'Quit',
          icon: 'fas fa-times-circle',
          data: {
            action: 'end'
          }
        }
      ]
    },
    credits: {}
  };

  static _templates: Record<string, unknown> = {};

  static _upgrade: Record<string, { storage?: (oldData: unknown) => unknown }> = {};

  static _temp: Record<string, unknown> = {};

  static version: string = version;

  static _id: string = 'visual-novel';


  /**
   * @static onStart - This is the main onStart function, it acts as an event
   * listener when the game is started. This function will call its action
   * counterparts.
   *
   * @return {Promise} - The promise is resolved if all action's onStart function
   * was resolved and is rejected if any were rejected.
   */
  static onStart () {
    const promises = [];

    for (const component of this.components ()) {
      promises.push (component.onStart ());
    }

    for (const action of this.actions ()) {
      promises.push (action.onStart ());
    }

    return Promise.all (promises);
  }

  /**
   * @static onLoad - This is the main onStart function, it acts as an event
   * listener when a game is loaded. This function will call its action
   * counterparts so that each action is able to run any operations needed
   * when a game is loaded such as restoring their state.
   *
   * @return {Promise} - The promise is resolved is all action's onLoad function
   * was resolved and is rejected if any were rejected.
   */
  static onLoad () {
    const promises = [];

    this.global ('_restoring_state', true);

    const actions = this.actions ();
    const orders = [...new Set(actions.map(action => action.loadingOrder))].sort();

    const loadActions = (actions: StaticAction[], dependency = Promise.resolve()) => {
      return dependency.then(() => {
        const _promises: Promise<void>[] = [];
        for (const action of actions) {
          _promises.push (action.onLoad ());
        }
        return Promise.all(_promises);
      });
    };

    let previous: Promise<unknown> = Promise.resolve();

    for (const order of orders) {
      previous = loadActions(actions.filter(a => a.loadingOrder === order), previous as Promise<void>);
    }

    promises.push(previous);

    for (const component of this.components ()) {
      promises.push (component.onLoad ());
    }

    return Promise.all (promises).then ((promises) => {
      this.global ('_restoring_state', false);
      return Promise.resolve (promises);
    });
  }

  /**
   * @static width - Determines the real width of the Monogatari element, pretty
   * useful when dealing with canvas or other things that require specific measurements.
   *
   * @return {number} - Computed Width of the element
   */
  static width () {
    return this.element().width();
  }

  /**
   * @static height - Determines the real height of the Monogatari element, pretty
   * useful when dealing with canvas or other things that require specific measurements.
   *
   * @return {number} - Computed Width of the element
   */
  static height () {
    return this.element().height();
  }

  /**
   * @static debug - If the Monogatari debug file is present, this function
   * will give access to the debug tools that are a replacement for the console
   * log functions.
   *
   * @returns {Debug} - Proxy to the Artemis Debug Class
   */
  static get debug () {
    return new Proxy (Debug, {
      apply (target, receiver, args) {
        if (typeof MonogatariDebug === 'object') {
          return Reflect.apply (target, receiver, args);
        }
      }
    });
  }

  static set debug (_) {
    throw new Error ('Debug reference cannot be overriden.');
  }

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
  static string (key: string): string | undefined {
    const language = this.preference ('Language') as string;
    if (typeof this._translations[language] !== 'undefined') {
      if (typeof this._translations[language][key] !== 'undefined') {
        return this._translations[language][key];
      } else {
        FancyError.show ('engine:translation:key_not_found', {
          key: key,
          language: language,
          elements: $_(`[data-string="${key}"]`).collection,
          availableStrings: Object.keys (this._translations[language])
        });
      }
    } else {
      FancyError.show ('engine:translation:language_not_found', {
        language: language,
        availableLanguages: Object.keys (this._translations),
        languageSelectorValue: `<pre><code class='language-markup'>${$_('[data-action="set-language"]').value ()}</code></pre>`
      });
    }
  }

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
  static history<K extends keyof HistoryMap>(object?: K | Partial<HistoryMap> | null): HistoryMap | HistoryMap[K] | void {
    if (object !== null && object !== undefined) {
      if (typeof object === 'string') {
        if (typeof this._history[object] === 'undefined') {
          (this._history as Record<string, unknown[]>)[object] = [];
        }
        return this._history[object];
      } else {
        this._history = Object.assign({}, this._history, object) as HistoryMap;
      }
    } else {
      return this._history;
    }
  }

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
  static state<K extends keyof StateMap>(object?: K | Partial<StateMap>): StateMap | StateMap[K] {
    if (typeof object === 'string') {
      return this._state[object];
    }

    if (typeof object === 'object' && object !== null) {
      const oldState = Object.assign({}, this._state);
      const newState = merge(this._state, object);

      this.trigger('willUpdateState', {
        oldState,
        newState
      });

      this._state = newState;

      this.trigger('didUpdateState', {
        oldState,
        newState: this._state
      });
    }

    return this._state;
  }

  /**
   * @static registerAction - Register an Action to the actions list. All actions
   * should be registered before calling the init () method so their Mounting
   * cycle is done correctly.
   *
   * @param  {Action} action - Action to register. Remember each action must
   * have an unique ID.
   */
  static registerAction (action: StaticAction, naturalPosition = false) {
    action.engine = this.asEngine();

    if (naturalPosition) {
      this._actions.push (action);
    } else {
      this._actions.unshift (action);
    }
  }

  /**
   * @static unregisterAction - Removes an action from the actions list. Any
   * action you want to remove should be removed before calling the init ()
   * method so that their Mounting cycle is not executed.
   *
   * @param  {string} action - ID of the Action to unregister. Remember each action must
   * have an unique ID.
   */
  static unregisterAction (action: string) {
    this._actions = this._actions.filter ((a) => a.id.toLowerCase () !== action.toLowerCase ());
  }

  /**
   * @static actions - Returns the list of registered Actions.
   *
   * @return {Action[]} - List of registered Actions
   */
  static actions () {
    /** @type {boolean} */
    const experimentalFeatures = this.setting ('ExperimentalFeatures');

    return this._actions.filter(action => {
      return action._experimental === false || experimentalFeatures === true;
    });
  }

  /**
   * @static action - Access to an specific action class
   *
   * @param  {string} id - ID of the action you want to access to.
   * @return {Action} - Returns the action that matches the given ID
   */
  static action (id: string): StaticAction | undefined {
    return this._actions.find ((a) => a.id.toLowerCase () === id.toLowerCase ());
  }

  /**
   * @static registerComponent - Register a Component to the components list.
   * All components should be registered before calling the init () method so
   * their Mounting cycle is done correctly.
   *
   * @param  {Component} component - Component to register. Remember each
   * component must have an unique ID.
   */
  static registerComponent (component: StaticComponent) {
    const alreadyRegistered = this.components ().findIndex (c => c.tag === component.tag) > -1;

    if (typeof window.customElements.get (component.tag) !== 'undefined') {
      FancyError.show ('engine:component:already_registered', {
        tag: component.tag,
        component: component,
        unregisterCode: `<pre><code class='language-javascript'>monogatari.unregisterComponent ('${component.tag}')</code></pre>`
      });
    }

    component.engine = this.asEngine();

    if (alreadyRegistered && !this.global ('_didSetup')) {
      // Remove the previous one
      this.unregisterComponent (component.tag);
    } else if (!alreadyRegistered && this.global ('_didSetup')) {
      Registry.register(component.tag, component);
    }

    this._components.push (component);
  }

  /**
   * @static unregisterComponent - Removes a component from the components list.
   * Any component you want to remove should be removed before calling the
   * init () method so that their Mounting cycle is not executed.
   *
   * @param  {string} component - ID of the Component to unregister. Remember
   * each component must have an unique ID.
   */
  static unregisterComponent (component: string) {
    if (!this.global ('_didSetup')) {
      this._components = this.components ().filter ((c) => c.tag.toLowerCase() !== component.toLowerCase());
    } else {
      FancyError.show ('engine:component:unregister_after_setup', {
        component: component
      });
    }
  }

  /**
   * @static components - Returns the list of registered Components.
   *
   * @return {Component[]} - List of registered Components
   */
  static components (): StaticComponent[] {
    /** @type {boolean} */
    const experimentalFeatures = this.setting ('ExperimentalFeatures');

    return this._components.filter(component => {
      return component._experimental === false || experimentalFeatures === true;
    });
  }

  /**
   * @static component - Access to an specific component class
   *
   * @param {string} id - ID of the component you want to access to.
   *
   * @return {Component} - Returns the component class that matches the ID
   */
  static component (id: string) {
    const normalizedId = id.toLowerCase ();

    return this.components ().find ((c) => c.tag === normalizedId);
  }

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
  static assets (type: string | null = null, object: Record<string, string> | null = null): Record<string, Record<string, string>> | Record<string, string> | undefined {
    if (type !== null && object !== null) {
      if (typeof this._assets[type] !== 'undefined') {
        this._assets[type] = Object.assign ({}, this._assets[type], object);
      } else {
        this._assets[type] = object;
      }
    } else if (type !== null) {
      if (typeof type === 'string') {
        return this._assets[type];
      } else if (typeof type === 'object') {
        this._assets = Object.assign ({}, this._assets, object);
      }
    } else {
      return this._assets;
    }
  }

  /**
   * @static asset - Simple function to modify and access an specific asset
   * given its type and name
   *
   * @param  {string} type - The type of asset you are referring to
   * @param  {Object} name - The name or identifier of the asset you are trying
   * to access
   * @param  {Object} [value = null] - The key/value object to assign to that
   * asset type
   *
   * @return {Object} - If this function is called with no arguments, the whole
   * assets object will be returned.
   */
  static asset (type: string, name: string, value: string | null = null) {
    if (typeof this._assets[type] !== 'undefined') {
      if (value !== null) {
        this._assets[type][name] = value;
      } else {
        return this._assets[type][name];
      }
    } else {
      console.error (`Tried to interact with a non-existing asset type ${type}.`);
    }
  }

  /**
   * Get or set a cached AudioBuffer
   * @param key - Cache key (e.g., 'music/theme')
   * @param buffer - AudioBuffer to cache (if setting)
   * @returns The cached AudioBuffer if getting, undefined otherwise
   */
  static audioBufferCache(key: string): AudioBuffer | undefined;
  static audioBufferCache(key: string, buffer: AudioBuffer): void;
  static audioBufferCache(key?: string, buffer?: AudioBuffer): AudioBuffer | undefined | void {
    if (buffer !== undefined && key !== undefined) {
      this._audioBufferCache.set(key, buffer);
    } else if (key !== undefined) {
      return this._audioBufferCache.get(key);
    }
    return undefined;
  }

  /**
   * Remove an AudioBuffer from the cache
   * @param key - Cache key to remove
   * @returns true if the key existed and was removed
   */
  static audioBufferUncache(key: string): boolean {
    return this._audioBufferCache.delete(key);
  }

  /**
   * Clear AudioBuffer cache, optionally filtered by prefix
   * @param pattern - If provided, only clear keys starting with this pattern
   */
  static audioBufferClearCache(pattern?: string): void {
    if (!pattern) {
      this._audioBufferCache.clear();
    } else {
      for (const key of this._audioBufferCache.keys()) {
        if (key.startsWith(pattern)) {
          this._audioBufferCache.delete(key);
        }
      }
    }
  }

  /**
   * Get or set a cached HTMLImageElement
   * @param key - Cache key (e.g., 'scenes/forest')
   * @param image - HTMLImageElement to cache (if setting)
   * @returns The cached HTMLImageElement if getting, undefined otherwise
   */
  static imageCache(key: string): HTMLImageElement | undefined;
  static imageCache(key: string, image: HTMLImageElement): void;
  static imageCache(key?: string, image?: HTMLImageElement): HTMLImageElement | undefined | void {
    if (image !== undefined && key !== undefined) {
      this._imageCache.set(key, image);
    } else if (key !== undefined) {
      return this._imageCache.get(key);
    }
    return undefined;
  }

  /**
   * Remove an HTMLImageElement from the cache
   * @param key - Cache key to remove
   * @returns true if the key existed and was removed
   */
  static imageUncache(key: string): boolean {
    return this._imageCache.delete(key);
  }

  /**
   * Clear image cache, optionally filtered by prefix
   * @param pattern - If provided, only clear keys starting with this pattern
   */
  static imageClearCache(pattern?: string): void {
    if (!pattern) {
      this._imageCache.clear();
    } else {
      for (const key of this._imageCache.keys()) {
        if (key.startsWith(pattern)) {
          this._imageCache.delete(key);
        }
      }
    }
  }

  /**
   * Clear all asset caches (audio and image)
   */
  static clearAllCaches(): void {
    this._audioBufferCache.clear();
    this._imageCache.clear();
  }

  // =========================================================================
  // Service Worker Communication
  // =========================================================================

  /**
   * Send a message to the service worker and wait for response
   * @param message - Message to send
   * @returns Promise resolving to the response
   */
  private static sendServiceWorkerMessage<T>(message: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker?.controller) {
        reject(new Error('Service worker not available'));
        return;
      }

      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data as T);
      };

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);

      // Timeout after 10 seconds
      setTimeout(() => {
        reject(new Error('Service worker message timeout'));
      }, 10000);
    });
  }

  /**
   * Request the service worker to cache specified asset URLs
   * @param urls - Array of URLs to cache
   * @returns Promise resolving to cache result
   */
  static async cacheInServiceWorker(urls: string[]): Promise<{ success: boolean; cached?: number; total?: number; error?: string }> {
    try {
      return await this.sendServiceWorkerMessage<{ success: boolean; cached?: number; total?: number; error?: string }>({
        type: 'CACHE_ASSETS',
        data: { urls }
      });
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Check if an asset URL is cached in the service worker
   * @param url - URL to check
   * @returns Promise resolving to whether the URL is cached
   */
  static async isInServiceWorkerCache(url: string): Promise<boolean> {
    try {
      const result = await this.sendServiceWorkerMessage<{ cached: boolean }>({
        type: 'CHECK_CACHE',
        data: { url }
      });
      return result.cached;
    } catch {
      return false;
    }
  }

  /**
   * Get cached raw data from service worker (for decoding)
   * @param url - URL of the cached asset
   * @returns Promise resolving to ArrayBuffer if found, undefined otherwise
   */
  static async getFromServiceWorkerCache(url: string): Promise<ArrayBuffer | undefined> {
    try {
      const result = await this.sendServiceWorkerMessage<{ found: boolean; data?: ArrayBuffer }>({
        type: 'GET_CACHED',
        data: { url }
      });
      return result.found ? result.data : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Serialized AudioBuffer format for IndexedDB storage
   */
  static serializeAudioBuffer(buffer: AudioBuffer): {
    channels: Float32Array[];
    sampleRate: number;
    length: number;
    numberOfChannels: number;
  } {
    const channels: Float32Array[] = [];
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      // Create a copy of the channel data
      channels.push(new Float32Array(buffer.getChannelData(i)));
    }
    return {
      channels,
      sampleRate: buffer.sampleRate,
      length: buffer.length,
      numberOfChannels: buffer.numberOfChannels
    };
  }

  /**
   * Reconstruct an AudioBuffer from serialized data
   * This is much faster than re-decoding from raw audio file
   */
  static deserializeAudioBuffer(
    data: { channels: ArrayLike<number>[]; sampleRate: number; length: number; numberOfChannels: number },
    audioContext: AudioContext
  ): AudioBuffer {
    const buffer = audioContext.createBuffer(
      data.numberOfChannels,
      data.length,
      data.sampleRate
    );
    for (let i = 0; i < data.numberOfChannels; i++) {
      // Create a new Float32Array from the stored data to ensure correct type
      const channelData = new Float32Array(data.channels[i]);
      buffer.copyToChannel(channelData, i);
    }
    return buffer;
  }

  /**
   * Get the persistent audio buffer Space instance (IndexedDB)
   * Lazily initialized on first access. Returns null if IndexedDB is unavailable.
   */
  static async audioBufferSpace(): Promise<Space | null> {
    // If we already know IndexedDB isn't available, skip
    if (this._indexedDBAvailable === false) {
      return null;
    }

    if (!this._audioBufferSpace) {
      try {
        this._audioBufferSpace = new Space(SpaceAdapter.IndexedDB, {
          name: `${Text.friendly(this.setting('Name') as string)}_AudioCache`,
          version: '1',
          store: 'decodedAudio'
        } as ConstructorParameters<typeof Space>[1]);
        await this._audioBufferSpace.open();
        this._indexedDBAvailable = true;
      } catch (error) {
        console.warn('IndexedDB not available for audio caching. Audio will still work but won\'t persist across sessions:', error);
        this._indexedDBAvailable = false;
        return null;
      }
    }
    return this._audioBufferSpace;
  }

  /**
   * Check if IndexedDB is available for audio caching
   * @returns true if available, false if not, null if not yet checked
   */
  static isIndexedDBAvailable(): boolean | null {
    return this._indexedDBAvailable;
  }

  /**
   * Store a decoded AudioBuffer in persistent storage (IndexedDB)
   * @param key - Cache key (e.g., 'music/theme')
   * @param buffer - AudioBuffer to store
   */
  static async storeAudioBufferPersistent(key: string, buffer: AudioBuffer): Promise<void> {
    const space = await this.audioBufferSpace();
    if (!space) {
      return; // IndexedDB not available, silently skip
    }

    try {
      const serialized = this.serializeAudioBuffer(buffer);
      await space.set(key, serialized);
    } catch (error) {
      console.warn('Failed to store audio buffer in IndexedDB:', error);
    }
  }

  /**
   * Retrieve a decoded AudioBuffer from persistent storage (IndexedDB)
   * @param key - Cache key (e.g., 'music/theme')
   * @returns The AudioBuffer if found, undefined otherwise
   */
  static async getAudioBufferPersistent(key: string): Promise<AudioBuffer | undefined> {
    const space = await this.audioBufferSpace();
    if (!space) {
      return undefined; // IndexedDB not available
    }

    try {
      const data = await space.get(key) as { channels: Float32Array[]; sampleRate: number; length: number; numberOfChannels: number } | undefined;
      if (data && data.channels && this.audioContext) {
        return this.deserializeAudioBuffer(data, this.audioContext);
      }
    } catch (error) {
      console.warn('Failed to retrieve audio buffer from IndexedDB:', error);
    }
    return undefined;
  }

  /**
   * Remove an AudioBuffer from persistent storage (IndexedDB)
   * @param key - Cache key to remove
   */
  static async removeAudioBufferPersistent(key: string): Promise<void> {
    const space = await this.audioBufferSpace();
    if (!space) {
      return; // IndexedDB not available
    }

    try {
      await space.remove(key);
    } catch (error) {
      console.warn('Failed to remove audio buffer from IndexedDB:', error);
    }
  }

  /**
   * Clear all AudioBuffers from persistent storage (IndexedDB)
   */
  static async clearAudioBufferPersistent(): Promise<void> {
    const space = await this.audioBufferSpace();
    if (!space) {
      return; // IndexedDB not available
    }

    try {
      await space.clear();
    } catch (error) {
      console.warn('Failed to clear audio buffers from IndexedDB:', error);
    }
  }

  static characters (object: Record<string, Character> | null = null): Record<string, Character> {
    if (object !== null) {
      // const identifiers = Object.keys (object);
      // for (const id of identifiers) {
      // 	this.character (id, object[id]);
      // }
      this._characters = merge (this._characters, object) as Record<string, Character>;
    }
    return this._characters;
  }

  static character (id: string, object: Partial<Character> | null = null): Character | undefined {
    if (object !== null) {
      if (typeof this._characters[id] !== 'undefined') {
        this._characters[id] = merge (this._characters[id], object) as Character;
      } else {
        this._characters[id] = object as Character;
      }
    } else {
      const character = this._characters[id];

      // Translate the old character properties into the new ones
      if (typeof character !== 'undefined') {
        if (typeof character.Images === 'object') {
          character.sprites = merge ({}, character.Images);
          delete character.Images;
        }

        if (typeof character.Directory === 'string') {
          character.directory = character.Directory;
          delete character.Directory;
        }

        if (typeof character.Color === 'string') {
          character.color = character.Color;
          delete character.Color;
        }

        if (typeof character.Name === 'string') {
          character.name = character.Name;
          delete character.Name;
        }

        if (typeof character.Face === 'string') {
          character.default_expression = character.Face;
          delete character.Face;
        }

        if (typeof character.Side === 'object') {
          character.expressions = character.Side;
          delete character.Side;
        }

        if (typeof character.TypeAnimation === 'boolean') {
          character.type_animation = character.TypeAnimation;
          delete character.TypeAnimation;
        }
      }

      return character;
    }
  }

  static languageMetadata (language: string, object: { code?: string; icon?: string } | null = null): { code: string; icon: string } | Record<string, { code: string; icon: string }> | undefined {
    if (typeof language !== 'undefined') {
      if (object !== null) {
        if (typeof this._languageMetadata[language] !== 'object') {
          this._languageMetadata[language] = { code: '', icon: '' };
        }
        this._languageMetadata[language] = Object.assign ({}, this._languageMetadata[language], object) as { code: string; icon: string };
      }
      return this._languageMetadata[language];
    }
    return this._languageMetadata;
  }

  static translations (object: string | Record<string, Record<string, string>> | null = null): Record<string, string> | Record<string, Record<string, string>> | undefined {
    if (object !== null) {
      if (typeof object === 'string') {
        return this._translations[object];
      } else {
        this._translations = Object.assign ({}, this._translations, object);
      }
    } else {
      return this._translations;
    }
  }

  static translation (language: string, strings?: Record<string, string>): Record<string, string> {
    if (typeof strings !== 'undefined') {
      if (typeof this._translations[language] !== 'undefined') {
        this._translations[language] = Object.assign ({}, this._translations[language], strings);
      } else {
        this._translations[language] = strings;
      }
    }

    return this._translations[language];
  }

  /**
   * Get a setting value by key
   */
  static setting<K extends keyof GameSettings>(key: K): GameSettings[K];
  /**
   * Set a setting value by key
   */
  static setting<K extends keyof GameSettings>(key: K, value: GameSettings[K]): GameSettings[K];
  static setting<K extends keyof GameSettings>(key: K, value?: GameSettings[K] | null): GameSettings[K] {
    if (value !== undefined && value !== null) {
      this._settings[key] = value;
      return this._settings[key];
    }

    if (typeof this._settings[key] !== 'undefined') {
      return this._settings[key];
    }

    throw new Error(`Tried to access non existent setting with name '${key}'.`);
  }

  static settings (object: Partial<GameSettings> | null = null): GameSettings {
    if (object !== null) {
      this._settings = merge (this._settings, object);
    }

    return this._settings;
  }

  /**
   * Get a preference value by key
   */
  static preference<K extends keyof PlayerPreferences>(key: K): PlayerPreferences[K];
  /**
   * Set a preference value by key
   */
  static preference<K extends keyof PlayerPreferences>(key: K, value: PlayerPreferences[K]): PlayerPreferences[K];
  static preference<K extends keyof PlayerPreferences>(key: K, value?: PlayerPreferences[K] | null): PlayerPreferences[K] {
    if (value !== undefined && value !== null) {
      this._preferences[key] = value;
      this.Storage.update('Settings', this._preferences);

      return this._preferences[key];
    }

    if (typeof this._preferences[key] !== 'undefined') {
      return this._preferences[key];
    }

    throw new Error(`Tried to access non existent preference with name '${key}'.`);
  }

  static preferences (object: Partial<PlayerPreferences> | null = null, save = false): PlayerPreferences {
    if (object !== null) {

      this._preferences = merge (this._preferences, object);

      const storageConfig = this.Storage.configuration ();

      if (!storageConfig || storageConfig.name === '') {
        this.setupStorage ();
      }

      if (save === true) {
        this.Storage.update ('Settings', this._preferences);
      }
    }

    return this._preferences;
  }

  /**
   * Get or set the configuration.
   *
   * @param {string|object} key
   * @param {object} object
   */
  static configuration (key?: string | Record<string, unknown>, object?: Record<string, unknown>): unknown {
    if (typeof key === 'string') {
      if (typeof object !== 'undefined') {
        this.trigger ('configurationElementWillUpdate');

        this.trigger (`configurationElementUpdate::${key}`, {
          newConfiguration: object,
          oldConfiguration: this._configuration[key]
        });

        if (typeof this._configuration[key] !== 'object' || this._configuration[key] === null) {
          this._configuration[key] = {};
        }

        this._configuration[key] = merge (this._configuration[key] as object, object);

        this.trigger ('configurationElementDidUpdate');
      }
      return this._configuration[key];
    } else if (typeof key === 'object') {
      this.trigger ('configurationWillUpdate');
      this._configuration = merge (this._configuration, object ?? {});
      this.trigger ('configurationDidUpdate');
      return this._configuration;
    } else if (typeof key === 'undefined') {
      return this._configuration;
    }
  }

  static storage (object: string | Record<string, unknown> | null = null): unknown {
    if (object !== null) {
      if (typeof object === 'string') {
        return this._storage[object];
      } else {
        this._storage = merge (this._storage, object) as Record<string, unknown>;
      }
    } else {
      return this._storage;
    }
  }

  static script (object: string | Record<string, unknown> | null = null): unknown {
    const language = this.preference ('Language') as string;

    if (typeof object === 'object' && object !== null) {
      this._script = Object.assign ({}, this._script, object);
    } else {
      let script: Record<string, unknown> = this._script;

      if (this.setting ('MultiLanguage') === true) {
        if (!Object.keys (script).includes (language)) {
          // First check if the label exists in the current script
          FancyError.show ('engine:script:language_not_found', {
            language: language,
            multiLanguageSetting: 'The Multilanguage Setting is set to '+ this.setting ('MultiLanguage'),
            availableLanguages: Object.keys (script)
          });
        } else {
          script = script[language] as Record<string, unknown>;
        }
      }

      if (typeof object === 'string') {
        script = script[object] as Record<string, unknown>;
      }

      return script;
    }
  }

  static label (): unknown[];
  static label (key: string): unknown;
  static label (key: string, language: Record<string, unknown[]>): void;
  static label (key: string, language: string, value: unknown[]): void;
  static label (key: string | null = null, language: string | Record<string, unknown[]> | null = null, value: unknown[] | null = null): unknown {
    if (typeof language === 'string' && value !== null && key !== null) {
      if (typeof this._script[language] !== 'object') {
        this._script[language] = {};
      }
      (this._script[language] as Record<string, unknown>)[key] = value;
    } else if (typeof language === 'object' && language !== null && value === null && key !== null) {
      if (typeof this._script[key] !== 'object') {
        this._script[key] = [];
      }
      this._script[key] = language;
    } else if (typeof language === 'string' && value === null && key !== null) {
      return (this._script[language] as Record<string, unknown>)?.[key];
    } else if (key !== null) {
      return this.script (key);
    } else {
      const labelState = this.state ('label') as string;
      return this.script (labelState);
    }
  }

  static fn (name: string, { apply = () => true, revert = () => true }: { apply?: () => boolean; revert?: () => boolean } = {}): { apply: () => boolean; revert: () => boolean } {
    if (typeof apply === 'function' && typeof revert === 'function') {
      this._functions [name] = {
        apply,
        revert
      };
    }

    return this._functions [name];
  }

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
  static $ (name: string | Record<string, unknown> | undefined, value?: unknown): unknown {
    if (typeof name === 'string') {
      if (typeof value !== 'undefined') {
        this._$[name] = value;
      }

      return this._$[name];
    } else if (typeof name === 'object') {
      this._$ = Object.assign ({}, this._$, name);
    } else if (typeof name === 'undefined') {
      return this._$;
    }
  }

  static globals(): GlobalsMap;
  static globals(object: Partial<GlobalsMap>): GlobalsMap;
  static globals (object: Partial<GlobalsMap> | null = null) {
    if (object !== null) {
      this._globals = merge (this._globals, object);
    }

    return this._globals ?? {};
  }

  static global<K extends keyof GlobalsMap>(key: K): GlobalsMap[K];
  static global<K extends keyof GlobalsMap>(key: K, value: GlobalsMap[K]): GlobalsMap[K];
  static global (key: string, value?: unknown): unknown {
    if (typeof value !== 'undefined') {
      this._globals[key] = value;
    }

    return this._globals?.[key] ?? undefined;
  }

  static template (key: string, value?: unknown): unknown {
    if (typeof value !== 'undefined') {
      this._templates[key] = value;
    }

    return this._templates[key];
  }

  static mediaPlayers (key?: string, object = false) {
    if (typeof key === 'string') {
      if (object) {
        return this._mediaPlayers[key];
      }

      return Object.values (this._mediaPlayers[key]);
    }

    return this._mediaPlayers;
  }

  static mediaPlayer (type: string, key: string, value?: HTMLAudioElement | HTMLVideoElement | AudioPlayer): HTMLAudioElement | HTMLVideoElement | AudioPlayer | undefined {
    if (typeof value === 'undefined') {
      const players = this.mediaPlayers (type, true) as Record<string, HTMLAudioElement | HTMLVideoElement | AudioPlayer>;
      return players?.[key];
    } else {
      value.dataset.type = type;
      value.dataset.key = key;
      this._mediaPlayers[type][key] = value;
      return this._mediaPlayers[type][key];
    }
  }

  static removeMediaPlayer (type: string, key?: string): void {
    const players = this.mediaPlayers (type, true) as Record<string, HTMLAudioElement | HTMLVideoElement | AudioPlayer> | undefined;

    const cleanupPlayer = (player: HTMLAudioElement | HTMLVideoElement | AudioPlayer): void => {
      if (player instanceof AudioPlayer) {
        // Use AudioPlayer's destroy method which handles cleanup properly
        player.destroy();
      } else {
        // Handle HTMLAudioElement/HTMLVideoElement
        if (typeof player.pause === 'function') {
          player.pause();
        }
        if (typeof player.setAttribute === 'function') {
          player.setAttribute('src', '');
          player.currentTime = 0;
        }
      }
    };

    if (typeof key === 'undefined') {
      if (players) {
        for (const mediaKey of Object.keys(players)) {
          const player = this._mediaPlayers[type][mediaKey];
          if (player) {
            cleanupPlayer(player);
          }
          delete this._mediaPlayers[type][mediaKey];
        }
      }
    } else {
      if (typeof this._mediaPlayers[type]?.[key] !== 'undefined') {
        const player = this._mediaPlayers[type][key];
        if (player) {
          cleanupPlayer(player);
        }
        delete this._mediaPlayers[type][key];
      }
    }
  }

  static temp (key: string, value?: unknown): unknown {
    if (typeof value !== 'undefined') {
      this._temp[key] = value;
    } else {
      const value = this._temp[key];
      delete this._temp[key];
      return value;
    }
  }

  /**
   * Localize every element with a data-string property using the translations
   * available. If no translation is found for the current language, the current
   * text of the element will be kept.
   */
  static localize (): void {
    this.trigger ('willLocalize');

    // Setup the correct locale for the dates
    const language = this.preference ('Language') as string;
    const langMetadata = this._languageMetadata[language];
    if (langMetadata?.code) {
      Settings.defaultLocale = langMetadata.code;
    }

    this.element ().find ('[data-string]').each ((element) => {
      const stringKey = $_(element).data ('string');
      if (stringKey) {
        const string_translation = this.string (stringKey);

        // Check if the translation actually exists and is not empty before
        // replacing the text.
        if (typeof string_translation !== 'undefined' && string_translation !== '') {
          $_(element).text (string_translation);
        }
      }
    });
    this.trigger ('didLocalize');
  }

  /**
   * Preload game assets
   */
  static preload () {
    // Check if asset preloading is enabled. Preloading will not be done in
    // electron or cordova since the assets are expected to be available
    // locally.
    const preloadEnabled = this.setting ('Preload') && !Platform.electron && !Platform.cordova && location.protocol.indexOf ('file') < 0;

    if (!preloadEnabled) {
      return Promise.resolve ();
    }

    const promises: Promise<void>[] = [];

    this.trigger('willPreloadAssets');

    const assetsPath = this.setting('AssetsPath');

    // Check if Preload action has a 'default' block configured
    const preloadAction = this.action('Preload') as typeof PreloadAction | undefined;
    const blocks = preloadAction?.blocks?.();
    const defaultBlock = blocks?.['default'];

    if (defaultBlock && preloadAction) {
      // Use the registry-based preloading for the 'default' block
      for (const [category, assets] of Object.entries(defaultBlock)) {
        // Handle characters separately (nested structure)
        if (category === 'characters' && typeof assets === 'object' && !Array.isArray(assets)) {
          for (const [charId, sprites] of Object.entries(assets as Record<string, string[]>)) {
            const character = this.character(charId);
            if (!character) continue;

            let directory = character.directory ? `${character.directory}/` : '';
            directory = `${assetsPath.root}/${assetsPath.characters}/${directory}`;

            for (const spriteName of sprites) {
              const spriteFile = character.sprites?.[spriteName];
              if (!spriteFile || typeof spriteFile !== 'string') continue;

              const url = `${directory}${spriteFile}`;
              promises.push(
                Preload.image(url).then((img) => {
                  this.imageCache(`characters/${charId}/${spriteName}`, img);
                  this.trigger('assetLoaded', { name: spriteName, type: 'image', category: 'characters' });
                })
              );
              this.trigger('assetQueued');
            }
          }
          continue;
        }

        if (!Array.isArray(assets)) continue;

        // Use the Preload action's registry to determine how to load this category
        const loaderType = preloadAction.getLoaderType(category);
        if (!loaderType) {
          console.warn(`Preload: No loader registered for category "${category}" in default block`);
          continue;
        }

        const loaderConfig = preloadAction.getLoader(loaderType);
        if (!loaderConfig) {
          console.warn(`Preload: Loader type "${loaderType}" not found`);
          continue;
        }

        for (const assetName of assets) {
          const assetFile = (this.assets(category) as Record<string, string>)?.[assetName];
          if (!assetFile) continue;

          const url = `${assetsPath.root}/${assetsPath[category as keyof typeof assetsPath]}/${assetFile}`;
          const cacheKey = `${category}/${assetName}`;

          promises.push(
            loaderConfig.loader(url, this).then((asset: unknown) => {
              loaderConfig.cache.set(this, cacheKey, asset);
              this.trigger('assetLoaded', { name: assetName, type: loaderType, category });
            })
          );
          this.trigger('assetQueued');
        }
      }
    } else {
      // Fallback: Legacy preloading when no 'default' block is configured
      // This preloads ALL registered assets to browser cache (not decoded/cached for immediate use)
      const allAssets = this.assets() || {};

      // Iterate over every asset category: music, videos, scenes etc.
      for (const category of Object.keys(allAssets)) {
        // Iterate over every key on each category
        const categoryAssets = this.assets(category) || {};

        for (const asset of Object.values(categoryAssets)) {
          if (typeof asset !== 'string') {
            continue;
          }

          // Get the directory from where to load this asset
          const directory = `${assetsPath.root}/${assetsPath[category as keyof typeof assetsPath]}`;

          const onSuccess = (name: string, type: string, category: string) => {
            this.trigger('assetLoaded', { name, type, category });
          }

          if (FileSystem.isImage(asset)) {
            promises.push(Preload.image(`${directory}/${asset}`).then(() => onSuccess(asset, 'image', category)));
          } else {
            promises.push(Preload.file(`${directory}/${asset}`).then(() => onSuccess(asset, 'file', category)));
          }

          this.trigger('assetQueued');
        }
      }

      for (const key in this.characters()) {
        const character = this.character(key);
        if (!character) continue;

        let directory = '';

        // Check if the character has a directory defined where its images are located
        if (typeof character.directory !== 'undefined') {
          directory = character.directory + '/';
        }
        directory = `${assetsPath.root}/${assetsPath.characters}/${directory}`;

        if (typeof character.sprites !== 'undefined') {
          for (const image of Object.values(character.sprites)) {
            if (typeof image !== 'string') {
              continue;
            }
            promises.push(Preload.image(`${directory}${image}`).then(() => {
              this.trigger('assetLoaded', {
                name: image,
                type: 'image',
                category: 'characters'
              });
            }));
          }
        }

        if (typeof character.expressions !== 'undefined') {
          for (const image of Object.values(character.expressions)) {
            if (typeof image !== 'string') {
              continue;
            }
            promises.push(Preload.image(`${directory}${image}`).then(() => {
              this.trigger('assetLoaded', {
                name: image,
                type: 'image',
                category: 'characters'
              });
            }));
          }
        }

        if (typeof character.default_expression === 'string') {
          promises.push(Preload.image(`${directory}${character.default_expression}`).then(() => {
            this.trigger('assetLoaded', {
              name: character.default_expression as string,
              type: 'image',
              category: 'characters'
            });
          }));
        }

        if (typeof character.layer_assets === 'object' && character.layer_assets) {
          for (const [_layer, obj] of Object.entries(character.layer_assets)) {
            for (const [assetKey, value] of Object.entries(obj)) {
              promises.push(Preload.image(`${directory}${value}`).then(() => {
                this.trigger('assetLoaded', {
                  name: assetKey,
                  type: 'image',
                  category: 'characters'
                });
              }));
            }
          }
        }

        this.trigger('assetQueued');
      }
    }

    return Promise.all (promises).then (() => {
      this.trigger ('didPreloadAssets');
      return Promise.resolve ();
    });
  }

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
  static translate (statement: string): string {
    // Find all elements in the string that match the "_(key)" format
    const matches = statement.match (/_\(\S+\)/g);
    const language = this.preference ('Language') as string;

    // Check if any matches were found, if not then no translation is needed
    if (matches === null) {
      return statement;
    }

    // Go through all the found matches so we can get the string it maps to
    for (const match of matches) {
      // Remove the _() from the key
      const path = match.replace ('_(', '').replace (')', '').split ('.');

      // Retrieve the string from the translations using the given key
      const translations = this.translations (language) as Record<string, unknown> | undefined;
      if (!translations) continue;

      let data: unknown = translations[path[0]];

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
   * @static replaceVariables - Recursively replace all occurrences of
   * {{variable_name}} with the actual value for that variable name on the
   * storage object.
   *
   * @param {string} statement - The text where to interpolate the variables
   *
   * @returns {string} - The text with the interpolated variables
   */
  static replaceVariables (statement: string): string {
    statement = this.translate (statement);
    const matches = statement.match (/{{\S+?}}/g);
    if (matches !== null) {
      for (const match of matches) {
        const path = match.replace ('{{', '').replace ('}}', '').split ('.');

        let data: unknown = this.storage ();

        for (let j = 0; j < path.length; j++) {
          const name = path[j];
          if (typeof data === 'object' && data !== null && name in data) {
            data = (data as Record<string, unknown>)[name];
          } else {
            FancyError.show ('engine:storage:variable_not_found', {
              variable: match,
              statement: statement,
              partNotFound: name,
              availableVariables: typeof data === 'object' && data !== null ? Object.keys (data) : []
            });
            return '';
          }
        }
        statement = statement.replace (match, String(data));
      }
      return this.replaceVariables (statement);
    }
    return statement;
  }

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
  static async saveTo (prefix = 'SaveLabel', id: number | null = null, name: string | null = null): Promise<unknown> {
    // Check if the player is actually playing
    if (!this.global ('playing')) {
      return;
    }

    const now = DateTime.now();
    const date = now.toISO();
    const timestamp = now.toMillis();
    const gameData = this.object();

    if (name === null || name.trim () === '') {
      name = date;
    }

    let image = '';

    const backgroundState = this.state ('background');
    const sceneState = this.state ('scene');

    if (backgroundState) {
      image = backgroundState.split (' ')[2];
    } else if (sceneState) {
      image = sceneState.split (' ')[2];
    }

    const response = await this.Storage.set (`${this.setting (prefix)}_${id || timestamp}`, {
      name,
      date,
      image,
      game: gameData
    });

    if (response instanceof Response) {
      return Promise.resolve (response.json ());
    }

    return Promise.resolve (response);
  }

  /**
   * @static assertAsync - This function will run any function asynchronously
   * regardless of if the function to be run is async or not.
   *
   * @param {function} callable - The function to run
   * @param {Object} [self=null] - The reference to `this` in the function
   * @param {any[]} [args=null] - The arguments with which to call the function
   *
   * @returns {Promise} - Resolves if the function returned true and rejects if
   * the function returned false.
   */
  static assertAsync (callable: (...args: unknown[]) => unknown, self: unknown = null, args: unknown[] | null = null): Promise<void> {
    const originalBlockValue = this.global ('block');

    this.global ('block', true);
    return new Promise<void> ((resolve, reject) => {
      const result = callable.apply(self, args || []);
      // Check if the function returned a simple boolean
      // if the return value is true, the game will continue
      if (typeof result === 'boolean') {
        if (result) {
          resolve ();
        } else {
          reject ();
        }
      } else if (result !== null && typeof result === 'object') {
        // Check if the result was a promise
        if ('then' in result && typeof result.then === 'function') {
          (result as Promise<unknown>).then((value: unknown) => {
            if (typeof value === 'boolean') {
              if (value) {
                resolve ();
              } else {
                reject ();
              }
            } else {
              resolve ();
            }
          }).catch(reject);
        } else {
          resolve ();
        }
      } else {
        reject ();
      }
    }).finally (() => {
      this.global ('block', originalBlockValue);
    });
  }

  /**
   * @static next - Advance to the next statement on the script
   *
   * @returns {void}
   */
  static next (): Promise<void> {
    // Advance 1 step
    const currentStep = this.state ('step');

    this.state ({ step: currentStep + 1 });

    const label = this.label ();
    const step = this.state ('step');

    return new Promise<void> ((resolve) => {
      // Clear the Stack using a Time Out instead of calling the function
      // directly, preventing an Overflow
      setTimeout (() => {
        this.run.call (Monogatari, label[step]).then (() => {
          this.global ('_engine_block', false);
          resolve ();
        }).catch (() => {
          resolve ();
        });
      }, 0);
    });
  }

  /**
   * @static revert - Revert to the previous statement on the script
   *
   * @returns {void}
   */
  static previous (): Promise<void> {
    return new Promise<void> ((resolve) => {
      setTimeout (() => {
        this.revert.call (Monogatari).then (() => {
          this.global ('_engine_block', false);
          resolve ();
        }).catch ((e) => {
          this.debug.log ('Revert was prevented.\n', e);
          this.global ('_engine_block', false);
          // The game could not be reverted, either because an
          // action prevented it or because there are no statements
          // left to revert to.
          const currentStep = this.state ('step') as number;
          if (currentStep > 0) {
            this.state ({
              step: currentStep - 1
            });
          }

          this.proceed ({ userInitiated: false, skip: false, autoPlay: false }).then (() => {
            resolve ();
          });
        });
      }, 0);
    });
  }

  static resetGame (): Promise<unknown[]> {
    // Stop autoplay
    this.autoPlay (false);

    const skipSetting = this.setting ('Skip');
    if (skipSetting > 0) {
      this.skip (false);
    }

    // Reset Storage
    const storageStructure = this.global ('storageStructure');
    this.storage (JSON.parse(storageStructure));

    // Reset Conditions
    this.state ({
      step: 0,
      label: this.setting ('Label')
    });

    this.global ('block', false);

    // Reset History
    for (const history of Object.keys (this._history)) {
      this._history[history] = [];
    }

    // Run the reset method of all the actions so each of them can reset
    // their own elements correctly
    const promises: Promise<unknown>[] = [];

    for (const action of this.actions ()) {
      promises.push (action.reset ());
    }

    for (const component of this.components ()) {
      promises.push (component.onReset ());
    }

    return Promise.all (promises);
  }

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
  static keyboardShortcut (shortcut: string | string[], callback: (this: VisualNovelEngine, event: KeyboardEvent, element: DOM) => void): void {
    this.debug.log (`Binding Keyboard Shortcut: ${shortcut}`);
    mousetrap.bind (shortcut, (event: ExtendedKeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && target.tagName?.toLowerCase () !== 'input') {
        event.preventDefault ();
        callback.apply (this, [event, $_(target)]);
      }
    });
  }

  static upgrade (oldVersion: string, newVersion: string, callbacks: { storage?: (oldData: unknown) => unknown }): void {
    this._upgrade[`${oldVersion}::${newVersion}`] = callbacks;
  }

  static setupStorage (): void {
    // Check if an Adapter has been set or else, the global local storage
    // object will be used
    const storageSetting = this.setting ('Storage');

    if (storageSetting.Adapter.trim () !== '') {
      let adapter;
      const props: Record<string, unknown> = {};

      switch (storageSetting.Adapter) {
        case 'LocalStorage':
          adapter = SpaceAdapter.LocalStorage;
          break;

        case 'SessionStorage':
          adapter = SpaceAdapter.SessionStorage;
          break;

        case 'IndexedDB':
          adapter = SpaceAdapter.IndexedDB;
          props.keyPath = 'id';
          break;

        case 'RemoteStorage':
          adapter = SpaceAdapter.RemoteStorage;
          props.headers = {
            'Content-Type': 'application/json',
          };
          break;

        default:
          adapter = SpaceAdapter.LocalStorage;
          break;
      }

      if (window.navigator && !Platform.electron && !Platform.cordova) {
        if (window.navigator.storage && window.navigator.storage.persist) {
          window.navigator.storage.persist ().then ((persisted) => {
            if (persisted !== true) {
              console.warn ('Persistent Storage permission has been denied. When your device gets low on storage, it may choose to delete your game files.');
            }
          }).catch ((error) => {
            console.error (error);
          });
        }
      }

      this.Storage = new Space (adapter, {
        name: Text.friendly (this.setting ('Name') as string),
        version: this.setting ('Version') as string,
        store: storageSetting.Store,
        endpoint: storageSetting.Endpoint,
        props,
      } as ConstructorParameters<typeof Space>[1]);
    }

    // Setup all the upgrade functions
    for (const upgrade of Object.keys (this._upgrade)) {
      const [oldVersion, newVersion] = upgrade.split ('::');
      const callback = this._upgrade[upgrade]?.storage;

      if (callback) {
        // Note: The Monogatari upgrade callback has a different signature than Space expects
        // We wrap it to match the expected signature
        this.Storage.upgrade (oldVersion, newVersion, async () => {
          // This is a simplified wrapper - actual implementation may need data passing
          callback({});
        });
      }
    }
  }

  static registerListener (name: string, listener: { keys?: string | string[]; callback: (this: VisualNovelEngine, event: Event, element: DOM) => unknown }, replace = false): void {
    const listenerWithName = { ...listener, name };
    if (replace === true) {
      const index = this._listeners.findIndex (l => l.name === name);

      if (index > -1) {
        this._listeners[index] = listenerWithName;
        return;
      }
    }

    // If a listener is registered post-bind, we want to register the keyboard
    // shortcut as well or else it will not happen automatically
    if (this.global ('_didBind') === true && listenerWithName.keys) {
      this.keyboardShortcut (listenerWithName.keys, listenerWithName.callback);
    }

    this._listeners.push (listenerWithName);
  }

  static unregisterListener (name: string): void {
    const listener = this._listeners.find((l) => l.name.toLowerCase () === name.toLowerCase ());

    if (listener) {
      if (listener.keys) {
        this.debug.log (`Unbinding Keys: ${listener.keys}`);
        mousetrap.unbind (listener.keys as string | string[]);
      }
      this._listeners = this._listeners.filter((l) => l.name.toLowerCase () !== name.toLowerCase ());
    }
  }

  static async runListener (name: string, event: Event | null = null, element: DOM | null = null): Promise<void> {
    const promises: Promise<void>[] = [];
    let actionName = name;

    // Check if the click event happened on a path of an icon.
    // This fixes a bug with font-awesome icons being clicked but the
    // click being registered at an inner path instead of the svg element
    // that holds the data information
    if (element) {
      if (element.matches ('path')) {
        element = element.closest ('[data-action]');

        if (element.length > 0) {
          actionName = element.data ('action') || name;
        }
      }
    }

    for (const listener of this._listeners) {
      if (listener.name === actionName) {

        promises.push (Util.callAsync(listener.callback as Callable<unknown>, this, event, element).then ((data) => {
          if (data) {
            return Promise.resolve ();
          }
          return Promise.reject ();
        }));
        this.debug.debug ('Running Listener', actionName);
      }
    }

    Promise.all (promises).catch ((e) => {
      if (event) {
        event.stopImmediatePropagation ();
        event.stopPropagation ();
        event.preventDefault ();
      }
      this.debug.debug ('Listener Event Propagation Stopped', e);
    });
  }

  /**
   * @static object - Get all the relevant information of the game state
   *
   * @returns {Object} - An object containing the current histories, state and
   * storage variables.
   * @returns {Object} history - The full history object
   * @returns {Object} state - The full state object
   * @returns {Object} storage- The full storage object
   */
  static object () {
    return {
      history: this.history (),
      state: this.state (),
      storage: this.storage ()
    };
  }

  static prepareAction(statement: string, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
  static prepareAction(statement: Record<string, unknown>, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
  static prepareAction(statement: string | Record<string, unknown>, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
  static prepareAction (statement: unknown, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null {
    let action;
    let interpolatedStatement: string[] | undefined;

    // Use the correct matching function (matchString or matchObject)
    // depending on the type of the current statement. If the statement
    // is a pure js function, it won't be reverted since we don't
    // know what to do to revert it.
    if (typeof statement === 'string') {
      interpolatedStatement = this.replaceVariables (statement).split (' ');

      // Check if it matches using the matchString method
      action = this.actions ().find (a => a.matchString (interpolatedStatement!));
    } else if (typeof statement === 'object' && statement !== null) {

      // Check if it matches using the matchObject method
      action = this.actions ().find (a => a.matchObject (statement as Record<string, unknown>));
    }

    if (typeof action !== 'undefined') {
      const act = new action (typeof statement === 'string' ? interpolatedStatement : statement);

      // The original statement is set just in case the action needs
      // access to it. By this point, statement is known to be string | Record<string, unknown>
      // (functions are handled earlier and returned directly).
      act._setStatement (statement as string | Record<string, unknown>);

      // The current cycle is also set just in case the action needs to
      // know what cycle it's currently being performed.
      act._setCycle (cycle);

      // Monogatari is set as the context of the action so that it can
      // access all its functionalities
      act.setContext (this.asEngine());

      act.setExtras(extras || {});

      return act;
    }

    return null;
  }

  /**
   * @static revert - This is the function that allows to go back in the game
   * by reverting the statements played.
   *
   * @returns {Promise} - Whether the game was able to go back or not
   */
  static async revert (statement: unknown = null, shouldAdvance = true, shouldStepBack = true): Promise<{ advance: boolean; step: boolean } | void> {
    const actions = this.actions ();
    const before: Promise<void>[] = actions.map (action => action.beforeRevert ({ advance: shouldAdvance, step: shouldStepBack }));

    await Promise.all (before);

    // Check if we have steps behind us to revert to. If there aren't, then
    // we can't revert since we are already at the first statement.
    let actionToRevert: unknown = null;
    const currentStep = this.state ('step') as number;
    const currentLabel = this.state ('label') as string;
    const label = this.label () as unknown[];

    if (statement !== null) {
      actionToRevert = statement;
    } else if (currentStep >= 1) {
      actionToRevert = label[currentStep - 1];
    } else {
      const jumpHistory = this.history ('jump') as Array<{ destination: { label: string; step: number }; source: { label: string; step: number } }>;
      const jump = [...jumpHistory].reverse ().find (o => {
        return o.destination.label === currentLabel && o.destination.step === 0;
      });

      if (typeof jump !== 'undefined') {
        this.state ({
          label: jump.source.label,
          step: jump.source.step
        });
        const newLabel = this.label () as unknown[];
        const newStep = this.state ('step') as number;
        actionToRevert = newLabel[newStep];
        this.debug.debug ('Will revert to previous label.');
      } else {
        this.debug.debug ('Will not revert since this is the beginning of the game.');
      }
    }

    // Don't allow null as a valid statement
    if (actionToRevert === null || typeof actionToRevert === 'undefined') {
      // Clear the Stack using a Time Out instead of calling
      // the function directly, preventing an Overflow
      const labelArray = this.label () as unknown[];
      const step = this.state ('step') as number;

      setTimeout (() => {
        this.run.call (Monogatari, labelArray[step]);
      }, 0);

      this.debug.groupEnd ();

      return Promise.resolve ();
    }

    // If the statement is a pure js function, it won't be reverted since we don't
    // know what to do to revert it.
    if (typeof actionToRevert === 'function') {
      return Promise.reject ();
    }

    const action = this.prepareAction (actionToRevert as string | Record<string, unknown>, { cycle: 'Revert' });

    if (action === null) {
      return Promise.reject ('The action did not match any of the ones registered.');
    }

    this.debug.debug ('Reverting Action', actionToRevert);

    this.debug.groupCollapsed (`Revert Cycle [${(action as unknown as StaticAction).id}]`);

    this.trigger ('willRevertAction', { action });

    // Run the willRevert method of the action first. This method
    // is usually used to tell whether an action can be reverted
    // or not.
    return (action as Action).willRevert ().then (() => {
      this.debug.debug ('Action Will Revert');
      // If it can be reverted, then run the revert method
      return action.revert ().then (() => {
        this.debug.debug ('Action Reverting');
        // If the reversion was successful, run the didRevert
        // function. The action will return a boolean (shouldContinue)
        // specifying if the game should go ahead and revert
        // the previous statement as well or if it should
        // wait instead
        return action.didRevert ().then (({ advance, step }: { advance: boolean; step: boolean }) => {
          this.debug.debug ('Action Did Revert');

          this.trigger ('didRevertAction', { action });

          const promises: Promise<void>[] = [];

          for (const act of this.actions ()) {
            promises.push (act.afterRevert ({ advance, step }));
          }

          return Promise.all (promises).then (() => {
            // Since we reverted correctly, the step should
            // go back.
            const currentStep = this.state ('step') as number;
            if (step === true && shouldStepBack === true) {
              this.state ({
                step: currentStep - 1
              });
            }
            // Revert the previous statement if the action
            // told us to.
            if (advance === true && shouldAdvance === true) {
              // Clear the Stack using a Time Out instead
              // of calling the function directly, preventing
              // an Overflow
              setTimeout (() => {
                this.revert.call (Monogatari);
              }, 0);
            }

            this.debug.groupEnd ();
            return Promise.resolve ({ advance, step });
          });
        });
      });
    }).catch ((e: unknown) => {
      if (typeof e === 'object' || typeof e === 'string') {
        console.error (e);
      }
      // Clear the Stack using a Time Out instead of calling
      // the function directly, preventing an Overflow
      const labelArray = this.label () as unknown[];
      const step = this.state ('step') as number;
      setTimeout (() => {
        this.run.call (Monogatari, labelArray[step]);
      }, 0);

      this.debug.groupEnd ();

      return Promise.resolve ();
    });
  }

  /**
   * @static run - Run a specified statement.
   *
   * @param {string|Object|function} statement - The Monogatari statement to run
   * @param {boolean} advance - Whether the game should advance or wait for user
   * interaction. This parameter is mainly used to prevent the game from advancing
   * when loading the game or performing some actions and we don't want them to
   * affect the game flow.
   *
   * @returns {Promise} - Resolves if the statement was run correctly or rejects
   * if it couldn't be run correctly.
   */
  static async run (statement: unknown, shouldAdvance = true): Promise<{ advance: boolean }> {

    const actions = this.actions ();
    const before: Promise<void>[] = actions.map (action => action.beforeRun ({ advance: shouldAdvance }));

    await Promise.all (before);

    // Don't allow null as a valid statement
    if (statement === null) {
      this.debug.trace ();
      this.debug.groupEnd ();
      throw new Error ('Statement was null.');
    }

    this.debug.debug ('Preparing Action', statement);

    if (typeof statement === 'function') {
      this.debug.groupCollapsed (`Run Cycle [JS Function]`);

      // Block the game while the function is being run
      this.global ('block', true);

      // Run the function asynchronously and after it has run, unblock
      // the game so it can continue.
      try {
        const returnValue = await  Util.callAsync (statement as (...args: unknown[]) => unknown, Monogatari);

        this.global ('block', false);

        this.debug.groupEnd ();

        if (shouldAdvance && returnValue !== false) {
          // TODO: Do we need to return here? We don't do it in the other run methods.
          return this.next ().then (() => ({ advance: true }));
        }

        return Promise.resolve ({ advance: false });
      } catch (e: unknown) {
        const error: FancyErrorProps = {
          'Label': String(this.state ('label')),
          'Step': Number(this.state ('step')),
          'Help': {
            '_': 'Check the code for your function, there may be additional information in the console.',
          }
        };

        if (e && typeof e === 'object' && 'message' in e) {
          const err = e as Error & { fileName?: string; lineNumber?: number };
          error['Error Message'] = err.message;
          if (err.fileName) error['File Name'] = err.fileName;
          if (err.lineNumber) error['Line Number'] = err.lineNumber;
        } else if (typeof e === 'string') {
          error['Error Message'] = e;
        }

        FancyError.show ('engine:run:function_error', {
          label: String(this.state ('label')),
          step: Number(this.state ('step')),
          ...error
        });

        this.debug.trace ();
        this.debug.groupEnd ();

        return { advance: false };
      };
    }

    const action: Action | null = this.prepareAction (statement as string | Record<string, unknown>, { cycle: 'Application' });

    if (action === null) {
      throw new Error ('The action did not match any of the ones registered.');
    }

    this.debug.groupCollapsed (`Run Cycle [${(action.constructor as  StaticAction).id}]`);

    this.trigger ('willRunAction', { action });

    try {
      this.debug.debug ('Action Will Apply');
      await action.willApply ();
    } catch (e) {
      this.debug.debug (`Will Apply Failed.\nReason: ${e}`);
      this.debug.trace ();
      this.debug.groupEnd ();
      throw e;
    }

    try {
      this.debug.debug ('Action Applying');
      await action.apply ();
    } catch (e) {
      this.debug.debug (`Apply Failed.\nReason: ${e}`);
      this.debug.trace ();
      this.debug.groupEnd ();
      throw e;
    }

    // If everything has been run correctly, then run the didApply method.
    // The action will return a boolean (advance) specifying if the game should
    // run the next statement right away or if it should wait instead.
    try {
      const { advance } = await action.didApply ();
      this.debug.debug ('Action Did Apply');
      this.trigger ('didRunAction', { action });

      const promises: Promise<void>[] = actions.map (action => action.afterRun ({ advance: advance === true }));

      await Promise.all (promises);

      if (advance === true && shouldAdvance === true) {
        this.debug.debug ('Next action will be run right away');
        this.next ();
      }

      this.debug.groupEnd ();

      return { advance: advance === true };
    } catch (e) {
      this.debug.debug (`Did Apply Failed.\nReason: ${e}`);
      this.debug.trace ();
      this.debug.groupEnd ();
      throw e;
    }
  }

  static alert (id: string, options: Record<string, unknown>): void {
    const alert = document.createElement ('alert-modal') as HTMLElement & { setProps: (options: Record<string, unknown>) => void };
    alert.setProps (options);
    this.element ().prepend (alert);
  }

  static dismissAlert (id: string | null = null): void {
    // if (typeof id === 'string') {
    // 	this.component ('alert-modal').instance (id).remove ();
    // } else {
    this.element ().find ('alert-modal').remove ();
    // }
  }

  /**
   * @static loadFromSlot - Load a slot from the storage. This will recover the
   * state of the game from what was saved in it.
   *
   * @param {string} slot - The key with which the slot was saved on the storage
   */
  static loadFromSlot (slot: string): Promise<void> {
    document.body.style.cursor = 'wait';
    this.global ('playing', true);

    this.trigger ('willLoadGame');

    return this.resetGame ().then (() => {
      this.hideScreens ();

      return this.Storage.get (slot).then ((rawData) => {
        const data = rawData as LegacySaveData;
        // @Compatibility [<= v1.4.1]
        // Check if an older save format was used so we can transform
        // that information into the new format.
        if (typeof data.Engine !== 'undefined') {

          // Set the game state
          this.state ({
            step: data.Engine.Step,
            label: data.Engine.Label,
            scene: `show scene ${data.Engine.Scene}`,
          });

          // Retrieve if a song was playing so we can set it to the state
          if (data.Engine.Song !== '' && typeof data.Engine.Song !== 'undefined') {
            this.state ({
              music: [{ statement: data.Engine.Song, paused: false }],
            });
          }

          // Retrieve if a sound was playing so we can set it to the state
          if (data.Engine.Sound !== '' && typeof data.Engine.Sound !== 'undefined') {
            this.state ({
              sound: [{ statement: data.Engine.Sound, paused: false }],
            });
          }

          // Retrieve if particles were shown so we can set it to the state
          if (data.Engine.Particles !== '' && typeof data.Engine.Particles !== 'undefined') {
            this.state ({
              particles: `show particles ${data.Engine.Particles}`
            });
          }

          // Check if there are images to be shown
          if (data.Show !== '' && typeof data.Show !== 'undefined') {
            const show = data.Show.split (',');

            // For every image saved, add their element to the game
            for (const element of show) {
              if (element.trim () !== '') {
                const div = document.createElement ('div');
                div.innerHTML =  element.replace ('img/', 'assets/');
                if (div.firstChild) {
                  const item = $_(div.firstChild as HTMLElement);
                  const firstElement = item.get(0);
                  if (firstElement) {
                    if (element.indexOf ('data-character') > -1) {
                      (this.state ('characters') as string[]).push (`show character ${item.data ('character')} ${item.data ('sprite')} ${firstElement.className}`);
                    } else if (element.indexOf ('data-image') > -1) {
                      (this.state ('characters') as string[]).push (`show image ${item.data ('image')} ${firstElement.className}`);
                    }
                  }
                }
              }

            }
          }

          const sceneElements = data.Engine!.SceneElementsHistory.map ((elements: string[]) => {
            return elements.map ((element: string) => element.replace ('img/', 'assets/'));
          });

          // Set all the history variables with the ones from the old
          // format
          this.history ({
            music: data.Engine!.MusicHistory,
            sound: data.Engine!.SoundHistory,
            image: data.Engine!.ImageHistory,
            character: data.Engine!.CharacterHistory.map ((character: string) => {
              const div = document.createElement ('div');
              div.innerHTML = character.replace ('img/', 'assets/');
              if (!div.firstChild) return { statement: '', previous: null };
              const item = $_(div.firstChild as HTMLElement);
              const firstEl = item.get (0);
              if (!firstEl) return { statement: '', previous: null };
              const classes = firstEl.classList;
              classes.remove ('animated');
              return {
                statement: `show character ${item.data ('character')} ${item.data ('sprite')} with ${classes.toString ()}`,
                previous: null
              };
            }).filter((c) => c.statement !== ''),
            scene: data.Engine!.SceneHistory.map ((scene: string) => {
              return `show scene ${scene}`;
            }),
            sceneElements: sceneElements,
            sceneState: sceneElements.map ((elements: string[]) => {
              if (elements.length > 0) {
                return {
                  characters: elements.filter((element: string) => element.indexOf ('data-character=') > -1).map ((element: string) => {
                    const div = document.createElement ('div');
                    div.innerHTML =  element;
                    if (!div.firstChild) return '';
                    const image = $_(div.firstChild as HTMLElement);
                    const firstEl = image.get(0);
                    if (!firstEl) return '';
                    const classes = firstEl.classList.toString ().replace ('animated', '').trim ();
                    return `show character ${image.data('character')} ${image.data('sprite')}${ classes.length > 0 ? ` with ${classes}`: ''}`;
                  }).filter((c: string) => c !== ''),
                  images: elements.filter((element: string) => element.indexOf ('data-image=') > -1).map ((element: string) => {
                    const div = document.createElement ('div');
                    div.innerHTML =  element;
                    if (!div.firstChild) return '';
                    const image = $_(div.firstChild as HTMLElement);
                    const firstEl = image.get(0);
                    if (!firstEl) return '';
                    const classes = firstEl.classList.toString ().replace ('animated', '').trim ();
                    return `show image ${image.data('image')}${ classes.length > 0 ? ` with ${classes}`: ''}`;
                  }).filter((c: string) => c !== ''),
                };
              }

              return {
                characters: [],
                images: []
              };
            }),
            particle: data.Engine!.ParticlesHistory.map ((particles: string) => {
              return `show particles ${particles}`;
            }),
          });
          this.storage (data.Storage ?? {});

        } else {
          // If the new format is being used, things are a lot more simple
          const migratedData = migrate((data.game ?? {}) as unknown as Record<string, unknown>) as { state: Record<string, unknown>; history: Record<string, unknown[]>; storage: Record<string, unknown> };

          this.state (migratedData.state);
          this.history (migratedData.history);
          this.storage (migratedData.storage);
        }


        const currentStep = this.state ('step') as number;
        const labelLength = (this.label () as unknown[]).length;
        if (currentStep > labelLength - 1) {
          let step = currentStep;
          while (step > labelLength - 1) {
            step = step - 1;
          }
          this.state ({ step });
        }

        this.onLoad ().then (() => {
          // Finally show the game and start playing
          this.showScreen ('game');
          document.body.style.cursor = 'auto';
          this.trigger ('didLoadGame');
          return Promise.resolve ();
        });
      });
    });
  }

  static async proceed ({ userInitiated = false, skip = false, autoPlay = false } = {}): Promise<void> {
    await this.shouldProceed ({ userInitiated, skip, autoPlay });

    this.global ('_engine_block', true);

    await this.willProceed ();
    await this.next ();
  }

  static async rollback (): Promise<void> {
    const allowRollback = this.setting ('AllowRollback') === true;

    if (!allowRollback) {
      return;
    }

    const stateObj = this.state() as { step: number; label: string };

    if (stateObj.step === 0) {
      const jumpHistory = this.history ('jump') as { destination: { label: string; step: number } }[];
      const jump = [...jumpHistory].reverse ().find (o => {
        return o.destination.label === stateObj.label && o.destination.step === 0;
      });

      if (typeof jump === 'undefined') {
        this.debug.debug ('Will not attempt rollback since this is the beginning of the game.');
        return;
      }
    }

    await this.shouldRollback ();

    this.global ('_engine_block', true);

    await this.willRollback ();
    await this.previous ();
  }

  /**
   * @static shouldProceed - Check if the game can proceed
   *
   * @returns {Promise} - Resolves if the game can proceed or reject if it
   * can't proceed right now.
   */
  static shouldProceed ({ userInitiated = false, skip = false, autoPlay = false }) {
    // TODO: This should be removed
    const deprecatedBlocks = this.global ('block') || this.global ('_executing_sub_action');

    // Check if the game is visible, if it's not, then it probably is not
    // playing or is looking at some menu and thus the game should not
    // proceed. The game will not proceed if it's blocked or if the distraction
    // free mode is enabled.
    if (!$_('.modal').isVisible ()
      && !this.global ('distraction_free')
      && !deprecatedBlocks
      && !this.global ('_engine_block')) {
      const promises = [];

      this.debug.groupCollapsed ('shouldProceed Check');
      try {

        this.debug.debug ('Checking Actions');

        // Check action by action if they will allow the game to proceed
        for (const action of this.actions ()) {
          promises.push (action.shouldProceed ({ userInitiated, skip, autoPlay }).then (() => {
            this.debug.debug (`OK ${action.id}`);
          }).catch ((e) => {
            this.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
            return Promise.reject (e);
          }));
        }

        this.debug.debug ('Checking Components');

        // Check component by component if they will allow the game to proceed
        for (const component of this.components ()) {
          promises.push (component.shouldProceed ({ userInitiated, skip, autoPlay }).then (() => {
            this.debug.debug (`OK ${component.tag}`);
          }).catch ((e) => {
            this.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
            return Promise.reject (e);
          }));
        }
      } catch (e) {
        console.error (e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        FancyError.show ('engine:lifecycle:should_proceed_error', {
          errorMessage: errorMessage
        });
      }

      this.debug.debug ('Checking Extra Conditions');

      return Promise.all (promises).then ((...args) => {
        this.debug.groupEnd ();
        return Promise.resolve (...args);
      }).catch ((e) => {
        this.debug.groupEnd ();
        return Promise.reject (e);
      });
    } else {
      this.debug.debug({
        'Block': this.global ('block'),
        'Distraction Free': this.global ('distraction_free'),
        'Engine Block': this.global ('_engine_block'),
        'Executing Sub Action': this.global ('_executing_sub_action'),
        'Modal Visible': $_('.modal').isVisible (),
      });
      return Promise.reject ('Extra condition check failed.');
    }
  }

  static willProceed () {
    this.debug.groupCollapsed ('Can proceed check passed, game will proceed.');

    const actions = this.actions ();
    const components = this.components ();

    const promises = [];

    try {
      // Check action by action if they will allow the game to proceed
      for (const action of actions) {
        promises.push (action.willProceed ().then (() => {
          this.debug.debug (`OK ${action.id}`);
        }).catch ((e) => {
          this.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
          return Promise.reject (e);
        }));
      }

      // Check component by component if they will allow the game to proceed
      for (const component of components) {
        promises.push (component.willProceed ().then (() => {
          this.debug.debug (`OK ${component.tag}`);
        }).catch ((e) => {
          this.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
          return Promise.reject (e);
        }));
      }
    } catch (e) {
      console.error (e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      FancyError.show ('engine:lifecycle:will_proceed_error', {
        errorMessage: errorMessage
      });
    }

    return Promise.all (promises).then ((...args) => {
      this.debug.groupEnd ();
      return Promise.resolve (...args);
    }).catch ((e) => {
      this.debug.groupEnd ();
      return Promise.reject (e);
    });
  }

  /**
   * @static stopTyping - Stop the typing effect.
   *
   * @param component - A TypeWriter component instance
   * @returns {void}
   */
  static stopTyping (component: TypeWriterComponent): void {
    const instant = this.setting('InstantText') as boolean;

    // TypeWriter.finish() handles setting finished_typing and triggering events
    component.finish(instant);
  }

  /**
   * @static shouldRollback - Check if the game can revert
   *
   * @returns {Promise} - Resolves if the game can be reverted or reject if it
   * can't be reverted right now.
   */
  static shouldRollback () {
    // Check if the game is visible, if it's not, then it probably is not
    // playing or is looking at some menu and thus the game should not
    // revert. The game will not revert if it's blocked or if the distraction
    // free mode is enabled.
    if (!this.global ('distraction_free')
      && !this.global ('block')
      && (!this.global ('_engine_block') || this.global ('_executing_sub_action'))) {
      const promises = [];

      this.debug.groupCollapsed ('shouldRollback Check');
      try {
        // Check action by action if they will allow the game to revert
        for (const action of this.actions ()) {
          promises.push (action.shouldRollback ().then (() => {
            this.debug.debug (`OK ${action.id}`);
          }).catch ((e) => {
            this.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
            return Promise.reject (e);
          }));
        }

        // Check component by component if they will allow the game to revert
        for (const component of this.components ()) {
          promises.push (component.shouldRollback ().then (() => {
            this.debug.debug (`OK ${component.tag}`);
          }).catch ((e) => {
            this.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
            return Promise.reject (e);
          }));
        }
      }  catch (e) {
        console.error (e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        FancyError.show ('engine:lifecycle:should_rollback_error', {
          errorMessage: errorMessage
        });
      }

      return Promise.all (promises).then ((...args) => {
        this.debug.groupEnd ();
        return Promise.resolve (...args);
      }).catch ((e) => {
        this.debug.groupEnd ();
        return Promise.reject (e);
      });
    } else {
      return Promise.reject ('Extra condition check failed.');
    }
  }

  static willRollback () {
    const promises = [];

    this.debug.groupCollapsed ('Should Rollback Check passed, game will roll back.');

    try {
      // Check action by action if they will allow the game to revert
      for (const action of this.actions ()) {
        promises.push (action.willRollback ().then (() => {
          this.debug.debug (`OK ${action.id}`);
        }).catch ((e) => {
          this.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
          return Promise.reject (e);
        }));
      }

      // Check component by component if they will allow the game to revert
      for (const component of this.components ()) {
        promises.push (component.willRollback ().then (() => {
          this.debug.debug (`OK ${component.tag}`);
        }).catch ((e) => {
          this.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
          return Promise.reject (e);
        }));
      }
    } catch (e) {
      console.error (e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      FancyError.show ('engine:lifecycle:will_rollback_error', {
        errorMessage: errorMessage
      });
    }

    return Promise.all (promises).then ((...args) => {
      this.debug.groupEnd ();
      return Promise.resolve (...args);
    }).catch ((e) => {
      this.debug.groupEnd ();
      return Promise.reject (e);
    });
  }

  /**
   * @static playAmbient - Play the main menu music using the key defined in the
   * 'MainScreenMusic' property of the game settings.
   */
  static playAmbient () {
    // Check if a menu music was defined
    if (this.setting ('MainScreenMusic') !== '' && this.ambientPlayer) {
      const mainScreenMusic = this.setting ('MainScreenMusic') as string;
      const assetsPath = this.setting ('AssetsPath') as { root: string; music: string };
      const volumePref = this.preference ('Volume') as { Music: number | string };

      // Make the ambient player loop
      this.ambientPlayer.loop = true;

      let ambientVolume = volumePref.Music;

      if (typeof ambientVolume === 'string') {
        ambientVolume = parseFloat(ambientVolume);
      }

      this.ambientPlayer.volume = ambientVolume;

      // Check if the music was defined in the music assets object
      const musicAsset = this.asset ('music', mainScreenMusic) as string | undefined;
      if (typeof musicAsset !== 'undefined') {

        // Check if the player is already playing music
        if (!this.ambientPlayer.paused && !this.ambientPlayer.ended) {
          return;
        }

        // Get the full path to the asset and set the src to the ambient player
        this.ambientPlayer.src =  `${assetsPath.root}/${assetsPath.music}/${musicAsset}`;

        // Play the music but catch any errors. Error catching is necessary
        // since some browsers like chrome, have added some protections to
        // avoid media from being autoplayed. Because of these protections,
        // the user needs to interact with the page first before the media
        // is able to play.
        this.ambientPlayer.play ().catch ((e) => {
          console.warn(e);
          // Create a broadcast message
          const element = `
            <div data-ui="broadcast" data-content="allow-playback">
              <p data-string="AllowPlayback">${this.string ('AllowPlayback')}.</p>
            </div>
          `;

          // Add it to the main menu and game screens
          this.element ().prepend (element);

          // Try to play the media again once the element has been clicked
          // and remove it.
          this.element ().on ('click', '[data-ui="broadcast"][data-content="allow-playback"]', () => {
            this.playAmbient ();
            this.element ().find ('[data-ui="broadcast"][data-content="allow-playback"]').remove ();
          });
        });
      } else {
        const musicAssets = this.assets ('music') as Record<string, unknown> | undefined;
        FancyError.show ('engine:music:not_defined', {
          music: mainScreenMusic,
          availableMusic: Object.keys (musicAssets ?? {})
        });
      }
    }
  }

  // Stop the main menu's music
  static stopAmbient () {
    const player = this.ambientPlayer;

    if (player && !player.paused) {
      player.pause ();
    }
  }

  // Start game automatically without going trough the main menu
  static showMainScreen () {
    this.global ('on_splash_screen', false);

    if (this.setting ('ShowMainScreen')) {
      this.showScreen ('main');
      return;
    }

    const currentLabel = this.label () as unknown[];
    const step = this.state ('step') as number;

    this.global ('playing', true);
    this.showScreen ('game');

    this.run (currentLabel[step]);
  }

  static showSplashScreen () {
    const labelName = this.setting ('SplashScreenLabel');
    if (typeof labelName === 'string' && labelName !== '') {
      const labelContent = this.label (labelName);
      if (typeof labelContent !== 'undefined') {
        this.global ('on_splash_screen', true);

        this.state ({
          label: labelName
        });

        this.element ().find ('[data-component="game-screen"]').addClass ('splash-screen');

        this.element ().find ('[data-component="quick-menu"]').addClass ('splash-screen');

        this.showScreen ('game');

        const currentLabel = this.label () as unknown[];
        const step = this.state ('step') as number;
        this.run (currentLabel[step]);

        return;
      }
    }
    this.showMainScreen ();
  }

  /**
   * @static autoPlay - Enable or disable the autoplay feature which allows the
   * game to play itself (of sorts), it will go through the dialogs alone but
   * will wait when user interaction is needed.
   *
   * @param {boolean} enable - Wether the auto play feature will be enabled (true)
   * or disabled (false);
   */
  static autoPlay (enable: boolean): void {
    if (enable === true) {
      // The interval for autoplay speed is measured in seconds
      const interval = (this.preference ('AutoPlaySpeed') as number) * 1000;
      let expected = Date.now () + interval;

      const timerFn = () => {
        const now = Date.now () - expected; // the drift (positive for overshooting)
        if (now > interval) {
          // something really bad happened. Maybe the browser (tab) was inactive?
          // possibly special handling to avoid futile "catch up" run
        }
        this.proceed ({ userInitiated: false, skip: false, autoPlay: true }).then (() => {
          expected += interval;
          setTimeout (this.global ('_auto_play_timer') as () => void, Math.max (0, interval - now)); // take into account drift
        }).catch (() => {
          // An action waiting for user interaction or something else
          // is blocking the game.
          expected += interval;
          setTimeout (this.global ('_auto_play_timer') as () => void, Math.max (0, interval - now)); // take into account drift
        });
      };

      this.global ('_auto_play_timer', timerFn);
      setTimeout (timerFn, interval);
      this.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-string]').text (this.string ('Stop') || 'Stop');
      this.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-icon]').replaceWith ('<span class="fas fa-stop-circle"></span>');
    } else {
      clearTimeout (this.global ('_auto_play_timer') as ReturnType<typeof setTimeout>);
      this.global ('_auto_play_timer', null);
      this.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-string]').text (this.string ('AutoPlay') || 'AutoPlay');
      this.element ().find ('[data-component="quick-menu"] [data-action="auto-play"] [data-icon]').replaceWith ('<span class="fas fa-play-circle"></span>');
    }
  }

  /**
   * @static distractionFree - Enable or disable the distraction free mode
   * where the dialog box is hidden so that the player can look at the characters
   * and background with no other elements on the way. A 'transparent' class
   * is added to the quick menu when this mode is enabled.
   */
  static distractionFree () {
    if (this.global ('playing')) {
      const element = this.element();
      // Check if the distraction free is currently enabled
      if (this.global ('distraction_free') === true) {
        element?.find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-string]').text (this.string ('Hide') ?? '');
        element?.find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-icon]').replaceWith ('<span class="fas fa-eye" data-action="distraction-free"></span>');
        element?.find ('[data-component="quick-menu"]').removeClass ('transparent');
        element?.find ('[data-component="text-box"]').show ('grid');
        this.global ('distraction_free', false);
      } else {
        element?.find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-string]').text (this.string ('Show') ?? '');
        element?.find ('[data-component="quick-menu"] [data-action="distraction-free"] [data-icon]').replaceWith ('<span class="fas fa-eye-slash" data-action="distraction-free"></span>');
        element?.find ('[data-component="quick-menu"]').addClass ('transparent');
        element?.find ('[data-component="text-box"]').hide();
        this.global ('distraction_free', true);
      }
    }
  }

  static setup (selector: string): Promise<void | undefined> {
    const components = this.components();

    // Set the initial settings if they don't exist or load them from the
    // Storage if they do.
    const loadPreferencesPromise = new Promise<void>((resolve, _reject) => {
      this.Storage.get('Settings').then ((local_settings) => {
        this.global ('_first_run', false);
        this._preferences = merge (this._preferences, local_settings as Partial<PlayerPreferences>);
        resolve();
      }).catch ((e) => {
        console.warn ('There was no settings saved. This may be the first time this game was opened, we\'ll create them now.', e);
        this.global ('_first_run', true);
        if (this.setting ('MultiLanguage') !== true || this.setting ('LanguageSelectionScreen') !== true) {
          this.Storage.set ('Settings', this._preferences).then(() => resolve()).catch(() => resolve());
        } else {
          resolve();
        }
      });
    });

    return loadPreferencesPromise.then(() => {
      // Define all the components that were registered to this point
      for (const component of components) {
        try {
          component.engine = this.asEngine();
          Registry.register(component.tag, component);
        } catch (e) {
          FancyError.show ('engine:component:already_registered', {
            tag: component.tag,
            component: component,
            unregisterCode: `<pre><code class='language-javascript'>monogatari.unregisterComponent ('${component.tag}')</code></pre>`
          });
        }
      }

      // Register service worker. The service worker will save all requests into
      // the cache so the game loads more quickly and we can play offline. The
      // service worker will only be used if it was allowed by the settings and
      // if we are not running in a local platform such as electron or cordova
      // where the assets are expected to be available locally and thus don't
      // require being cached.
      if (this.setting ('ServiceWorkers')) {
        if (!Platform.electron && !Platform.cordova && Platform.serviceWorkers) {
          navigator.serviceWorker.register('./service-worker.js').then ((registration) => {

            // Check if an update to the service worker was found
            registration.onupdatefound = () => {
              const worker = registration.installing;

              if (worker) {
                worker.onstatechange = () => {
                  // Once the updated service worker has been installed,
                  // show a notice to the players so that they reload the
                  // page and get the latest content.
                  if (worker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      const element = this.element();
                      const broadcastElement = `
                        <div data-ui="broadcast" data-content="new-content">
                          <p data-string="NewContent">${this.string ('NewContent')}.</p>
                        </div>
                      `;
                      element?.prepend (broadcastElement);
                      element?.on ('click', '[data-ui="broadcast"][data-content="new-content"]', () => {
                        this.element()?.find ('[data-ui="broadcast"][data-content="new-content"]').remove ();
                      });
                    }
                  }
                };
              }
            };
          });
        } else {
          console.warn ('Service Workers are not available in this browser or have been disabled in the engine configuration. Service Workers are available only when serving your files through a server, once you upload your game this warning will go away. You can also try using a simple server like this one for development: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb/');
        }
      }

      // Save the structure of the storage variable. The structure is saved as
      // a string so that we have a reference to how the storage was originally
      // and we can reset the storage when the game ends.
      this.global ('storageStructure', JSON.stringify (this.storage ()));

      // The open-screen action does exactly what it says, it takes the
      // data-screen property of the object it's in and then opens that
      // menu, meaning it hides everything else and shows that one.
      this.registerListener ('open-screen', {
        callback: (event: Event, element: DOM) => {
          this.showScreen (element.data('open') as string);
        }
      });

      // The start action starts the game so it shows the game screen
      // and the game starts
      this.registerListener ('start', {
        callback: () => {
          this.global ('playing', true);

          // Remove the play main menu audio broadcast message if it's present
          this.element ().find ('[data-ui="broadcast"][data-content="allow-playback"]').remove ();

          this.onStart ().then (() => {
            this.element ().find ('[data-screen]').each ((screen: HTMLElement) => {
              (screen as HTMLElement & { setState: (state: Record<string, unknown>) => void }).setState ({ open: false });
            });

            const gameScreen = this.element ().find ('[data-screen="game"]').get (0) as (HTMLElement & { setState: (state: Record<string, unknown>) => void }) | undefined;
            if (gameScreen) {
              gameScreen.setState ({ open: true });
            }

            // Check if the initial label exists
            const currentLabel = this.label () as unknown[];
            const step = this.state ('step') as number;
            if (currentLabel) {
              this.run (currentLabel[step]);
            }
          });
        }
      });

      this.registerListener ('dismiss-alert', {
        callback: () => {
          this.dismissAlert ();
        }
      });

      this.registerListener ('distraction-free', {
        keys: 'h',
        callback: () => {
          this.distractionFree ();
        }
      });

      this.registerListener ('skip', {
        keys: 's',
        callback: () => {
          if (this.global ('playing')) {
            if (this.global ('skip') !== null) {
              this.skip (false);
            } else {
              this.skip (true);
            }
          }
        }
      });

      // Add listener to the auto-play buttons, activating or deactivating the
      // auto-play feature
      this.registerListener ('auto-play', {
        callback: () => {
          this.autoPlay (this.global ('_auto_play_timer') === undefined);
        }
      });

      const promises = [];

      for (const component of this.components ()) {
        component.engine = this.asEngine();
        promises.push (component.setup ());
      }

      for (const action of this.actions ()) {
        action.engine = this.asEngine();
        promises.push (action.setup ());
      }

      return Promise.all (promises).then (() => {
        this.global ('_didSetup', true);
        return Promise.resolve ();
      });
    }).catch((error) => {
      console.error('Initialization error', error);
    });
  }
  /**
   * @static skip - Enable or disable the skip mode which is similar to auto
   * play but simply skips fast through the game.
   *
   * @param {boolean} enable - Wether it should be enabled (true) or disabled (false)
   */
  static skip (enable: boolean): void {
    const skipSetting = this.setting ('Skip') as number;
    if (enable === true) {
      // Check if Skip was enabled on the settings, if it has a value greater
      // than 0, it represents the speed with which the game will skip through
      // statements. If it's lesser or equal to 0 then it's disabled.
      if (skipSetting > 0) {

        const button = this.element ().find ('[data-component="quick-menu"] [data-action="skip"] [data-icon]');

        if (button.data ('icon') !== 'play-circle') {
          button.replaceWith ('<span class="far fa-play-circle"></span>');
        }

        // Start the timeout with the time specified on the settings. We
        // save it on a global variable so that we can disable later.
        this.global ('skip', setTimeout (() => {
          if (this.element ().find ('[data-screen="game"]').isVisible () && this.global ('playing') === true) {
            this.proceed ({ userInitiated: false, skip: true, autoPlay: false }).then (() => {
              // Nothing to do here
            }).catch ((e) => {
              this.debug.log (`Proceed Prevented\nReason: ${e}`);
              // An action waiting for user interaction or something else
              // is blocking the game.
            });
          }
          // Start all over again
          this.skip (true);
        }, skipSetting));
      }
    } else {
      clearTimeout (this.global ('skip') as ReturnType<typeof setTimeout>);
      this.global ('skip', null);
      const button = this.element ().find ('[data-component="quick-menu"] [data-action="skip"] [data-icon]');

      if (button.data ('icon') !== 'fast-forward') {
        button.replaceWith ('<span class="fas fa-fast-forward"></span>');
      }
    }
  }

  static showScreen (screen: string): void {
    this.hideScreens ();

    const screenElement = this.element ().find (`[data-screen="${screen}"]`).get (0) as Component | undefined;
    screenElement?.setState ({
      open: true
    });

    // If auto play or skip were enabled, disable them.
    if (this.global ('_auto_play_timer')) {
      this.autoPlay (false);
    }

    if (this.global ('skip')) {
      this.skip (false);
    }
  }

  static hideScreens (): void {
    const element = this.element();

    element?.find ('[data-screen]').each ((screen) => {
      (screen as Component).setState ({ open: false });
    });
  }

  static resize (_element: unknown, proportionWidth: number, proportionHeight: number): void {
    const mainElement = $_('body').get (0);
    if (!mainElement) return;

    const mainWidth = mainElement.offsetWidth;
    const mainHeight = mainElement.offsetHeight;

    const h = Math.floor (mainWidth * (proportionHeight / proportionWidth));

    let widthCss = '100%';
    let heightCss = '100%';
    let marginTopCss: string | number = 0;

    if (h <= mainHeight) {
      const marginTop = Math.floor ((mainHeight - h)/2);
      marginTopCss = marginTop + 'px';
      heightCss = h + 'px';

    } else {
      const w = Math.floor (mainHeight * (proportionWidth/proportionHeight));
      widthCss = w + 'px';
    }

    $_('.forceAspectRatio').style ({
      width: widthCss,
      height: heightCss,
      marginTop: marginTopCss
    });
  }

  static goBack (event: Event, selector: string) {
    if (!$_(`${selector} [data-screen="game"]`).isVisible ()) {
      this.debug.debug ('Registered Back Listener on Non-Game Screen');
      event.stopImmediatePropagation ();
      event.stopPropagation ();
      event.preventDefault ();
      this.hideScreens ();

      type ComponentWithState = HTMLElement & { setState: (state: Record<string, unknown>) => void };

      if (this.global ('playing') || this.global ('on_splash_screen')) {
        const gameScreen = this.element ().find ('[data-screen="game"]').get (0) as ComponentWithState | undefined;
        gameScreen?.setState ({ open: true });
      } else {
        const mainScreen = this.element ().find ('[data-screen="main"]').get (0) as ComponentWithState | undefined;
        mainScreen?.setState ({ open: true });
      }
    }
  }

  /**
   * Every event listener should be binded in this function.
   */
  static bind (selector: string): Promise<void> {


    // Add the orientation checker in case that a specific orientation was
    // defined.
    const isMobile = typeof Platform.mobile === 'function' ? Platform.mobile() : Platform.mobile;
    if (this.setting ('Orientation') !== 'any' && isMobile) {

      // Set the event listener for device orientation so we can display a message
      window.addEventListener ('orientationchange', () => {

        // Display or remove the device orientation notice depending on the
        // current device orientation
        if (Platform.orientation !== this.setting ('Orientation')) {
          this.alert ('orientation-warning', {
            message: 'OrientationWarning'
          });
        } else {
          this.dismissAlert ('orientation-warning');
        }
      }, false);
    }

    // Add event listener for back buttons. If the player is playing, the back
    // button will return to the game, if its not playing, then it'll return
    // to the main menu.
    this.on ('click', '[data-screen]:not([data-screen="game"]) [data-action="back"]', (event) => {
      this.goBack (event, selector);
    });

    const self = this;

    // Add listeners for the data-action properties
    this.on ('click', '[data-action]', function (this: HTMLElement, event) {
      const element = $_(this);

      const action = element.data ('action');

      if (action) {
        self.runListener (action, event, element);
      }

      return action === 'set-volume';
    });

    this.keyboardShortcut (['right', 'space'], () => {
      this.proceed ({ userInitiated: true, skip: false, autoPlay: false }).then (() => {
        // Nothing to do here
      }).catch ((e) => {
        this.debug.log (`Proceed Prevented\nReason: ${e}`);
        // An action waiting for user interaction or something else
        // is blocking the game.
      });
    });

    this.keyboardShortcut ('esc', () => {
      if ($_(`${selector} [data-screen="game"]`).isVisible () && this.global ('playing')) {
        this.showScreen ('settings');
      } else if ($_(`${selector} [data-screen="settings"]`).isVisible () && this.global ('playing')) {
        this.showScreen ('game');
      }
    });

    this.keyboardShortcut ('shift+s', () => {
      if (this.global ('playing')) {
        this.showScreen ('save');
      }
    });

    this.keyboardShortcut ('shift+l', () => {
      if (this.global ('playing')) {
        this.showScreen ('load');
      }
    });

    const forceAspectRatio = this.setting ('ForceAspectRatio');
    let forceAspectRatioFlag = true;

    switch (forceAspectRatio) {
      case 'Visuals':
        $_('[data-content="visuals"]').addClass('forceAspectRatio');
        break;

      case 'Global':
        this.element ().parent ().addClass('forceAspectRatio');
        break;

      default:
        forceAspectRatioFlag = false;
    }

    if (forceAspectRatioFlag) {
      const aspectRatio = this.setting ('AspectRatio') as string;
      const [w, h] = aspectRatio.split (':');
      const proportionWidth = parseInt(w);
      const proportionHeight = parseInt(h);
      if (!(Platform.electron && forceAspectRatio === 'Global')) {
        this.resize (null, proportionWidth, proportionHeight);
        window.addEventListener('resize', () => this.resize (null, proportionWidth, proportionHeight));
      }
    }

    const promises = [];

    for (const component of this.components ()) {
      promises.push (component.bind (selector));
    }

    for (const action of this.actions ()) {
      promises.push (action.bind (selector));
    }

    return Promise.all (promises).then (() => {
      for (const listener of this._listeners) {
        const { keys, callback } = listener;
        if (typeof keys !== 'undefined') {
          this.keyboardShortcut (keys, callback);
        }
      }
      this.global ('_didBind', true);
      return Promise.resolve ();
    });
  }

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
  static element (): DOM;
  static element (pure: true, handled?: boolean): HTMLElement | null;
  static element (pure: false, handled?: boolean): DOM;
  static element (pure = false, handled = false): HTMLElement | DOM | null {
    let element: HTMLElement | DOM | null = null;
    let exists = false;

    if (pure === true) {
      element = document.querySelector ('visual-novel') as HTMLElement;
      exists = element !== null;
    } else {
      element = $_('visual-novel');
      exists = element.length > 0;
    }

    // In some cases, the user might be trying to execute an action using the
    // main element when the DOM has not been loaded yet, thus causing an
    // error since the element does not exists yet.
    if (exists === false && handled === false) {
      FancyError.show ('engine:element:not_ready', {});
    }

    return element;
  }

  static on (event: string, target: string | EventCallback, callback?: EventCallback): void {
    const element = this.element() as DOM;

    if (element) {
      // If callback is not provided, treat target as callback (for simple event binding)
      if (typeof target === 'function' && callback === undefined) {
        element.on (event, target as EventCallback);
      } else {
        element.on (event, target as string, callback!);
      }
    }
  }

  static off (event: string, callback: EventCallback): void {
    const element = this.element() as DOM;

    if (element) {
      element.off (event, callback);
    }
  }

  static parentElement (): DOM {
    return $_(this._selector);
  }

  /**
   * @static trigger - Trigger a custom element with custom details data
   *
   * @param {string} name - The name of the event to trigger
   * @param {Object} [details = {}] - A key/value object with additional details
   * for the event
   *
   * @returns {void}
   */
  static trigger (name: string, details: Record<string, unknown> = {}) {
    const event = new CustomEvent (name, { bubbles: false, detail: details });

    const element = this.element (true, true);

    if (element) {
      element.dispatchEvent (event);
    } else {
      $_ready (() => dispatchEvent (event));
    }
  }

  static displayInitialScreen () {
    // Preload all the game assets
    this.preload ().then (() => {

    }).catch ((e) => {
      console.error (e);
    }).finally (() => {
      if (this.label ()) {
        this.showSplashScreen ();
      } else {
        const scriptData = this.script () as Record<string, unknown> | undefined;
        FancyError.show ('engine:script:label_not_found', {
          startLabel: this.setting ('Label'),
          availableLabels: Object.keys (scriptData ?? {})
        });
      }
    });
  }

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
  static _setupRegistry () {
    // Enable Registry debug mode when Monogatari is in debug mode
    if (typeof MonogatariDebug === 'object') {
      Registry.debug = true;
    }

    // Centralized error handling for component errors
    Registry.onError ((error, component, tag, lifecycle) => {
      FancyError.show ('engine:component:lifecycle_error', {
        tag: tag,
        lifecycle: lifecycle,
        errorMessage: error.message,
        stackTrace: error.stack
      });
      // Also log to console for debugging
      console.error (`[Monogatari] Component error in <${tag}> during ${lifecycle}:`, error);
    });

    // Track component mounts for debugging
    Registry.onMount ((component, tag) => {
      this.trigger ('componentDidMount', { component, tag });
    });

    // Track component unmounts for debugging
    Registry.onUnmount ((component, tag) => {
      this.trigger ('componentDidUnmount', { component, tag });
    });
  }

  static async init (selector = '#monogatari') {
    this._selector = selector;

    if (typeof window.Cypress !== 'undefined') {
      this.setting ('ExperimentalFeatures', true);
    }

    // Setup Pandora Registry for centralized error handling and lifecycle tracking
    this._setupRegistry ();

    this.trigger ('willInit');

    const storageConfigInit = this.Storage?.configuration () as { name?: string } | undefined;

    if (!storageConfigInit || storageConfigInit.name === '') {
      this.setupStorage ();
    }

    this.trigger ('willSetup');

    await this.setup(selector);

    this.trigger ('didSetup');
    this.trigger ('willBind');

    await this.bind(selector);

    this.trigger ('didBind');

    this.ambientPlayer = new Audio ();

    // Set the initial language translations
    this.localize ();

    // Set the label in which the game will start
    this.state ({ label: this.setting ('Label') });

    // Check if the orientation is correct, if it's not, show the warning
    // message so the player will rotate its device.
    if (this.setting ('Orientation') !== 'any') {
      const initIsMobile = Platform.mobile();

      if (initIsMobile && Platform.orientation !== this.setting ('Orientation')) {
        this.alert ('orientation-warning', {
          message: 'OrientationWarning'
        });
      }
    }

    const init: Promise<void>[] = [];

    for (const component of this.components ()) {
      init.push (component.init ());
    }

    for (const action of this.actions ()) {
      init.push (action.init ());
    }

    if (this.setting ('AutoSave') != 0 && typeof this.setting ('AutoSave') === 'number') {
      this.debug.debug ('Automatic save is enabled, setting up timeout');
      this.global ('_auto_save_interval', setInterval(() => {
        this.debug.groupCollapsed ('Automatic Save');
        const id = this.global ('current_auto_save_slot') as number;

        this.debug.debug ('Saving data to slot', id);

        this.saveTo ('AutoSaveLabel', id);

        const slotsCount = this.setting ('Slots') as number;
        if (id === slotsCount) {
          this.global ('current_auto_save_slot', 1);
        } else {
          this.global ('current_auto_save_slot', id + 1);
        }

        this.debug.groupEnd ();

      }, (this.setting ('AutoSave') as number) * 60000));
    } else {
      this.debug.debug ('Automatic save is disabled. Section will be hidden from Load Screen');
      this.element ().find ('[data-screen="load"] [data-ui="autoSaveSlots"]').hide ();
    }

    await Promise.all (init);

    this.global ('_didInit', true);
    this.trigger ('didInit');

    if (this.setting ('MultiLanguage') === true && this.setting ('LanguageSelectionScreen') === true && this.global ('_first_run') === true) {
      this.showScreen ('language-selection');

      this.on ('didLocalize', () => {
        this.Storage.set ('Settings', this._preferences);
        const languageSelectionScreen = this.element ().find ('[data-screen="language-selection"]');
        if (languageSelectionScreen.isVisible ()) {
          this.displayInitialScreen ();

        }
      });
    } else {
      this.displayInitialScreen ();
    }
  }

  /**
   * Random number between `min` and `max`
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  static random (min: number, max: number) {
    try {
      return new Random (browserCrypto).integer (min, max);
    } catch (e) {
      console.error (e);
      return new Random ().integer (min, max);
    }
  }
}

// =============================================================================
// Compile-time Type Check
// =============================================================================
// This ensures that the Monogatari class implements the VisualNovelEngine
// interface. If any method or property is missing or has an incompatible type,
// TypeScript will report an error here.
//
// The VisualNovelEngine interface can be extended by external users via
// declaration merging:
//
// declare module '@monogatari/core' {
//   interface VisualNovelEngine {
//     myCustomMethod: () => void;
//   }
// }
// =============================================================================
const _engineTypeCheck: VisualNovelEngine = Monogatari;
// Suppress unused variable warning
void _engineTypeCheck;

export { Monogatari };

export default Monogatari;
