/**
 * Monogatari Type Definitions
 */

import type { DOM, EventCallback } from '@aegis-framework/artemis';
import type { Component as ComponentBase } from '@aegis-framework/pandora';
import type Monogatari from '../../monogatari';
import type ActionInstance from '../Action';
import type TimerDisplayComponent from './../../components/timer-display';
/**
 * Generic configuration object type
 */
export type Configuration = Record<string, unknown>;

// ============================================================================
// State and History Type Registry
// ============================================================================
// These interfaces define the types for state and history values.
// External users can extend these via TypeScript declaration merging:
//
// declare module '@monogatari/core' {
//   interface StateMap {
//     myCustomState: MyCustomType;
//   }
//   interface HistoryMap {
//     myCustomHistory: MyCustomHistoryItem[];
//   }
// }
// ============================================================================

/**
 * Media state item for music, sound, and voice
 */
export interface MediaStateItem {
  statement: string;
  paused: boolean;
}

/**
 * Character history item
 */
export interface CharacterHistoryItem {
  statement: string;
  previous: string | null;
}

/**
 * Character layer history item
 */
export interface CharacterLayerHistoryItem {
  parent: string | null;
  layers: Array<{
    statement: string | null;
    previous: string | null;
  }>;
}

/**
 * Scene state item saved in sceneState history
 */
export interface SceneStateItem {
  characters: string[];
  images: string[];
  textBoxMode?: string;
}

/**
 * Label history item for jump tracking
 */
export interface LabelHistoryItem {
  label: string;
  step: number;
}

/**
 * Jump history item for tracking label jumps during revert
 */
export interface JumpHistoryItem {
  source: {
    label: string;
    step: number;
  };
  destination: {
    label: string;
    step: number;
  };
}

/**
 * Media type union for Play/Stop/Pause actions
 */
export type MediaType = 'music' | 'sound' | 'voice';

/**
 * State registry - maps state keys to their value types.
 * Extend this interface via declaration merging to add custom state keys.
 */
export interface StateMap {
  // Core engine state
  step: number;
  label: string;

  // Media state (Play/Stop/Pause actions)
  music: MediaStateItem[];
  sound: MediaStateItem[];
  voice: MediaStateItem[];

  // Scene/Background state
  scene: string;
  background: string;

  // Character state
  characters: string[];
  characterLayers: string[];

  // Image state
  images: string[];

  // Particles state
  particles: string;

  // Video state
  videos: string[];

  // Canvas state
  canvas: string[];

  // Index signature for extension and backward compatibility
  [key: string]: unknown;
}

/**
 * Media history item - can be either a statement string (from Play) or
 * an array of MediaStateItem (from Stop when stopping all media)
 */
export type MediaHistoryItem = string | MediaStateItem[];

// ============================================================================
// Globals Type Registry
// ============================================================================
// This interface defines the types for global runtime values.
// External users can extend via TypeScript declaration merging:
//
// declare module '@monogatari/core' {
//   interface GlobalsMap {
//     myCustomGlobal: MyCustomType;
//   }
// }
// ============================================================================

/**
 * Typed.js configuration object for dialog typing animation
 */
export interface TypedConfiguration {
  strings?: string[];
  typeSpeed?: number;
  [key: string]: unknown;
}

/**
 * Globals registry - maps global keys to their value types.
 * Extend this interface via declaration merging to add custom global keys.
 */
export interface GlobalsMap {
  // Game flow state
  playing: boolean;
  block: boolean;
  finished_typing: boolean;
  distraction_free: boolean;
  on_splash_screen: boolean;

  // Engine internal state
  _restoring_state: boolean;
  _engine_block: boolean;
  _executing_sub_action: boolean;
  _didSetup: boolean;
  _didBind: boolean;
  _didInit: boolean;
  _first_run: boolean;

  // Auto-play / Skip
  _auto_play_timer: ReturnType<typeof setTimeout> | (() => void) | null;
  skip: ReturnType<typeof setTimeout> | null;

  // Auto-save
  _auto_save_interval: ReturnType<typeof setInterval> | null;
  current_auto_save_slot: number;

  // Storage
  storageStructure: string;

  // Save/Load screen
  delete_slot: string | null;

  typedConfiguration: TypedConfiguration;
  _dialog_pending_revert: boolean;
  _should_restore_nvl: boolean;

  // Scene state
  _scene_history_cleared_by_background: boolean;

  // Input modal state - timer_display is an HTMLElement with custom props
  _InputTimer: TimerDisplayComponent | null;
  _input_just_rolled_back: boolean;

  // Choice state
  _CurrentChoice: unknown[];
  _ChoiceTimer: unknown[];
  _choice_pending_rollback: boolean[];
  _choice_just_rolled_back: boolean[];

  // Index signature for extension and backward compatibility
  [key: string]: unknown;
}

/**
 * History registry - maps history keys to their array element types.
 * Extend this interface via declaration merging to add custom history keys.
 */
export interface HistoryMap {
  // Core engine history
  label: LabelHistoryItem[];

