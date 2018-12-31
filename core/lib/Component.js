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
 *           event listeners or perfom more operations on the DOM once all elements
 *           have been setup. Components will generally bind all the listeners needed
 *           for their inner elements to work correctly.
 *
 * 3. Init - Finally, once the component was setup and it performed all the needed
 *           bindings, it may start performing its operations and perform all
 *          further needed operations.
 *
 * @class Component
 */
class Component extends HTMLElement {

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
	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._configuration[object];
			} else {
				this._configuration = Object.assign ({}, this._configuration, object);
				this.onConfigurationUpdate ().then (() => {
					this.onUpdate ();
				});
			}
		} else {
			return this._configuration;
		}
	}

	/**
	 * @static state - A simple function providing access to the state
	 * object of the function. If the component has a state object it must
	 * also include this method.
	 *
	 * @param  {Object|string} [object = null] - Object with which current
	 * state will be updated with (i.e. Object.assign) or a string to access
	 * a specific variable.
	 *
	 * @return {any} - If the parameter sent was a string, the function will
	 * return the value of the property whose name matches the parameter. If no
	 * parameter was sent, then the function will return the whole state object.
	 */
	static state (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return this._state[object];
			} else {
				this._state = Object.assign ({}, this._state, object);
				this.onStateUpdate ().then (() => {
					this.onUpdate ();
				});
			}
		} else {
			return this._state;
		}
	}


	/**
	 * @static html - A simple function providing access to the basic HTML
	 * structure of the component.
	 *
	 * @param {function|string} html - A string or function that renders the
	 * component into a valid HTML structure.
	 * @param {*} params - Any additional params that should be used when calling
	 * the rendering function
	 *
	 * @returns {void|string} - Void or the HTML structure in a string
	 */
	static html (html = null, ...params) {
		if (html !== null && typeof params === 'undefined') {
			this._html = html;
		} else {
			// Check if additional parameters have been sent to a rendering function
			if (typeof params !== 'undefined' && typeof this._html === 'function') {
				if (html === null) {
					return this._html.call (this, ...params);
				} else {
					return this._html.call (html, ...params);
				}
			}

			// Check if no parameters were set but the HTML is still a function to be called
			if (typeof params === 'undefined' && html === null && typeof this._html === 'function') {
				return this._html.call (this);
			}

			// If this is reached, the HTML was just a string
			return this._html;
		}
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
	 * @static onUpdate - Every time either the configuration object or state object
	 * is changed through their respective methods, this function will be called
	 * after the specific onUpdate listener for each object is performed.
	 *
	 * @return {Promise} - Result of the onUpdate operation.
	 */
	static onUpdate () {
		this.render ();
		return Promise.resolve ();
	}

	/**
	 * @static onConfigurationUpdate - Every time the configuration object is
	 * changed through the configuration () method, this function will be called.
	 * Ideal for components that need to update their UI or other things when their
	 * configuration is changed.
	 *
	 * @return {Promise} - Result of the onConfigurationUpdate operation.
	 */
	static onConfigurationUpdate () {
		this.render ();
		return Promise.resolve ();
	}

	/**
	 * @static onStateUpdate - Every time the state object is changed through the
	 * state () method, this function will be called. Ideal for components that
	 * need to update their UI or perform other operations when their state changes.
	 *
	 * @return {Promise} - Result of the onStateUpdate operation.
	 */
	static onStateUpdate () {
		this.render ();
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
	static reset () {
		return Promise.resolve ();
	}

	/**
	 * @static setup - The setup is the first step of the Mounting cycle, all
	 * operations required for the component's setup should be implemented here.
	 *
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the setup operation
	 */
	static setup () {
		return Promise.resolve ();
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
	 * @static render - Elements requireing dynamic rendering, should be updated
	 * in this method. The way they modify the HTML contents is entirely up to the
	 * component's implementation.
	 *
	 * @return {Promise} - Result of the render operation
	 */
	static render () {
		return Promise.resolve ();
	}
}

/**
 * Each component can define its initial HTML structure, which should be used on
 * the setup or rendering functions of the cycle, adding to the DOM.
*/
Component.html = '';

/**
 * If needed, every component should declare its configuration as follows. This
 * configuration object should be used to store component-specific settings as well
 * as other objects/assets used by the component. If any specific object needs
 * recurrent access such as the declarations in the script.js file, provinding
 * a static function for that specific object could be great.
 */
Component._configuration = {};

/**
 * If needed, every component should declare its state as follows. This
 * state object should be used to store state variables used by the component.
 * If any specific variable recurrent access or modifications, provinding
 * a static function for that specific variable could be great.
 */
Component._state = {};

/**
 * All components must have an unique ID, with this ID the developers will be
 * able to access the component classes, remove components or register new ones.
 */
Component._id = '';

export { Component };