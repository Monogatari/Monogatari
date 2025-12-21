import { $_, DOM } from '@aegis-framework/artemis';
import { Component as PandoraComponent, Properties } from '@aegis-framework/pandora';
import type { Configuration } from './types';
import type Monogatari from '../monogatari';

/**
 * A component represents an object or content in the game such as screens, menus
 * and all other visual or structural elements.
 *
 * The life cycle of an component follows the Mounting cycle for actions.
 *
 * The mounting cycle has 3 steps:
 *
 * 1. Setup - Here the action needs to set up everything it will need for working
 *            generally, in this section a component will generally add its HTML
 *            content to the global Monogatari object and will set up any needed
 *            configuration or state variables.
 *
 * 2. Bind - Once the component has been setup, its time to bind all the necessary
 *           event listeners or perform more operations on the DOM once all elements
 *           have been setup. Components will generally bind all the listeners needed
 *           for their inner elements to work correctly.
 *
 * 3. Init - Finally, once the component was setup and it performed all the needed
 *           bindings, it may start performing its operations and perform all
 *          further needed operations.
 *
 * @class Component
 * @template P - The type of the component's props (defaults to Properties)
 * @template S - The type of the component's state (defaults to Properties)
 */
class Component<P extends Properties = Properties, S extends Properties = Properties> extends PandoraComponent<P, S> {
	/**
	 * Marks the component as experimental, meaning it's not stable and should not
	 * be used in production.
	 */
	static _experimental: boolean = false;

	/**
	 * If needed, every component should declare its configuration as follows. This
	 * configuration object should be used to store component-specific settings as well
	 * as other objects/assets used by the action. If any specific object needs
	 * recurrent access such as the declarations in the script.js file, provinding
	 * a static function for that specific object could be great.
	 *
	 * IMPORTANT: Subclasses should declare their own `static _configuration = {}`
	 * to avoid sharing state with other components.
	 */
	static _configuration: Configuration = {};

	static _priority: number = 0;

	/**
	 * Reference to the Monogatari engine (set by engine on registration)
	 */
	static engine: typeof Monogatari;

	/**
	 * Parent component reference
	 */
	_parent?: PandoraComponent;

	constructor () {
		super();
	}

