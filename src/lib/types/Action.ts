import type { Configuration } from './index';
import type { SaveSlot } from './index';
import type { ActionRunContext } from './index';
import type { ActionRevertContext } from './index';
import type { ActionApplyResult } from './index';
import type { ActionRevertResult } from './index';
import type { VisualNovelEngine } from './Monogatari';

/**
 * Interface representing the static side of an Action class.
 * This includes all static properties and methods that exist on the class itself.
 */
export interface StaticAction {
  /**
   * Unique identifier for the action. Used to access, remove, or register actions.
   */
  id: string;

  /**
   * Marks the action as experimental (not stable for production use).
   */
  _experimental: boolean;

  /**
   * Configuration object for action-specific settings and assets.
   * Subclasses should declare their own `static _configuration = {}` to avoid sharing state.
   */
  _configuration: Configuration;

  /**
   * Loading order used to sort actions when a game is loaded.
   * Useful for actions with dependencies between themselves.
   */
  loadingOrder: number;

  /**
   * Whether this action is currently blocking the game from proceeding.
   * Used as a per-action alternative to the deprecated global block.
   */
  blocking: boolean;

  /**
   * Reference to the Monogatari engine (set by engine on registration).
   */
  engine: VisualNovelEngine;

  // ===== Configuration =====

  /**
   * Access or update the action's configuration object.
   * @param object - Object to merge with config, string key to access, or null for entire config
   * @returns The configuration or a specific property value
   */
  configuration: (object?: string | Configuration | null) => Configuration | unknown;

  // ===== Mounting Cycle =====

  /**
   * Setup phase - First step of the Mounting cycle.
   * Register variables, histories, state variables, or add HTML contents.
   * @param selector - CSS selector with which Monogatari was initialized
   */
  setup: (selector?: string) => Promise<void>;

  /**
   * Bind phase - Second step of the Mounting cycle.
   * Bind event listeners or perform DOM operations after setup.
   * @param selector - CSS selector with which Monogatari was initialized
   */
  bind: (selector?: string) => Promise<void>;

  /**
   * Init phase - Final step of the Mounting cycle.
   * Perform final operations after setup and binding.
   * @param selector - CSS selector with which Monogatari was initialized
   */
  init: (selector?: string) => Promise<void>;

  // ===== Game Event Listeners =====

  /**
   * Called when the game starts.
   */
  onStart: () => Promise<void>;

  /**
   * Called when a game is loaded. Useful for restoring state (showing images, playing media, etc.).
   */
  onLoad: () => Promise<void>;

  /**
   * Called when a game is saved.
   * @param slot - The slot object that has just been saved
   */
  onSave: (slot?: SaveSlot) => Promise<void>;

  /**
   * Reset the action to its initial state. Called when a game ends or before a new game loads.
   * Subclasses may accept options (e.g., Dialog accepts { keepNVL, saveNVL }).
   * @param options - Optional reset options (subclass-specific)
   */
  reset: (options?: unknown) => Promise<void>;

  // ===== Proceed/Rollback Hooks =====

  /**
   * Check if it's okay to proceed to the next statement.
   * @param options - Proceed context options
   * @returns Resolved if proceeding is allowed, rejected otherwise
   */
  shouldProceed: (options?: { userInitiated?: boolean; skip?: boolean; autoPlay?: boolean }) => Promise<void>;

  /**
   * Called after shouldProceed passes. Respond to the game proceeding.
   */
  willProceed: () => Promise<void>;

  /**
   * Check if it's okay to go back to the previous statement.
   * @returns Resolved if rollback is allowed, rejected otherwise
   */
  shouldRollback: () => Promise<void>;

  /**
   * Called after shouldRollback passes. Respond to the game reverting.
   */
  willRollback: () => Promise<void>;

  // ===== Matching Methods =====

  /**
   * Reserved for future use.
   * @param statement - Statement to match
   * @returns Whether the action matches the statement
   */
  match: (statement: unknown) => boolean;

  /**
   * Match a string statement (split into array by spaces).
   * @param statement - The statement split into an array by spaces
   * @returns Whether the action matches the statement
   */
  matchString: (statement: string[]) => boolean;

