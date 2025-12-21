import type { DOM } from '@aegis-framework/artemis';
import type { Component as PandoraComponent } from '@aegis-framework/pandora';
import type Monogatari from '../../monogatari';
import type { Configuration } from './index';
import type { VisualNovelEngine } from './Monogatari';

/**
 * Base static interface that extends Pandora's Component class type.
 * This ensures compatibility with Registry.register() which expects ComponentClass.
 */
type PandoraComponentClass = typeof PandoraComponent;

/**
 * Interface representing the static side of a Component or ShadowComponent class.
 * This includes all static properties and methods that exist on the class itself.
 *
 * Extends the static properties from Pandora's Component class.
 */
export interface StaticComponent extends PandoraComponentClass {
  /**
   * The tag name used for this custom element.
   */
  tag: string;

  /**
   * Marks the component as experimental (not stable for production use).
   */
  _experimental: boolean;

  /**
   * Configuration object for component-specific settings and assets.
   * Subclasses should declare their own `static _configuration = {}` to avoid sharing state.
   */
  _configuration: Configuration;

  /**
   * Priority level for component initialization order.
   */
  _priority: number;

  /**
   * Reference to the Monogatari engine (set by engine on registration).
   */
  engine: VisualNovelEngine;

  // ===== Configuration =====

  /**
   * Access or update the component's configuration object.
   * @param object - Object to merge with config, string key to access, or null for entire config
   * @returns The configuration or a specific property value
   */
  configuration: (object?: string | Configuration | null) => Configuration | unknown;

  // ===== DOM Queries =====

  /**
   * Get all instances of this component as an Artemis DOM collection.
   * @returns DOM collection of all component instances
   */
  all: () => DOM;

  /**
   * Get a specific instance by ID.
   * @param id - The instance ID to find
   * @returns DOM element matching the ID
   */
  get: (id: string) => DOM;

  /**
   * Get all instances, optionally iterating with a callback.
   * @param callback - Optional callback to execute for each instance
   * @returns DOM collection of instances
   */
  instances: (callback?: ((instance: ComponentInstance) => void) | null) => DOM;

  // ===== Mounting Cycle =====

  /**
   * Setup phase - First step of the Mounting cycle.
   * Register variables, add HTML contents, set up configuration and state variables.
   * @param selector - Optional CSS selector with which Monogatari was initialized
   */
  setup: (selector?: string) => Promise<void>;

  /**
   * Bind phase - Second step of the Mounting cycle.
   * Bind event listeners and perform DOM operations after setup.
   * @param selector - Optional CSS selector with which Monogatari was initialized
   */
  bind: (selector?: string) => Promise<void>;

  /**
   * Init phase - Final step of the Mounting cycle.
   * Perform final operations after setup and binding.
   * @param selector - Optional CSS selector with which Monogatari was initialized
   */
  init: (selector?: string) => Promise<void>;

  // ===== Game Event Listeners =====

  /**
   * Called when the game starts.
   */
  onStart: () => Promise<void>;

  /**
   * Called when a game is loaded. Useful for restoring state.
   */
  onLoad: () => Promise<void>;

  /**
   * Called when a game is saved.
   */
  onSave: () => Promise<void>;

  /**
   * Reset all instances of this component. Called when a game ends or before a new game loads.
   * @returns Promise resolving to array of reset results from each instance
   */
  onReset: () => Promise<void[]>;

  // ===== Proceed/Rollback Hooks =====

  /**
   * Check if it's okay to proceed to the next statement (checks all instances).
   * @param options - Proceed context options
   * @returns Promise resolving if proceeding is allowed
   */
  shouldProceed: (options?: { userInitiated?: boolean; skip?: boolean; autoPlay?: boolean }) => Promise<void[] | void>;

  /**
   * Called after shouldProceed passes (notifies all instances).
   * @returns Promise resolving to array of results from each instance
   */
  willProceed: () => Promise<void[]>;

  /**
   * Check if it's okay to go back to the previous statement (checks all instances).
   * @returns Promise resolving if rollback is allowed
   */
  shouldRollback: () => Promise<void[]>;

  /**
   * Called after shouldRollback passes (notifies all instances).
   * @returns Promise resolving to array of results from each instance
   */
  willRollback: () => Promise<void[]>;
}

/**
 * Interface representing an instance of a Component or ShadowComponent.
 * This includes all instance properties and methods.
 */
export interface ComponentInstance extends PandoraComponent {
  /**
   * Parent component reference.
   */
  _parent?: PandoraComponent;

  /**
   * Reference to the Monogatari engine.
   */
  engine: VisualNovelEngine;

  // ===== DOM Methods =====

  /**
   * Returns this component's element as an Artemis DOM instance.
   * @returns Artemis DOM instance wrapping this element
   */
  element: () => DOM;

  /**
   * Remove this component from the DOM.
   */
  remove: () => void;

  /**
   * Find an instance by ID within this component type.
   * @param id - The instance ID to find
   * @returns Artemis DOM instance with the found element
   */
  instance: (id: string) => DOM;

  /**
   * Get or set the parent component.
   * @param component - If provided, sets the parent; otherwise returns the current parent
   * @returns The parent component if getting, void if setting
   */
  parent: (component?: PandoraComponent) => PandoraComponent | undefined | void;

  /**
   * Attempts to find a content element inside this component.
   * For Component: searches light DOM
   * For ShadowComponent: searches shadow DOM
   * @param name - Name of the content element to find
   * @returns Artemis DOM instance with the found elements
   */
  content: (name: string) => DOM;

  // ===== Lifecycle Methods =====

  /**
   * Called when the component is connected to the DOM.
   */
  connectedCallback: () => Promise<void>;

  /**
   * Reset this instance's state.
   */
  onReset: () => Promise<void>;

  // ===== Proceed/Rollback Hooks =====

  /**
   * Check if it's okay to proceed (instance-level check).
   */
  shouldProceed: () => Promise<void>;

  /**
   * Respond to game proceeding (instance-level handler).
   */
  willProceed: () => Promise<void>;

  /**
   * Check if it's okay to go back (instance-level check).
   */
  shouldRollback: () => Promise<void>;

  /**
   * Respond to game reverting (instance-level handler).
   */
  willRollback: () => Promise<void>;
}