	/**
	 * @static configuration - A simple function providing access to the configuration
	 * object of the function. If the component has a configuration object it must
	 * also include this method.
	 *
	 * @param  {Object|string} [object = null] - Object with which current
	 * configuration will be updated with (i.e. Object.assign) or a string to access
	 * a property.
	 *
	 * @return {any} - If the parameter sent was a string, the function will
	 * return the value of the property whose name matches the parameter. If no
	 * parameter was sent, then the function will return the whole configuration
	 * object.
	 */
	static configuration (object: string | Configuration | null = null): Configuration | unknown {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._configuration[object];
			} else {
				this._configuration = Object.assign({}, this._configuration, object);
			}
		} else {
			return this._configuration;
		}
	}

	static all (): DOM {
		return $_(this.tag);
	}

	static get (id: string): DOM {
		return $_(`${this.tag} [data-instance="${id}"]`);
	}

	/**
	 * @static onStart - This function acts as an event listener for when the game
	 * starts. If the component needs to do any particular activities when the game
	 * starts, then this function should be implemented and it will be automatically
	 * called once the player starts the game.
	 *
	 * @return {Promise}
	 */
	static async onStart (): Promise<void> {
		// Base implementation does nothing
	}

	/**
	 * @static onLoad - This function acts as an event listener for when a game
	 * is loaded. If the component needs to perform any particular actions such as
	 * restoring some state (i.e. showing images, playing media, etc.) when a game
	 * is loaded, this function must be implemented and it will be automatically
	 * called when a game is loaded.
	 *
	 * @return {Promise}  description
	 */
	static async onLoad (): Promise<void> {
		// Base implementation does nothing
	}

	/**
	 * @static setup - The setup is the first step of the Mounting cycle, all
	 * operations required for the component's setup should be implemented here.
	 *
	 * @return {Promise} - Result of the setup operation
	 */
	static async setup (): Promise<void> {
		// Base implementation does nothing
	}

	/**
	 * @static shouldProceed - Either when the user clicks in the game to proceed or
	 * the autoPlay feature is ready to go on, Monogatari will first check with
	 * all actions if it's ok to proceed. Every action should implement its own
	 * logic for it according to its requirements.
	 *
	 * @param {Object} options - Options for proceeding
	 * @param {boolean} options.userInitiated - Whether the proceed was initiated by user click
	 * @param {boolean} options.skip - Whether skip mode is active
	 * @param {boolean} options.autoPlay - Whether auto-play mode is active
	 * @return {Promise} - Resolved if proceeding is alright or rejected if its not
	 */
	static async shouldProceed (_options?: { userInitiated?: boolean; skip?: boolean; autoPlay?: boolean }): Promise<void[] | void> {
		const promises: Promise<void>[] = [];

		this.instances((instance: any) => {
			promises.push(instance.shouldProceed());
		});

		return Promise.all(promises);
	}

	/**
	 * @static willProceed - Once the shouldProceed check is passed, each action
	 * should implement its own logic according to its requirements to respond to
	 * the game proceeding.
	 *
	 * @return {Promise}
	 */
	static async willProceed (): Promise<void[]> {
		const promises: Promise<void>[] = [];

		this.instances((instance: any) => {
			promises.push(instance.willProceed());
		});

		return Promise.all(promises);
	}

	/**
	 * @static shouldRollback - Similarly to the shouldProceed () function, this one takes
	 * action when the player tries to go back in the game.Monogatari will first
	 * check with all actions if it's ok to go back. Every action should implement
	 * its own logic for it according to its requirements.
	 *
	 * @return {Promise} - Resolved if going back is alright or rejected if its not
	 */
	static async shouldRollback (): Promise<void[]> {
		const promises: Promise<void>[] = [];

		this.instances((instance: any) => {
			promises.push(instance.shouldRollback());
		});

		return Promise.all(promises);
	}

	/**
	 * @static willRollback - Once the shouldRollback check is passed, each action
	 * should implement its own logic according to its requirements to respond to
	 * the game reverting the previous action
	 *
	 * @return {Promise}
	 */
	static async willRollback (): Promise<void[]> {
		const promises: Promise<void>[] = [];

		this.instances((instance: any) => {
			promises.push(instance.willRollback());
		});

		return Promise.all(promises);
	}

	/**
	 * @static bind - The binding is the second step of the Mounting cycle, all
	 * operations related to event bindings or other sort of binding with the
	 * HTML content generated in the setup phase should be implemented here.
	 * @return {Promise}
	 */
	static async bind (): Promise<void> {
		// Base implementation does nothing
	}

	/**
	 * @static init - The initialization is the last step of the Mounting cycle,
	 * all final operations should be implemented here.
	 *
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the initialization operation
	 */
	static async init (): Promise<void> {
		// Base implementation does nothing
	}

	/**
	 * @static onSave - This function acts as an event listener for when a game
	 * is saved. If the component needs to perform any particular actions when that
	 * happens, this function must be implemented and it will be automatically
	 * called when a game is saved.
	 *
	 * @param {Object} slot - The slot object that has just been saved.
	 * @param {string} slot.key - The key used to save the slot in the local storage
	 * @param {Object} slot.value - The actual value saved
	 *
	 * @return {Promise}  description
	 */
	static async onSave (): Promise<void> {
		// Base implementation does nothing
	}

	/**
	 * @static reset - When a game ends using the 'end' statement or before a game
	 * is loaded, Monogatari will perform a reset on all its components. If the component
	 * needs to reset a state or any other variables/elements to an initial state
	 * once a game is over or a new one is loaded, the logic for it must be implemented
	 * here and the function will be automatically called when needed.
	 *
	 * @return {Promise} - Result of the reset operation
	 */
	static async onReset (): Promise<void[]> {
		const promises: Promise<void>[] = [];

		this.instances((instance: any) => {
			promises.push(instance.onReset());
		});

		return Promise.all(promises);
	}

	/**
	 * Get all instances of this component, optionally iterating with callback
	 */
	static instances (callback: ((instance: any) => void) | null = null): ReturnType<typeof $_> {
		if (typeof callback === 'function') {
			return $_(this.tag).each(callback as any);
		}
		return $_(this.tag);
	}

	// =========================================
	// Instance Methods
	// =========================================

	/**
	 * Reset this instance's state
	 */
	async onReset (): Promise<void> {
		// Base implementation does nothing
	}

	/**
	 * @static element - Returns this component's element as an Artemis DOM
	 * instance, using the result of the `selector ()` function as the selector
	 *
	 * @returns {DOM} - Artemis DOM instance
	 */
	element (): ReturnType<typeof $_> {
		return $_(this);
	}

	/**
	 * Remove this component from the DOM
	 */
	override remove (): void {
		this.parentNode?.removeChild(this);
	}

	/**
	 * Find an instance by ID within this component type
	 */
	instance (id: string): ReturnType<typeof $_> {
		const ctor = this.constructor as typeof Component;
		return $_(`${ctor.tag}[data-${ctor.name.toLowerCase()}="${id}"`);
	}

	/**
	 * Get or set the parent component
	 */
	parent (component?: PandoraComponent): PandoraComponent | undefined | void {
		if (typeof component !== 'undefined') {
			this._parent = component;
		} else {
			return this._parent;
		}
	}

	/**
	 * Get the engine reference
	 */
	get engine (): typeof Monogatari {
		return (this.constructor as typeof Component).engine;
	}

	set engine (_value: typeof Monogatari) {
		throw new Error('Component engine reference is hold at static level and cannot be modified.');
	}

	/**
	 * Check if it's ok to proceed
	 */
	async shouldProceed (): Promise<void> {
		// Base implementation allows proceeding
	}

	/**
	 * Respond to game proceeding
	 */
	async willProceed (): Promise<void> {
		// Base implementation does nothing
	}

	/**
	 * Check if it's ok to go back
	 */
	async shouldRollback (): Promise<void> {
		// Base implementation allows rollback
	}

	/**
	 * Respond to game reverting
	 */
	async willRollback (): Promise<void> {
		// Base implementation does nothing
	}

	/**
	 * Called when the component is connected to the DOM
	 */
	async connectedCallback (): Promise<void> {
		// Always add the animated class for all the components
		// TODO: Let's be honest, this is stupid.
		this.classList.add('animated');

		return super.connectedCallback();
	}

	/**
	 * Attempts to find a content element inside of this
	 * component or its children (light DOM)
	 *
	 * @param name - Name of the content element to find
	 * @returns An Artemis DOM instance with the found elements
	 */
	content (name: string): DOM {
		return $_(this).find(`[data-content="${name}"]`);
	}
}

export default Component;
