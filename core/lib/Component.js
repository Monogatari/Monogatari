import { $_, Util } from '@aegis-framework/artemis';

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

	static instances () {
		return $_(this._id);
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
	 * @param  {string} selector - The CSS selector with which Monogatari has been
	 *                             initialized
	 * @return {Promise} - Result of the setup operation
	 */
	static setup () {
		for (const child of this._children) {
			child.setup ();
		}
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
		for (const child of this._children) {
			child.bind ();
		}
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
		for (const child of this._children) {
			child.init ();
		}
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
	 * @static element - Returns this component's element as an Artemis DOM
	 * instance, using the result of the `selector ()` function as the selector
	 *
	 * @returns {DOM} - Artemis DOM instance
	 */
	element () {
		return $_(this.constructor._id);
	}

	instanceSelector () {
		return $_(`${this.constructor._id}[data-${this.constructor.name.toLowerCase ()}`);
	}

	instance (id) {
		return $_(`${this.constructor._id}[data-${this.constructor.name.toLowerCase ()}="${id}"`);
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

	/**
	 * @static child - Attempts to find a child component of this one by its id
	 *
	 * @param {string} id - ID of the component to find
	 *
	 * @returns {DOM} - An Artemis DOM instance with the found elements
	 */
	child (id) {
		return this.element ().find (id);
	}

	addChild (component) {
		component.parent (this);

		const index = this._children.findIndex (c => c._priority > component._priority);
		this._children = this._children.splice (index, 0, component);
	}

	removeChild (id) {
		this._children = this._children.filter (c => c._id !== id);
	}

	parent (component) {
		if (typeof component !== 'undefined') {
			this._parent = component;
		} else {
			return this._parent;
		}
	}

	static register () {
		window.customElements.define (this._id, this);
		this._registered = true;
	}

	static instantiate (props) {
		if (this._registered === false) {
			this.register ();
		}

		const element = document.createElement (this._id);
		element._setProps (props);

		return element;
	}

	constructor () {
		super ();

		this._state = {};
		this._props = {};
	}

	// /**
	//  * @static html - A simple function providing access to the basic HTML
	//  * structure of the component.
	//  *
	//  * @param {function|string} html - A string or function that renders the
	//  * component into a valid HTML structure.
	//  * @param {*} params - Any additional params that should be used when calling
	//  * the rendering function
	//  *
	//  * @returns {void|string} - Void or the HTML structure in a string
	//  */
	// template (html = null) {
	// 	if (html !== null) {
	// 		this._template = html;
	// 	} else {
	// 		// Check if additional parameters have been sent to a rendering function
	// 		if (params.length > 0 && typeof this._html === 'function') {
	// 			if (html === null) {
	// 				return this._html.call (this, ...params);
	// 			} else {
	// 				return this._html.call (html, ...params);
	// 			}
	// 		}

	// 		// Check if no parameters were set but the HTML is still a function to be called
	// 		if (params.length === 0 && html === null && typeof this._html === 'function') {
	// 			return this._html.call (this);
	// 		}

	// 		// If this is reached, the HTML was just a string
	// 		return this._html;
	// 	}
	// }

	setState (state) {
		if (typeof state !== 'undefined') {
			const oldState = Object.assign ({}, this._state);

			this._state = Object.assign ({}, this._state, state);

			for (const key of Object.keys (state)) {
				this.attributeChangedCallback (key, oldState[key], this._state[key], 'state');
			}
		}
	}

	_setProps (props) {
		if (typeof props === 'object') {
			console.log ('props', props);
			this._props = Object.assign ({}, this._props, props);
		}
	}

	willUpdate (origin, property, oldValue, newValue) {
		return Promise.resolve ();
	}

	update (origin, property, oldValue, newValue) {
		console.log ('update');
		return Promise.resolve ();
	}

	didUpdate (origin, property, oldValue, newValue) {
		return Promise.resolve ();
	}

	onStateUpdate () {
		return this.render ();
	}

	willMount () {
		return Promise.resolve ();
	}

	didMount () {
		return Promise.resolve ();
	}

	willUnmount () {
		return Promise.resolve ();
	}

	unmount () {
		return Promise.resolve ();
	}

	didUnmount () {
		return Promise.resolve ();
	}

	forceRender () {
		return this._render ();
	}

	render () {
		return '';
	}

	_render () {
		return Util.callAsync (this.render, this).then ((html) => {
			this.innerHTML = html;
		});
	}

	connectedCallback () {
		this.state = new Proxy (this._state, {
			get: (target, key) => {
				return target[key];
			},
			set: (target, key, value) => {
				throw 'Component state should be set using the `setState` function.';
			}
		});

		this.props = new Proxy (this, {
			get: (target, key) => {
				if (this.hasAttribute (key)) {
					return this.getAttribute (key);
				}
				return null;
			},
			set: (target, key, value) => {
				if (this.hasAttribute (key)) {
					this.setAttribute (key, value);
					return value;
				}
				return null;
			}
		});

		this.dataset.component = this.constructor._id;

		for (const key of Object.keys (this._props)) {
			this.setAttribute (key, this._props[key]);
		}

		return this.willMount ().then (() => {
			return this._render ().then (() => {
				return this.didMount ();
			});
		});
	}

	disconnectedCallback () {
		return this.willUnmount ().then (() => {
			return this.unmount ().then (() => {
				return this.didUnmount ();
			});
		});
	}

	attributeChangedCallback (property, oldValue, newValue, origin) {
		if (typeof origin === 'undefined') {
			origin = 'props';
		}
		console.log ('Change');

		return this.willUpdate (origin, property, oldValue, newValue).then (() => {
			return this.update (origin, property, oldValue, newValue).then (() => {
				return this.didUpdate (origin, property, oldValue, newValue);
			});
		}).catch (() => {
			// Component should not update
		});
	}
}

Component._registered = false;

Component._priority = 0;

Component._parent = null;

Component._children = [];

/**
 * Each component can define its initial HTML structure, which should be used on
 * the setup or rendering functions of the cycle, adding to the DOM.
*/
Component._html = '';

/**
 * If needed, every component should declare its configuration as follows. This
 * configuration object should be used to store component-specific settings as well
 * as other objects/assets used by the component. If any specific object needs
 * recurrent access such as the declarations in the script.js file, providing
 * a static function for that specific object could be great.
 */
Component._configuration = {};

export default Component;