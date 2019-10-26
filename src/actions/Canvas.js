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

	static onLoad () {
		if (this.engine.state ('canvas').length > 0) {
			for (const canvas of this.engine.state ('canvas')) {
				const promise = this.engine.run (canvas, false);
				// TODO: Find a way to prevent the histories from filling up on loading
				// So there's no need for this pop.
				this.engine.history ('canvas').pop ();
				this.engine.state ('canvas').pop ();

				return promise;
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

	static reset () {
		const promises = [];

		// Go through each canvas element being shown so it can be properly
		// stopped and then removed.
		this.engine.element ().find ('[data-canvas]').each ((element) => {
			const name = element.dataset.canvas;
			promises.push (Util.callAsync (Canvas.objects (name).stop, this.engine).then (() => {
				this.engine.element ().find (`[data-canvas="${this.name}"]`).remove ();
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
	 * @param {string} [parameters.mode='displayable'] - Mode in which the canvas element will be shown (displayable, background, full-screen, immersive)
	 * @param {string} parameters.mode
	 */
	constructor ([ show, type, mode = 'displayable', name, separator, ...classes ]) {
		super ();
		this.mode = mode;
		this.name = name;

		this.object = Canvas.objects (name);

		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
	}

	show (mode) {
		// TODO: Find a way to remove the resize listeners once the canvas is stopped
		if (mode === 'background') {
			this.engine.element ().find ('[data-ui="background"]').append (`
				<canvas data-canvas="${this.name}" class='${mode} ${this.classes.join (' ')}'></canvas>
			`);

			this.engine.element ().find (`[data-canvas="${this.name}"]`).get (0).width = this.engine.width ();
			this.engine.element ().find (`[data-canvas="${this.name}"]`).get (0).height = this.engine.height ();
			window.addEventListener ('resize', () => {
				this.engine.element ().find (`[data-canvas="${this.name}"].background`).each ((canvas) => {
					canvas.width = this.engine.width ();
					canvas.height = this.engine.height ();
					if (typeof this.object.resize === 'function') {
						Util.callAsync (this.object.resize, this.engine, this.engine.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
					}
				});
			});
			return Util.callAsync (this.object.start, this.engine, this.engine.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (mode === 'immersive') {
			this.engine.element ().find ('[data-screen="game"]').prepend (`
				<canvas data-canvas="${this.name}" class='${mode} ${this.classes.join (' ')}'></canvas>
			`);

			this.engine.element ().find (`[data-canvas="${this.name}"]`).get (0).width = this.engine.width ();
			this.engine.element ().find (`[data-canvas="${this.name}"]`).get (0).height = this.engine.height ();
			window.addEventListener ('resize', () => {
				this.engine.element ().find (`[data-canvas="${this.name}"].background`).each ((canvas) => {
					canvas.width = this.engine.width ();
					canvas.height = this.engine.height ();
					if (typeof this.object.resize === 'function') {
						Util.callAsync (this.object.resize, this.engine, this.engine.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
					}
				});
			});
			return Util.callAsync (this.object.start, this.engine, this.engine.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (mode === 'displayable') {
			this.engine.element ().find ('[data-screen="game"]').append (`
				<canvas data-canvas="${this.name}" class='${mode} ${this.classes.join (' ')}'></canvas>
			`);
			return Util.callAsync (this.object.start, this.engine, this.engine.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (mode === 'character') {
			this.engine.element ().find ('[data-screen="game"]').append (`
				<canvas data-canvas="${this.name}" class='${mode} ${this.classes.join (' ')}' data-character='${this.name}'></canvas>
			`);
			return Util.callAsync (this.object.start, this.engine, this.engine.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		}
	}

	willApply () {
		if (typeof this.object !== 'undefined') {
			return Promise.resolve ();
		}
		return Promise.reject ();
	}

	apply () {
		return this.show (this.mode);
	}

	didApply () {
		this.engine.history ('canvas').push (this._statement);
		this.engine.state ('canvas').push (this._statement);
		return Promise.resolve ({ advance: true });
	}

	revert () {
		return Util.callAsync (this.object.stop, this.engine).then (() => {
			this.engine.element ().find (`[data-canvas="${this.name}"]`).remove ();
		});
	}

	didRevert () {
		for (let i = this.engine.state ('canvas').length - 1; i >= 0; i--) {
			const last = this.engine.state ('canvas')[i];
			const [show, canvas, mode, name] = last.split (' ');
			if (name === this.name) {
				this.engine.state ('canvas').splice (i, 1);
				break;
			}
		}

		for (let i = this.engine.history ('canvas').length - 1; i >= 0; i--) {
			const last = this.engine.history ('canvas')[i];
			const [show, canvas, mode, name] = last.split (' ');
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