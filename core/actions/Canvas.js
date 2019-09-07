import { Action } from '../lib/Action';
import { Monogatari } from '../monogatari';
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
		if (Monogatari.state ('canvas').length > 0) {
			for (const canvas of Monogatari.state ('canvas')) {
				const promise = Monogatari.run (canvas, false);
				// TODO: Find a way to prevent the histories from filling up on loading
				// So there's no need for this pop.
				Monogatari.history ('canvas').pop ();
				Monogatari.state ('canvas').pop ();

				return promise;
			}
		}
		return Promise.resolve ();
	}

	static setup () {
		Monogatari.history ('canvas');
		Monogatari.state ({
			canvas: []
		});
		return Promise.resolve ();
	}

	static reset () {
		const promises = [];

		// Go through each canvas element being shown so it can be properly
		// stopped and then removed.
		Monogatari.element ().find ('[data-canvas]').each ((element) => {
			const name = element.dataset.canvas;
			promises.push (Util.callAsync (Canvas.objects (name).stop, Monogatari).then (() => {
				Monogatari.element ().find (`[data-canvas="${this.name}"]`).remove ();
			}));
		});
		Monogatari.history ({
			canvas: []
		});
		Monogatari.state ({
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
			Monogatari.element ().find ('[data-ui="background"]').append (`
				<canvas data-canvas="${this.name}" class='${mode} ${this.classes.join (' ')}'></canvas>
			`);

			Monogatari.element ().find (`[data-canvas="${this.name}"]`).get (0).width = Monogatari.width ();
			Monogatari.element ().find (`[data-canvas="${this.name}"]`).get (0).height = Monogatari.height ();
			window.addEventListener ('resize', () => {
				Monogatari.element ().find (`[data-canvas="${this.name}"].background`).each ((canvas) => {
					canvas.width = Monogatari.width ();
					canvas.height = Monogatari.height ();
					if (typeof this.object.resize === 'function') {
						Util.callAsync (this.object.resize, Monogatari, Monogatari.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
					}
				});
			});
			return Util.callAsync (this.object.start, Monogatari, Monogatari.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (mode === 'immersive') {
			Monogatari.element ().find ('[data-screen="game"]').prepend (`
				<canvas data-canvas="${this.name}" class='${mode} ${this.classes.join (' ')}'></canvas>
			`);

			Monogatari.element ().find (`[data-canvas="${this.name}"]`).get (0).width = Monogatari.width ();
			Monogatari.element ().find (`[data-canvas="${this.name}"]`).get (0).height = Monogatari.height ();
			window.addEventListener ('resize', () => {
				Monogatari.element ().find (`[data-canvas="${this.name}"].background`).each ((canvas) => {
					canvas.width = Monogatari.width ();
					canvas.height = Monogatari.height ();
					if (typeof this.object.resize === 'function') {
						Util.callAsync (this.object.resize, Monogatari, Monogatari.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
					}
				});
			});
			return Util.callAsync (this.object.start, Monogatari, Monogatari.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (mode === 'displayable') {
			Monogatari.element ().find ('[data-screen="game"]').append (`
				<canvas data-canvas="${this.name}" class='${mode} ${this.classes.join (' ')}'></canvas>
			`);
			return Util.callAsync (this.object.start, Monogatari, Monogatari.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (mode === 'character') {
			Monogatari.element ().find ('[data-screen="game"]').append (`
				<canvas data-canvas="${this.name}" class='${mode} ${this.classes.join (' ')}' data-character='${this.name}'></canvas>
			`);
			return Util.callAsync (this.object.start, Monogatari, Monogatari.element ().find (`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
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
		Monogatari.history ('canvas').push (this._statement);
		Monogatari.state ('canvas').push (this._statement);
		return Promise.resolve ({ advance: true });
	}

	revert () {
		return Util.callAsync (this.object.stop, Monogatari).then (() => {
			Monogatari.element ().find (`[data-canvas="${this.name}"]`).remove ();
		});
	}

	didRevert () {
		for (let i = Monogatari.state ('canvas').length - 1; i >= 0; i--) {
			const last = Monogatari.state ('canvas')[i];
			const [show, canvas, mode, name] = last.split (' ');
			if (name === this.name) {
				Monogatari.state ('canvas').splice (i, 1);
				break;
			}
		}

		for (let i = Monogatari.history ('canvas').length - 1; i >= 0; i--) {
			const last = Monogatari.history ('canvas')[i];
			const [show, canvas, mode, name] = last.split (' ');
			if (name === this.name) {
				Monogatari.history ('canvas').splice (i, 1);
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

Monogatari.registerAction (Canvas, true);