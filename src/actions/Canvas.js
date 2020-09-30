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
			this.engine.find ('[data-canvas]').each ((element) => {
				if (element.dataset.mode !== 'background' && element.dataset.mode !== 'displayable') {
					reject (`Canvas ${element.dataset.canvas} must be removed before proceeding.`);
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
			this.engine.element ().find ('[data-canvas][data-mode="background"], [data-canvas][data-mode="immersive"]').each ((canvas) => {
				canvas.width = this.engine.width ();
				canvas.height = this.engine.height ();
				if (typeof this.object.resize === 'function') {
					const { canvas: name, mode } = canvas.dataset;
					const selector = `[data-canvas="${name}"][data-mode="${mode}"]`;

					Util.callAsync (this.object.resize, this.engine, this.engine.element ().find (selector), selector);
				}
			});
		});
		return Promise.resolve ();
	}

	static reset () {
		const promises = [];

		// Go through each canvas element being shown so it can be properly
		// stopped and then removed.
		this.engine.element ().find ('[data-canvas]').each ((element) => {
			const { canvas, mode } = element.dataset;
			promises.push (Util.callAsync (Canvas.objects (canvas).stop, this.engine).then (() => {
				this.engine.element ().find (`[data-canvas="${canvas}"][data-mode="${mode}]"`).remove ();
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

		this.object = Canvas.objects (name);

		if (typeof classes !== 'undefined') {
			this.classes = ['animated', ...classes.filter((c) => c !== 'with')];
		} else {
			this.classes = [];
		}
	}

	willApply () {
		if (typeof this.object !== 'undefined') {
			return Promise.resolve ();
		}

		return Promise.reject ();
	}

	apply () {
		// TODO: Find a way to remove the resize listeners once the canvas is stopped
		const element = `<canvas data-canvas="${this.name}" data-mode="${this.mode}" class="${this.classes.join (' ')}"></canvas>`;
		const selector = `[data-canvas="${this.name}"][data-mode="${this.mode}"]`;

		const setSize = () => {
			this.engine.element ().find (selector).get (0).width = this.engine.width ();
			this.engine.element ().find (selector).get (0).height = this.engine.height ();
		};

		if (this.mode === 'background') {
			this.engine.element ().find ('[data-ui="background"]').append (element);
			setSize ();
		} else if (this.mode === 'immersive') {
			this.engine.element ().find ('[data-screen="game"]').prepend (element);
			setSize ();
		} else if (this.mode === 'displayable') {
			this.engine.element ().find ('[data-screen="game"]').append (element);
		} else if (this.mode === 'character') {
			this.engine.element ().find ('[data-screen="game"]').append (`
				<canvas data-canvas="${this.name}" class='${this.mode} ${this.classes.join (' ')}' data-character='${this.name}'></canvas>
			`);
		}

		return Util.callAsync (this.object.start, this.engine, this.engine.element ().find (selector), selector);
	}

	didApply ({ updateHistory = true, updateState = true } = {}) {
		if (updateHistory === true) {
			this.engine.history ('canvas').push (this._statement);
		}

		if (updateState === true) {
			this.engine.state ('canvas').push (this._statement);
		}

		if (this.mode === 'background' || this.mode === 'modal' || this.mode === 'displayable') {
			return Promise.resolve ({ advance: true });
		}

		return Promise.resolve ({ advance: false });
	}

	revert () {
		return Util.callAsync (this.object.stop, this.engine).then (() => {
			this.engine.element ().find (`[data-canvas="${this.name}"][data-mode="${this.mode}"]`).remove ();
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