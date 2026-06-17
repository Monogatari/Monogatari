import {
  $_,
  $_ready,
  Space,
  Platform,
  Preload,
  FileSystem,
  Debug
} from '@aegis-framework/artemis';
import type { DOM, EventCallback } from '@aegis-framework/artemis';
import {  Registry } from '@aegis-framework/pandora';
import { FancyError } from './lib/FancyError';
import AudioPlayer from './lib/AudioPlayer';
import type { StaticComponent, StaticAction, Character, GameSettings, PlayerPreferences, StateMap, HistoryMap, GlobalsMap, ActionInstance, StorageInterface } from './lib/types';
import deeply from 'deeply';
import { version } from '../package.json';
import { Random, browserCrypto } from 'random-js';

// TODO: We need to decouple these.
import type TypeWriterComponent from './components/type-writer';
import type PreloadAction from './actions/Preload';

import type { VisualNovelEngine } from './lib/types/Monogatari';
import { characters as _characters, character as _character } from './engine/characters';
import {
  translateString,
  localize as _localize,
  translate as _translate,
  replaceVariables as _replaceVariables,
  translations as _translations,
  translation as _translation,
  languageMetadata as _languageMetadata,
} from './engine/i18n';

import {
  assets as _assets,
  asset as _asset,
  audioBufferCache as _audioBufferCache,
  audioBufferUncache as _audioBufferUncache,
  audioBufferClearCache as _audioBufferClearCache,
  imageCache as _imageCache,
  imageUncache as _imageUncache,
  imageClearCache as _imageClearCache,
  clearAllCaches as _clearAllCaches,
  cacheInServiceWorker as _cacheInServiceWorker,
  isInServiceWorkerCache as _isInServiceWorkerCache,
  getFromServiceWorkerCache as _getFromServiceWorkerCache,
  serializeAudioBuffer as _serializeAudioBuffer,
  deserializeAudioBuffer as _deserializeAudioBuffer,
  audioBufferSpace as _audioBufferSpace,
  screenshotSpace as _screenshotSpace,
  isIndexedDBAvailable as _isIndexedDBAvailable,
  storeAudioBufferPersistent as _storeAudioBufferPersistent,
  getAudioBufferPersistent as _getAudioBufferPersistent,
  removeAudioBufferPersistent as _removeAudioBufferPersistent,
  clearAudioBufferPersistent as _clearAudioBufferPersistent,
} from './engine/assets';

import {
  keyboardShortcut as _keyboardShortcut,
  registerListener as _registerListener,
  unregisterListener as _unregisterListener,
  runListener as _runListener,
} from './engine/input';

import {
  showAlert as _showAlert,
  dismissAlert as _dismissAlert,
  playAmbient as _playAmbient,
  stopAmbient as _stopAmbient,
  showMainScreen as _showMainScreen,
  showSplashScreen as _showSplashScreen,
  autoPlay as _autoPlay,
  distractionFree as _distractionFree,
  skip as _skip,
  showScreen as _showScreen,
  hideScreens as _hideScreens,
  resize as _resize,
  goBack as _goBack,
  displayInitialScreen as _displayInitialScreen,
} from './engine/ui';

import {
  gameObject as _gameObject,
  saveTo as _saveTo,
  resetGame as _resetGame,
  upgrade as _upgrade,
  setupStorage as _setupStorage,
  loadFromSlot as _loadFromSlot,
} from './engine/persistence';

