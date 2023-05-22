import { $_ } from '@aegis-framework/artemis/index';
import { Component as PandoraComponent } from '@aegis-framework/pandora/index';

/**
 * @typedef {import('../monogatari').default} Monogatari
 * @typedef {import('@aegis-framework/artemis/src/DOM').DOM} DOM
 */

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
 */
class Component extends PandoraComponent {

	/**
	 * Marks the component as experimental, meaning it's not stable and should not
	 * be used in production.
	 */
	static _experimental = false;

	static _priority = 0;

	static all () {
		return $_(this.tag);
	}

	static get (id) {
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
	static onStart () {
		return Promise.resolve ();
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
	static onLoad () {
		return Promise.resolve ();
	}

	/**
	 * @static setup - The setup is the first step of the Mounting cycle, all
	 * operations required for the component's setup should be implemented here.
	 *
	 * @return {Promise} - Result of the setup operation
	 */
	static setup () {
		return Promise.resolve ();
	}


	/**
	 * @static shouldProceed - Either when the user clicks in the game to proceed or
	 * the autoPlay feature is ready to go on, Monogatari will first check with
	 * all actions if it's ok to proceed. Every action should implement its own
	 * logic for it according to its requirements.
	 *
	 * @return {Promise} - Resolved if proceeding is alright or rejected if its not
	 */
	static shouldProceed () {
		const promises = [];
		this.instances ((instance) => {
			promises.push (instance.shouldProceed ());
		});
		return Promise.all (promises);
	}

	/**
	 * @static willProceed - Once the shouldProceed check is passed, each action
	 * should implement its own logic according to its requirements to respond to
	 * the game proceeding.
	 *
	 * @return {Promise}
	 */
	static willProceed () {
		const promises = [];
		this.instances ((instance) => {
			promises.push (instance.willProceed ());
		});
		return Promise.all (promises);
	}

	/**
	 * @static shouldRollback - Similarly to the shouldProceed () function, this one takes
	 * action when the player tries to go back in the game.Monogatari will first
	 * check with all actions if it's ok to go back. Every action should implement
	 * its own logic for it according to its requirements.
	 *
	 * @return {Promise} - Resolved if going back is alright or rejected if its not
	 */
	static shouldRollback () {
		const promises = [];
		this.instances ((instance) => {
			promises.push (instance.shouldRollback ());
		});
		return Promise.all (promises);
	}

	/**
	 * @static willRollback - Once the shouldRollback check is passed, each action
	 * should implement its own logic according to its requirements to respond to
	 * the game reverting the previous action
	 *
	 * @return {Promise}
	 */
	static willRollback () {
		const promises = [];
		this.instances ((instance) => {
			promises.push (instance.willRollback ());
		});
		return Promise.all (promises);
	}

	/**
	 * @static bind - The binding is the second step of the Mounting cycle, all
	 * operations related to event bindings or other sort of binding with the
	 * HTML content generated in the setup phase should be implemented here.
	 *
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the binding operation
	 */
	static bind () {
		return Promise.resolve ();
	}

	/**
	 * @static init - The initialization is the last step of the Mounting cycle,
	 * all final operations should be implemented here.
	 *
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the initialization operation
	 */
	static init () {
		return Promise.resolve ();
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
	static onSave () {
		return Promise.resolve ();
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
	static onReset () {
		const promises = [];

		this.instances ((instance) => {
			promises.push (instance.onReset ());
		});

		return Promise.all (promises);
	}


	onReset () {
		return Promise.resolve ();
	}

	/**
	 * @static element - Returns this component's element as an Artemis DOM
	 * instance, using the result of the `selector ()` function as the selector
	 *
	 * @returns {DOM} - Artemis DOM instance
	 */
	element () {
		return $_(this);
	}

	remove () {
		this.parentNode.removeChild (this);
	}

	static instances (callback = null) {
		if (typeof callback === 'function') {
			return $_(this.tag).each (callback);
		}
		return $_(this.tag);
	}


	instance (id) {
		return $_(`${this.constructor.tag}[data-${this.constructor.name.toLowerCase ()}="${id}"`);
	}

	/**
	 * @static content - Attempts to find a content element inside of this
	 * component or its children
	 *
	 * @param {string} name - Name of the content element to find
	 *
	 * @returns {DOM} - An Artemis DOM instance with the found elements
	 */
	content (name) {
		return this.element ().find (`[data-content="${name}"]`);
	}

	parent (component) {
		if (typeof component !== 'undefined') {
			this._parent = component;
		} else {
			return this._parent;
		}
	}

	/** @type {Monogatari} */
	get engine () {
		return this.constructor.engine;
	}

	set engine (value) {
		throw new Error ('Component engine reference is hold at static level and cannot be modified.');
	}

	shouldProceed () {
		return Promise.resolve ();
	}

	willProceed () {
		return Promise.resolve ();
	}

	shouldRollback () {
		return Promise.resolve ();
	}

	willRollback () {
		return Promise.resolve ();
	}

	connectedCallback () {
		// Always add the animated class for all the components
		this.classList.add ('animated');

		return super.connectedCallback ();
	}
}

export { Component };