  /**
   * Match an object (JSON) statement.
   * @param statement - The object statement to match
   * @returns Whether the action matches the statement
   */
  matchObject: (statement: Record<string, unknown>) => boolean;

  // ===== Run/Revert Hooks =====

  /**
   * Called before an action is run.
   * @param context - The run context
   */
  beforeRun: (context: ActionRunContext) => Promise<void>;

  /**
   * Called after an action is run.
   * @param context - The run context
   */
  afterRun: (context: ActionRunContext) => Promise<void>;

  /**
   * Called before an action is reverted.
   * @param context - The revert context
   */
  beforeRevert: (context: ActionRevertContext) => Promise<void>;

  /**
   * Called after an action is reverted.
   * @param context - The revert context
   */
  afterRevert: (context: ActionRevertContext) => Promise<void>;

  // ===== Constructor =====

  /**
   * Constructor - permissive to allow various action constructor signatures.
   * String statements are received as arrays of words split by spaces.
   * The actual type is typically `string[] | Record<string, unknown>`, but we use
   * a permissive signature to accommodate different action implementations.
   */
  new (...args: unknown[]): ActionInstance;
}

/**
 * Interface representing an instance of an Action.
 * This includes all instance properties and methods.
 */
export interface ActionInstance {
  /**
   * The original statement this action was instantiated with.
   */
  _statement: string | string[] | Record<string, unknown> | ((...args: unknown[]) => unknown) | undefined;

  /**
   * Current cycle: 'Application' or 'Revert'.
   */
  _cycle: 'Application' | 'Revert' | undefined;

  /**
   * Extra context passed to the action.
   */
  _extras: Record<string, unknown> | undefined;

  /**
   * Context reference (usually the Monogatari class).
   * @deprecated Use the engine property instead.
   */
  context: VisualNovelEngine | undefined;

  /**
   * Reference to the Monogatari engine.
   */
  engine: VisualNovelEngine;

  // ===== Context/Statement Setters =====

  /**
   * Set the context (Monogatari class) for this action.
   * @deprecated Use the engine property instead.
   * @param context - The Monogatari class
   */
  setContext: (context: VisualNovelEngine) => void;

  /**
   * Set the original statement that this action was run with.
   * Called automatically by Monogatari after instantiation.
   * @param statement - The statement with which the action was run.
   */
  _setStatement: (statement: string | Record<string, unknown> | ((...args: unknown[]) => unknown)) => void;

  /**
   * Set the current cycle the action is performing.
   * @param cycle - The current lifecycle phase
   */
  _setCycle: (cycle: 'Application' | 'Revert') => void;

  /**
   * Set extra context information for the action.
   * @param extras - Additional information to pass to the action
   * @returns The extras object
   */
  setExtras: (extras: Record<string, unknown>) => Record<string, unknown>;

  // ===== Application Cycle =====

  /**
   * Called before the action is applied. Return rejected promise to interrupt the cycle.
   */
  willApply: () => Promise<void>;

  /**
   * Apply the action - this is where core action logic goes.
   * Subclasses may accept options (e.g., for updateLog, updateHistory, updateState).
   * @param options - Optional apply options (subclass-specific)
   */
  apply: (options?: { updateLog?: boolean; updateHistory?: boolean; updateState?: boolean }) => Promise<void>;

  /**
   * Called after the action was applied. Useful for cleanup operations.
   * @param options - Options for history/state updates
   * @returns Object indicating whether to advance to next statement
   */
  didApply: (options?: { updateHistory?: boolean; updateState?: boolean }) => Promise<ActionApplyResult>;

  // ===== Revert Cycle =====

  /**
   * Called before the action is reverted. Return rejected promise to interrupt the cycle.
   */
  willRevert: () => Promise<void>;

  /**
   * Revert the action - undo changes made during apply.
   */
  revert: () => Promise<void>;

  /**
   * Called after the action was reverted. Useful for cleanup operations.
   * @returns Object indicating whether to go to previous statement
   */
  didRevert: () => Promise<ActionRevertResult>;

  // ===== Other =====

  /**
   * Interrupt the action while it's still running (e.g., interrupt typing animation).
   */
  interrupt: () => Promise<void>;
}