  // Media history - can contain strings or state arrays (from stop all)
  music: MediaHistoryItem[];
  sound: MediaHistoryItem[];
  voice: MediaHistoryItem[];

  // Scene/Background history
  scene: string[];
  background: string[];
  sceneElements: string[][];
  sceneState: SceneStateItem[];

  // Character history
  character: CharacterHistoryItem[];
  characterLayer: CharacterLayerHistoryItem[];

  // Image history
  image: string[];

  // Particles history
  particle: string[];

  // Video history
  video: string[];

  // Canvas history
  canvas: string[];

  // Dialog history
  nvl: string[];
  clear: string[];

  // Choice history
  choice: string[];

  // Jump history (for tracking label jumps during revert)
  jump: JumpHistoryItem[];

  // Index signature for extension and backward compatibility
  [key: string]: unknown[];
}

/**
 * Character definition
 */
export interface Character {
  name?: string;
  color?: string;
  directory?: string;
  sprites?: Record<string, string>;
  expressions?: Record<string, string>;
  default_expression?: string;
  type_animation?: boolean;
  nvl?: boolean;
  layer_assets?: Record<string, Record<string, string>>;
  // Legacy property names (for backwards compatibility)
  Name?: string;
  Color?: string;
  Directory?: string;
  Images?: Record<string, string>;
  Face?: string;
  Side?: Record<string, string>;
  TypeAnimation?: boolean;
}

/**
 * Error properties for FancyError display
 */
export interface FancyErrorProps {
  [key: string]: unknown;
}

/**
 * Queued error object
 */
export interface QueuedError {
  id: string;
  title: string;
  message: string;
  props: FancyErrorProps;
}

/**
 * Button definition for menu components
 */
export interface MenuButton {
  string: string;
  icon: string;
  element?: string;
  data?: Record<string, string>;
}

/**
 * Action application result
 */
export interface ActionApplyResult {
  advance?: boolean;
  updateHistory?: boolean;
  updateState?: boolean;
}

/**
 * Action revert result
 */
export interface ActionRevertResult {
  advance: boolean;
  step: boolean;
}

/**
 * Action run context
 */
export interface ActionRunContext {
  advance: boolean;
}

/**
 * Action revert context
 */
export interface ActionRevertContext {
  advance: boolean;
  step: boolean;
}

/**
 * Save slot object
 */
export interface SaveSlot {
  key: string;
  value: Record<string, unknown>;
}

/**
 * Legacy save data format (v1.4.1 and earlier)
 */
export interface LegacySaveData {
  Engine?: {
    Step: number;
    Label: string;
    Scene: string;
    Song?: string;
    Sound?: string;
    Particles?: string;
    MusicHistory: string[];
    SoundHistory: string[];
    ImageHistory: string[];
    CharacterHistory: string[];
    SceneHistory: string[];
    SceneElementsHistory: string[][];
    ParticlesHistory: string[];
  };
  Show?: string;
  Storage?: Record<string, unknown>;
  game?: SaveGameData;
}

/**
 * Current save game data format
 */
export interface SaveGameData {
  state: Record<string, unknown>;
  history: Record<string, unknown[]>;
  storage: Record<string, unknown>;
}

/**
 * Audio effect configuration
 */
export interface AudioEffectConfig {
  id: string;
  description: string;
  params: string[];
  create: (audioContext: AudioContext, params: Record<string, unknown>) => AudioNode | AudioEffectResult;
}

/**
 * Complex audio effect result
 */
export interface AudioEffectResult {
  node: AudioNode;
  stop?: () => void;
  disconnect?: () => void;
}

/**
 * Audio player options
 */
export interface AudioPlayerOptions {
  outputNode?: GainNode | null;
  effects?: Record<string, Record<string, unknown>>;
  loop?: boolean;
  paused?: boolean;
}

export type Constructor<T = object> = new (...args: any[]) => T;


export type StaticMonogatariComponent = typeof ComponentBase & {
  tag: string;
  engine: typeof Monogatari;
  _experimental: boolean;
  _configuration: Configuration;
  _priority: number;

  // Lifecycle static methods
  setup: (...args: unknown[]) => Promise<void>;
  bind: (selector?: string) => Promise<void>;
  init: (...args: unknown[]) => Promise<void>;
  onStart: () => Promise<void>;
  onLoad: () => Promise<void>;
  onSave: () => Promise<void>;
  onReset: () => Promise<unknown[]>;

  // Proceed/Rollback hooks
  shouldProceed: (options?: { userInitiated?: boolean; skip?: boolean; autoPlay?: boolean }) => Promise<void[] | void>;
  willProceed: () => Promise<unknown[]>;
  shouldRollback: () => Promise<unknown[] | void>;
  willRollback: () => Promise<unknown[] | void>;

  // Constructor - uses HTMLElement as base to be compatible with all component types
  new (...args: any[]): HTMLElement;
}

/**
 * Type for Action class constructors (not instances)
 */


/**
 * Listener definition for game events
 */