import {
  assertAsync as _assertAsync,
  next as _next,
  previous as _previous,
  prepareAction as _prepareAction,
  revert as _revert,
  run as _run,
  proceed as _proceed,
  rollback as _rollback,
  shouldProceed as _shouldProceed,
  willProceed as _willProceed,
  stopTyping as _stopTyping,
  shouldRollback as _shouldRollback,
  willRollback as _willRollback,
} from './engine/lifecycle';

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

  // Save screenshot storage (IndexedDB, out-of-line keys; holds raw Blobs)
  static _screenshotSpace: Space | null = null;

  // Track IndexedDB availability: null = not checked, true = available, false = unavailable
  static _indexedDBAvailable: boolean | null = null;

  // Whether the developer has overridden the default onSaveScreenshot callback
  static _hasCustomSaveScreenshot = false;

  // Screenshot of the game screen captured when the save screen is opened, before
  // the game screen is hidden. Consumed by saveTo() for manual-save thumbnails.
  static _pendingScreenshot: Promise<Blob | null> | null = null;

  static Storage: StorageInterface = new Space () as unknown as StorageInterface;

  // Read a stored screenshot Blob into a data-URL string for display.
  private static _blobToDataURL (blob: Blob): Promise<string> {
    return new Promise ((resolve, reject) => {
      const reader = new FileReader ();
      reader.onload = () => resolve (reader.result as string);
      reader.onerror = () => reject (reader.error ?? new Error ('Failed to read screenshot blob'));
      reader.readAsDataURL (blob);
    });
  }

  // Screenshot callbacks with defaults. Override to customize screenshot storage.
  private static _onSaveScreenshot: (slotKey: string, blob: Blob) => Promise<string> = async (slotKey, blob) => {
    const key = `${slotKey}__screenshot`;
    const space = await Monogatari.screenshotSpace ();

    if (!space) {
      throw new Error ('Screenshot storage (IndexedDB) is unavailable');
    }

    await space.set (key, blob);

    return key;
  };

  static get onSaveScreenshot(): (slotKey: string, blob: Blob) => Promise<string> {
    return this._onSaveScreenshot;
  }

  static set onSaveScreenshot(callback: (slotKey: string, blob: Blob) => Promise<string>) {
    this._onSaveScreenshot = callback;

    this._hasCustomSaveScreenshot = true;
  }

  static onLoadScreenshot: (key: string) => Promise<string> = async (key) => {
    const space = await Monogatari.screenshotSpace ();

    if (!space) {
      return '';
    }

    try {
      const blob = await space.get (key) as Blob | null;

      return blob instanceof Blob ? await Monogatari._blobToDataURL (blob) : '';
    } catch {
      // Key not found / unreadable — fall back to the scene image.
      return '';
    }
  };

  static onDeleteScreenshot: (key: string) => Promise<void> = async (key) => {
    const space = await Monogatari.screenshotSpace ();

    if (!space) {
      return;
    }

    // A missing screenshot must not fail the save deletion it accompanies.
    try {
      await space.remove (key);
    } catch {
      // already gone
    }
  };

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
    textboxHidden: false,
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

    // When true, finishing a typing animation (e.g. clicking during text)
    // will instantly show all remaining text rather than fast-forwarding.
    'InstantText': false,

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
    'ExperimentalFeatures': false,

    // Enable screenshot capture for save slots. When true, save slots show a
    // screenshot of the game screen instead of just the scene/background image.
    // Requires IndexedDB adapter or custom onSaveScreenshot/onLoadScreenshot callbacks.
    'Screenshots': false
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

  static _upgrade: Record<string, { storage?: (oldData: unknown) => unknown; replaceStorage?: boolean }> = {};

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
    return translateString (this.asEngine (), key);
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
    return _assets (this.asEngine (), type, object);
  }

  static asset (type: string, name: string, value: string | null = null) {
    return _asset (this.asEngine (), type, name, value);
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
    return _audioBufferCache(this.asEngine(), key as string, buffer as AudioBuffer);
  }

  /**
   * Remove an AudioBuffer from the cache
   * @param key - Cache key to remove
   * @returns true if the key existed and was removed
   */
  static audioBufferUncache(key: string): boolean {
    return _audioBufferUncache(this.asEngine(), key);
  }

  /**
   * Clear AudioBuffer cache, optionally filtered by prefix
   * @param pattern - If provided, only clear keys starting with this pattern
   */
  static audioBufferClearCache(pattern?: string): void {
    return _audioBufferClearCache(this.asEngine(), pattern);
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
    return _imageCache(this.asEngine(), key as string, image as HTMLImageElement);
  }

  /**
   * Remove an HTMLImageElement from the cache
   * @param key - Cache key to remove
   * @returns true if the key existed and was removed
   */
  static imageUncache(key: string): boolean {
    return _imageUncache(this.asEngine(), key);
  }

  /**
   * Clear image cache, optionally filtered by prefix
   * @param pattern - If provided, only clear keys starting with this pattern
   */
  static imageClearCache(pattern?: string): void {
    return _imageClearCache(this.asEngine(), pattern);
  }

  /**
   * Clear all asset caches (audio and image)
   */
  static clearAllCaches(): void {
    return _clearAllCaches(this.asEngine());
  }

  // =========================================================================
  // Service Worker Communication
  // =========================================================================

  /**
   * Request the service worker to cache specified asset URLs
   * @param urls - Array of URLs to cache
   * @returns Promise resolving to cache result
   */
  static async cacheInServiceWorker(urls: string[]): Promise<{ success: boolean; cached?: number; total?: number; error?: string }> {
    return _cacheInServiceWorker(urls);
  }

  /**
   * Check if an asset URL is cached in the service worker
   * @param url - URL to check
   * @returns Promise resolving to whether the URL is cached
   */
  static async isInServiceWorkerCache(url: string): Promise<boolean> {
    return _isInServiceWorkerCache(url);
  }

  /**
   * Get cached raw data from service worker (for decoding)
   * @param url - URL of the cached asset
   * @returns Promise resolving to ArrayBuffer if found, undefined otherwise
   */
  static async getFromServiceWorkerCache(url: string): Promise<ArrayBuffer | undefined> {
    return _getFromServiceWorkerCache(url);
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
    return _serializeAudioBuffer(buffer);
  }

  /**
   * Reconstruct an AudioBuffer from serialized data
   * This is much faster than re-decoding from raw audio file
   */
  static deserializeAudioBuffer(
    data: { channels: ArrayLike<number>[]; sampleRate: number; length: number; numberOfChannels: number },
    audioContext: AudioContext
  ): AudioBuffer {
    return _deserializeAudioBuffer(data, audioContext);
  }

  /**
   * Get the persistent audio buffer Space instance (IndexedDB)
   * Lazily initialized on first access. Returns null if IndexedDB is unavailable.
   */
  static async audioBufferSpace(): Promise<Space | null> {
    return _audioBufferSpace(this.asEngine());
  }

  /**
   * Get the save screenshot Space instance (IndexedDB)
   * Lazily initialized on first access. Returns null if IndexedDB is unavailable.
   */
  static async screenshotSpace(): Promise<Space | null> {
    return _screenshotSpace(this.asEngine());
  }

  /**
   * Check if IndexedDB is available for audio caching
   * @returns true if available, false if not, null if not yet checked
   */
  static isIndexedDBAvailable(): boolean | null {
    return _isIndexedDBAvailable(this.asEngine());
  }

  /**
   * Store a decoded AudioBuffer in persistent storage (IndexedDB)
   * @param key - Cache key (e.g., 'music/theme')
   * @param buffer - AudioBuffer to store
   */
  static async storeAudioBufferPersistent(key: string, buffer: AudioBuffer): Promise<void> {
    return _storeAudioBufferPersistent(this.asEngine(), key, buffer);
  }

  /**
   * Retrieve a decoded AudioBuffer from persistent storage (IndexedDB)
   * @param key - Cache key (e.g., 'music/theme')
   * @returns The AudioBuffer if found, undefined otherwise
   */
  static async getAudioBufferPersistent(key: string): Promise<AudioBuffer | undefined> {
    return _getAudioBufferPersistent(this.asEngine(), key);
  }

  /**
   * Remove an AudioBuffer from persistent storage (IndexedDB)
   * @param key - Cache key to remove
   */
  static async removeAudioBufferPersistent(key: string): Promise<void> {
    return _removeAudioBufferPersistent(this.asEngine(), key);
  }

  /**
   * Clear all AudioBuffers from persistent storage (IndexedDB)
   */
  static async clearAudioBufferPersistent(): Promise<void> {
    return _clearAudioBufferPersistent(this.asEngine());
  }

  static characters (object: Record<string, Character> | null = null): Record<string, Character> {
    return _characters (this.asEngine (), object);
  }

  static character (id: string, object: Partial<Character> | null = null): Character | undefined {
    return _character (this.asEngine (), id, object);
  }

  static languageMetadata (language: string, object: { code?: string; icon?: string } | null = null): { code: string; icon: string } | Record<string, { code: string; icon: string }> | undefined {
    return _languageMetadata (this.asEngine (), language, object);
  }

  static translations (object: string | Record<string, Record<string, string>> | null = null): Record<string, string> | Record<string, Record<string, string>> | undefined {
    return _translations (this.asEngine (), object);
  }

  static translation (language: string, strings?: Record<string, string>): Record<string, string> {
    return _translation (this.asEngine (), language, strings);
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
    return _localize (this.asEngine ());
  }

  /**
   * Preload game assets
   */
  static preload () {
    // Check if asset preloading is enabled. Preloading will not be done in
    // electron or cordova since the assets are expected to be available
    // locally.
    const preloadEnabled = this.setting ('Preload') && !Platform.desktopApp && !Platform.cordova && location.protocol.indexOf ('file') < 0;

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
    return _translate (this.asEngine (), statement);
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
    return _replaceVariables (this.asEngine (), statement);
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
    return _saveTo(this.asEngine(), prefix, id, name);
  }

  static assertAsync (callable: (...args: unknown[]) => unknown, self: unknown = null, args: unknown[] | null = null): Promise<void> {
    return _assertAsync(this.asEngine(), callable, self, args);
  }

  static next (): Promise<void> {
    return _next(this.asEngine());
  }

  static previous (): Promise<void> {
    return _previous(this.asEngine());
  }

  static resetGame (): Promise<unknown[]> {
    return _resetGame(this.asEngine());
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
    return _keyboardShortcut (this.asEngine (), shortcut, callback);
  }

  static upgrade (oldVersion: string, newVersion: string, callbacks: { storage?: (oldData: unknown) => unknown; replaceStorage?: boolean }): void {
    return _upgrade(this.asEngine(), oldVersion, newVersion, callbacks);
  }

  static setupStorage (): void {
    return _setupStorage(this.asEngine());
  }

  static registerListener (name: string, listener: { keys?: string | string[]; callback: (this: VisualNovelEngine, event: Event, element: DOM) => unknown }, replace = false): void {
    return _registerListener (this.asEngine (), name, listener, replace);
  }

  static unregisterListener (name: string): void {
    return _unregisterListener (this.asEngine (), name);
  }

  static async runListener (name: string, event: Event | null = null, element: DOM | null = null): Promise<void> {
    return _runListener (this.asEngine (), name, event, element);
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
    return _gameObject(this.asEngine());
  }

  static prepareAction(statement: string, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
  static prepareAction(statement: Record<string, unknown>, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
  static prepareAction(statement: string | Record<string, unknown>, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
  static prepareAction (statement: unknown, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null {
    return _prepareAction(this.asEngine(), statement as string | Record<string, unknown>, { cycle, extras });
  }

  static async revert (statement: unknown = null, shouldAdvance = true, shouldStepBack = true): Promise<{ advance: boolean; step: boolean } | void> {
    return _revert(this.asEngine(), statement, shouldAdvance, shouldStepBack);
  }

  static async run (statement: unknown, shouldAdvance = true): Promise<{ advance: boolean }> {
    return _run(this.asEngine(), statement, shouldAdvance);
  }

  static alert (id: string, options: Record<string, unknown>): void {
    return _showAlert(this.asEngine(), id, options);
  }

  static dismissAlert (id: string | null = null): void {
    return _dismissAlert(this.asEngine(), id);
  }

  /**
   * @static loadFromSlot - Load a slot from the storage. This will recover the
   * state of the game from what was saved in it.
   *
   * @param {string} slot - The key with which the slot was saved on the storage
   */
  static loadFromSlot (slot: string): Promise<void> {
    return _loadFromSlot(this.asEngine(), slot);
  }

  static async proceed ({ userInitiated = false, skip = false, autoPlay = false } = {}): Promise<void> {
    return _proceed(this.asEngine(), { userInitiated, skip, autoPlay });
  }

  static async rollback (): Promise<void> {
    return _rollback(this.asEngine());
  }

  static shouldProceed ({ userInitiated = false, skip = false, autoPlay = false }): Promise<unknown[]> {
    return _shouldProceed(this.asEngine(), { userInitiated, skip, autoPlay });
  }

  static willProceed (): Promise<unknown[]> {
    return _willProceed(this.asEngine());
  }

  static stopTyping (component: TypeWriterComponent): void {
    return _stopTyping(this.asEngine(), component);
  }

  static shouldRollback (): Promise<unknown[]> {
    return _shouldRollback(this.asEngine());
  }

  static willRollback (): Promise<unknown[]> {
    return _willRollback(this.asEngine());
  }

  /**
   * @static playAmbient - Play the main menu music using the key defined in the
   * 'MainScreenMusic' property of the game settings.
   */
  static playAmbient (): void {
    return _playAmbient(this.asEngine());
  }

  // Stop the main menu's music
  static stopAmbient (): void {
    return _stopAmbient(this.asEngine());
  }

  // Start game automatically without going trough the main menu
  static showMainScreen (): void {
    return _showMainScreen(this.asEngine());
  }

  static showSplashScreen (): void {
    return _showSplashScreen(this.asEngine());
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
    return _autoPlay(this.asEngine(), enable);
  }

  /**
   * @static distractionFree - Enable or disable the distraction free mode
   * where the dialog box is hidden so that the player can look at the characters
   * and background with no other elements on the way. A 'transparent' class
   * is added to the quick menu when this mode is enabled.
   */
  static distractionFree (): void {
    return _distractionFree(this.asEngine());
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
        if (!Platform.desktopApp && !Platform.cordova && Platform.serviceWorkers) {
          if (window.location.protocol === 'file:') {
            console.warn ('Service Workers are not available when opening the index.html file directly in your browser. Service Workers are available only when serving your files through a server, once you upload your game this warning will go away. You can also try using a simple server like this one for development: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb/.');
          } else {
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
            }).catch ((error) => {
              console.warn ('Failed to register Service Worker:', error.message);
            });
          }
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
    return _skip(this.asEngine(), enable);
  }

  static showScreen (screen: string): void {
    return _showScreen(this.asEngine(), screen);
  }

  static hideScreens (): void {
    return _hideScreens(this.asEngine());
  }

  static resize (_element: unknown, proportionWidth: number, proportionHeight: number): void {
    return _resize(this.asEngine(), _element, proportionWidth, proportionHeight);
  }

  static goBack (event: Event, selector: string): void {
    return _goBack(this.asEngine(), event, selector);
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
        // Prevent action clicks from bubbling to the game-screen's proceed handler
        event.stopPropagation ();
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
        this.parentElement().addClass('forceAspectRatio');
        break;

      default:
        forceAspectRatioFlag = false;
    }

    if (forceAspectRatioFlag) {
      const aspectRatio = this.setting ('AspectRatio') as string;
      const [w, h] = aspectRatio.split (':');
      const proportionWidth = parseInt(w);
      const proportionHeight = parseInt(h);
      if (!(Platform.desktopApp && forceAspectRatio === 'Global')) {
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
    let element: HTMLElement | DOM | null;
    let exists: boolean;

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

  static displayInitialScreen (): void {
    return _displayInitialScreen(this.asEngine());
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
      init.push (component.init (selector));
    }

    for (const action of this.actions ()) {
      init.push (action.init (selector));
    }

    if (this.setting ('AutoSave') !== 0 && typeof this.setting ('AutoSave') === 'number') {
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
