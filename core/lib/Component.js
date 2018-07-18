class Component extends HTMLElement {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Component._configuration[object];
			} else {
				Component._configuration = Object.assign ({}, Component._configuration, object);
				Component.onUpdate ();
			}
		} else {
			return Component._configuration;
		}
	}

	static state (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Component._state[object];
			} else {
				Component._state = Object.assign ({}, Component._state, object);
				Component.onUpdate ();
			}
		} else {
			return Component._state;
		}
	}

	/**
	 * @static onStart - This function acts as an event listener for when the game
	 * starts.
	 *
	 * @return {Promise}
	 */
	static onStart () {
		return Promise.resolve ();
	}

	static onLoad () {
		return Promise.resolve ();
	}

	static onUpdate () {
		return Component.render ();
	}

	static onSave () {
		return Promise.resolve ();
	}

	static reset () {
		return Promise.resolve ();
	}

	static setup () {
		return Promise.resolve ();
	}

	static bind () {
		return Promise.resolve ();
	}

	static init () {
		return Promise.resolve ();
	}

	static render () {
		return Promise.resolve ();
	}
}

Component._configuration = {};
Component._state = {};
Component._id = '';

export { Component };