export interface GameListener {
  name: string;
  keys?: string | string[];
  callback: (...args: unknown[]) => unknown;
}

/**
 * Monogatari engine interface (forward declaration)
 * This is a comprehensive interface that matches the Monogatari class implementation
 */
export interface MonogatariEngine {
  // Configuration methods
  configuration: (key?: string | Record<string, unknown>, object?: Record<string, unknown>) => unknown;
  setting: (key: string, value?: unknown) => unknown;
  preference: (key: string, value?: unknown) => unknown;
  preferences: (object?: Record<string, unknown>, save?: boolean) => Record<string, unknown> | undefined;

  // DOM methods - element() returns DOM by default, HTMLElement only when pure=true
  element: {
    (): DOM;
    (pure: true, handled?: boolean): HTMLElement | null;
    (pure: false, handled?: boolean): DOM;
    (pure?: boolean, handled?: boolean): DOM | HTMLElement | null;
  };
  on: (event: string, target: string | EventCallback, callback?: EventCallback) => DOM | MonogatariEngine;
  off: (event: string, callback: EventCallback) => DOM | MonogatariEngine;
  trigger: (event: string, detail?: Record<string, unknown>) => void;
  all: () => DOM;
  instances: () => DOM;

  // Listener/Action registration
  registerListener: (name: string, listener: Partial<GameListener>, replace?: boolean) => void;
  unregisterListener: (name: string) => void;
  registerAction: (action: ActionInstance, naturalPosition?: boolean) => void;
  unregisterAction: (action: string) => void;

  // Audio methods
  playAmbient: () => void;
  stopAmbient: () => void;

  // Global state
  global: (key: string, value?: unknown) => unknown;
  globals: (obj?: Record<string, unknown>) => Record<string, unknown>;

  // History and state
  history: {
    (): Record<string, unknown[]>;
    (key: string): unknown[];
    (object: Record<string, unknown[]>): void;
  };
  state: {
    (): Record<string, unknown>;
    (key: string): Array<unknown>;
    (object: Record<string, unknown>): Record<string, unknown>;
  };

  // Component/Action access
  component: (name: string) => StaticMonogatariComponent | undefined;
  action: (id: string) => ActionInstance | undefined;
  actions: () => ActionInstance[];
  components: () => StaticMonogatariComponent[];

  // Character and asset access
  character: (id: string, object?: Record<string, unknown>) => unknown;
  characters: (object?: Record<string, unknown>) => Record<string, unknown>;
  asset: (type: string, name: string, value?: unknown) => string | undefined;
  assets: (type?: string, object?: Record<string, string>) => Record<string, Record<string, string>> | Record<string, string> | undefined;

  // Media player methods
  mediaPlayers: (type?: string, object?: boolean) => Record<string, Record<string, unknown>> | unknown[] | Record<string, unknown>;
  mediaPlayer: (type: string, key: string, value?: unknown) => unknown;
  removeMediaPlayer: (type: string, key?: string) => void;

  // Script methods
  script: (object?: string | Record<string, unknown>) => unknown;
  label: {
    (): unknown[];
    (key: string): unknown;
  };
  $: (name: string, value?: unknown) => unknown;

  // Game flow
  prepareAction: (statement: unknown, options: { cycle: string; extras?: Record<string, unknown> }) => ActionInstance;
  run: (statement: unknown, advance?: boolean) => Promise<{ advance: boolean }>;
  revert: (statement?: unknown, shouldAdvance?: boolean, shouldStepBack?: boolean) => Promise<{ advance: boolean; step: boolean } | void>;
  proceed: (options?: { userInitiated?: boolean; skip?: boolean; autoPlay?: boolean }) => Promise<void>;
  rollback: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;

  // Text processing
  replaceVariables: (statement: string) => string;
  translate: (statement: string) => string;
  string: (key: string) => string | undefined;
  localize: () => void;

  // Typing control
  stopTyping: (component: unknown) => void;

  // UI methods
  alert: (id: string, options: Record<string, unknown>) => void;
  dismissAlert: (id?: string) => void;
  hideScreens: () => void;
  showScreen: (name: string) => void;
  showMainScreen: () => void;
  distractionFree: () => void;

  // Game lifecycle
  resetGame: () => Promise<unknown[]>;
  saveTo: (prefix?: string, id?: number | null, name?: string | null) => Promise<unknown> | undefined;
  loadFromSlot: (slot: string) => Promise<void>;
  assertAsync: (callable: (...args: unknown[]) => unknown, self?: unknown, args?: unknown[] | null) => Promise<void>;

  // Utility methods
  random: (min: number, max: number) => number;
  width: () => number;
  height: () => number;

  // Debug
  debug: {
    log: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    trace: () => void;
    groupCollapsed: (label: string) => void;
    groupEnd: (label?: string) => void;
  };

  // Properties
  ambientPlayer: HTMLAudioElement | null;
  audioContext?: AudioContext;
  _languageMetadata: Record<string, { code: string; icon: string }>;
}

export * from './Action';
export * from './GameSettings';
export * from './PlayerPreferences';