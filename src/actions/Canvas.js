import { Action } from '../lib/Action';
import { Util } from '@aegis-framework/artemis';

export class Canvas extends Action {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Canvas._configuration[object];
			} else {
				Canvas._configuration = Object.assign ({}, Canvas._configuration, object);
			}
		} else {
			return Canvas._configuration;
		}
	}

	static shouldProceed () {
		return new Promise ((resolve, reject) => {
			this.engine.element ().find ('[data-component="canvas-container"]').each ((element) => {
				const { mode, canvas } = element.props;
				if (['immersive', 'modal'].indexOf (mode) > -1) {
					reject (`Canvas "${canvas}" must be removed before proceeding.`);
				}
			});

			resolve ();
		});
	}

	static onLoad () {
		if (this.engine.state ('canvas').length > 0) {
			const promises = [];
			for (const canvas of this.engine.state ('canvas')) {
				const action = this.engine.prepareAction (canvas, { cycle: 'Application' });
				const promise = action.willApply ().then (() => {
					return action.apply ().then (() => {
						return action.didApply ({ updateHistory: false, updateState: false });
					});
				});

				promises.push (promise);
			}

			if (promises.length > 0) {
				return Promise.all (promises);
			}
		}

		return Promise.resolve ();
	}

	static setup () {
		this.engine.history ('canvas');
		this.engine.state ({
			canvas: []
		});
		return Promise.resolve ();
	}

	static bind () {
		window.addEventListener ('resize', () => {
			this.engine.element ().find ('[data-component="canvas-container"][mode="background"], [data-component="canvas-container"][mode="immersive"]').each ((canvasContainer) => {
				const { canvas: name, mode, selector, object } = canvasContainer.props;
				if (typeof object.resize === 'function') {
					Util.callAsync (object.resize, this.engine, canvasContainer.canvas, canvasContainer);
				}
			});
		});
		return Promise.resolve ();
	}

	static reset () {
		const promises = [];

		// Go through each canvas element being shown so it can be properly
		// stopped and then removed.
		this.engine.element ().find ('[data-component="canvas-container"]').each ((canvasContainer) => {
			const { canvas: name, mode, selector, object } = canvasContainer.props;

			promises.push (Util.callAsync (object.stop, this.engine, canvasContainer.canvas, canvasContainer).then (() => {
				canvasContainer.content ('canvas').remove ();
			}));
		});

		this.engine.history ({
			canvas: []
		});

		this.engine.state ({
			canvas: []
		});

		return Promise.all (promises);
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'canvas';
	}

	static objects (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Canvas._configuration.objects[object];
			} else {
				Canvas._configuration.objects = Object.assign ({}, Canvas._configuration.objects, object);
			}
		} else {
			return Canvas._configuration.objects;
		}
	}

	/**
	 * Creates an instance of a Canvas Action
	 *
	 * @param {string[]} parameters - List of parameters received from the script statement.
	 * @param {string} parameters.action - In this case, action will always be 'canvas'
	 * @param {string} [parameters.mode='displayable'] - Mode in which the canvas element will be shown (displayable, background, immersive)
	 * @param {string} parameters.mode
	 */
	constructor ([ show, canvas, name, mode = 'displayable', separator, ...classes ]) {
		super ();

		this.mode = mode;
		this.name = name;
		this.selector = `[data-canvas="${this.name}"][data-mode="${this.mode}"]`;
		if (typeof classes !== 'undefined') {
			this.classes = ['animated', ...classes.filter((c) => c !== 'with')];
		} else {
			this.classes = [];
		}
	}

	willApply () {
		this.object = Canvas.objects (this.name);
		if (typeof this.object !== 'undefined') {
			this.element = document.createElement ('canvas-container');

			this.canvasSelector = `canvas[data-canvas="${this.name}"][data-mode="${this.mode}"]`;
			this.conatinerSelector = `[data-component="canvas-container"][canvas="${this.name}"][mode="${this.mode}"]`;

			return Promise.resolve ();
		}

		return Promise.reject ();
	}

	apply () {
		this.element.setProps ({
			mode: this.mode,
			canvas: this.name,
			object: this.object,
			classes: this.classes,
			selector: this.selector,
		});

		const gameScreen = this.engine.element ().find ('[data-screen="game"]');

		if (this.mode === 'background') {
			gameScreen.find ('[data-ui="background"]').append (this.element);
		} else if (this.mode === 'immersive') {
			gameScreen.append (this.element);
		} else if (this.mode === 'displayable') {
			gameScreen.content ('visuals').append (this.element);
		} else if (this.mode === 'character') {
			gameScreen.content ('visuals').append (this.element);
		}

		return Promise.resolve ();
	}

	didApply ({ updateHistory = true, updateState = true } = {}) {
		if (updateHistory === true) {
			this.engine.history ('canvas').push (this._statement);
		}

		if (updateState === true) {
			this.engine.state ('canvas').push (this._statement);
		}

		if (this.mode === 'background' || this.mode === 'character' || this.mode === 'displayable') {
			return Promise.resolve ({ advance: true });
		}

		return Promise.resolve ({ advance: false });
	}

	willRevert () {
		this.element = document.querySelector (this.containerSelector);
		this.object = this.element.props.object;

		return Promise.resolve ();
	}

	revert () {
		return Util.callAsync (this.object.stop, this.engine, this.element.canvas, this.element).then (() => {
			this.element.container ('canvas').remove ();
		});
	}

	didRevert () {
		for (let i = this.engine.state ('canvas').length - 1; i >= 0; i--) {
			const last = this.engine.state ('canvas')[i];
			const [show, canvas, name, mode] = last.split (' ');
			if (name === this.name && mode === this.mode) {
				this.engine.state ('canvas').splice (i, 1);
				break;
			}
		}

		for (let i = this.engine.history ('canvas').length - 1; i >= 0; i--) {
			const last = this.engine.history ('canvas')[i];
			const [show, canvas, name, mode] = last.split (' ');
			if (name === this.name) {
				this.engine.history ('canvas').splice (i, 1);
				break;
			}
		}

		return Promise.resolve ({ advance: true, step: true });
	}
}

Canvas.id = 'Canvas';
Canvas._configuration = {
	objects: {

	}
};

export default Canvas;