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
 * Globals registry - maps global keys to their value types.
 * Extend this interface via declaration merging to add custom global keys.
 *
 * TODO: Actions should use their own fields instead of globals
 */
export interface GlobalsMap {
  // Game flow state
  playing: boolean;

  /**
   * @deprecated Each action should use its `blocking` attribute
   */
  block: boolean;
  finished_typing: boolean;
  distraction_free: boolean;
  on_splash_screen: boolean;

  // Engine internal state
  _restoring_state: boolean;
  _engine_block: boolean;
  /**
   * @deprecated Each action should use its `blocking` attribute
   */
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

  // Conditional state
  _conditional_pending_rollback: boolean[];
  _conditional_just_rolled_back: boolean[];

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
 * Error template for registered errors
 */
export interface ErrorTemplate {
  title: string;
  message: string;
  props: FancyErrorProps;
}

/**
 * Context object for error template interpolation
 */
export interface ErrorContext {
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
  volume?: number;
}

export type Constructor<T = object> = new (...args: any[]) => T;

export * from './Action';
export * from './Component';
export * from './GameSettings';
export * from './PlayerPreferences';
export * from './Monogatari';
export * from './TypeWriterEffects';