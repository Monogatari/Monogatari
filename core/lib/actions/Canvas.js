import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_, Util } from '@aegis-framework/artemis';

export class Canvas extends Action {

	static onLoad () {
		if (Monogatari.state ('canvas').length > 0) {
			for (const canvas of Monogatari.state ('canvas')) {
				Monogatari.run (canvas, false);
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
		Monogatari.history ({
			canvas: []
		});
		Monogatari.state ({
			canvas: []
		});
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'canvas';
	}

	static objects (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Canvas.settings.objects[object];
			} else {
				Canvas.settings.objects = Object.assign ({}, Canvas.settings.objects, object);
			}
		} else {
			return Canvas.settings.objects;
		}
	}

	/**
	 * Creates an instance of a Canvas Action.
	 *
	 * @param {string[]} parameters - List of parameters received from the script statement.
	 * @param {string} parameters.action - In this case, action will always be 'canvas'
	 * @param {string} [parameters.mode='displayable'] - Mode in which the canvas element will be shown (displayable, background, full-screen, immersive)
	 * @param {string} parameters.mode
	 */
	constructor ([ , mode = 'displayable', name ]) {
		super ();
		this.mode = mode;
		this.name = name;

		if (typeof Canvas.settings.objects[name] !== 'undefined') {
			this.object = Canvas.settings.objects[name];
		}
	}

	showCanvas (mode) {
		// TODO: Find a way to remove the resize listeners once the canvas is stopped
		if (mode === 'background') {
			$_(`${Monogatari.selector} [data-ui="background"]`).append (`
				<canvas data-canvas="${this.name}" class='${mode}'></canvas>
			`);

			$_(`${Monogatari.selector} [data-canvas="${this.name}"]`).get (0).width = Monogatari.width ();
			$_(`${Monogatari.selector} [data-canvas="${this.name}"]`).get (0).height = Monogatari.height ();
			window.addEventListener ('resize', () => {
				$_(`${Monogatari.selector} [data-canvas="${this.name}"].background`).each ((canvas) => {
					canvas.width = Monogatari.width ();
					canvas.height = Monogatari.height ();
				});
			});
			return Util.callAsync (this.object.start, Monogatari, $_(`${Monogatari.selector} [data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (mode === 'immersive') {
			$_(`${Monogatari.selector} #game`).prepend (`
				<canvas data-canvas="${this.name}" class='${mode}'></canvas>
			`);

			$_(`${Monogatari.selector} [data-canvas="${this.name}"]`).get (0).width = Monogatari.width ();
			$_(`${Monogatari.selector} [data-canvas="${this.name}"]`).get (0).height = Monogatari.height ();
			window.addEventListener ('resize', () => {
				$_(`${Monogatari.selector} [data-canvas="${this.name}"].background`).each ((canvas) => {
					canvas.width = Monogatari.width ();
					canvas.height = Monogatari.height ();
				});
			});
			return Util.callAsync (this.object.start, Monogatari, $_(`${Monogatari.selector} [data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (mode === 'displayable') {
			$_(`${Monogatari.selector} #game`).append (`
				<canvas data-canvas="${this.name}" class='${mode}'></canvas>
			`);
			return Util.callAsync (this.object.start, Monogatari, $_(`${Monogatari.selector} [data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (mode === 'character') {
			$_(`${Monogatari.selector} #game`).append (`
				<canvas data-canvas="${this.name}" class='${mode}' data-character='${this.name}'></canvas>
			`);
			return Util.callAsync (this.object.start, Monogatari, $_(`${Monogatari.selector} [data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		}
	}

	apply () {
		if (this.mode === 'stop') {
			return Util.callAsync (this.object.stop, Monogatari).then (() => {
				$_(`${Monogatari.selector} [data-canvas="${this.name}"]`).remove ();
			});
		} else {
			return this.showCanvas (this.mode);
		}
	}

	didApply () {
		const state = Monogatari.state ('canvas');
		if (this.mode === 'stop') {
			const canvas = state.find ((element) => {
				const [ , , name] = element.split (' ');
				return name === this.name;
			});
			Monogatari.history ('canvas').push (canvas);
			Monogatari.state ({
				canvas: state.filter ((element) => element !== canvas)
			});
		} else {
			Monogatari.state ({
				canvas: [this._statement, ...state]
			});
		}
		return Promise.resolve (true);
	}

	revert () {
		// If the statement was a stop one, we need to show the canvas it stoped
		// again. If not, then we have to stop the canvas that was shown.
		if (this.mode === 'stop') {
			this.last = Monogatari.history ('canvas').find ((element) => {
				const [ , , name] = element.split (' ');
				return name === this.name;
			});
			if (typeof this.last !== 'undefined') {
				const [, mode, ] = this.last.split (' ');
				return this.showCanvas (mode);
			}
		} else {
			return Util.callAsync (this.object.stop, Monogatari).then (() => {
				$_(`${Monogatari.selector} [data-canvas="${this.name}"]`).remove ();
			});
		}
		return Promise.reject ();
	}

	didRevert () {
		const state = Monogatari.state ('canvas');
		if (this.mode === 'stop') {

			if (typeof this.last !== 'undefined') {
				Monogatari.state ({
					canvas: [this.last, ...state]
				});
			}
		} else {
			const canvas = state.find ((element) => {
				const [, , name] = element.split (' ');
				return name === this.name;
			});
			Monogatari.history ('canvas').push (canvas);
			Monogatari.state ({
				canvas: state.filter ((element) => element !== canvas)
			});
		}
		return Promise.resolve (true);
	}
}

Canvas.id = 'Canvas';
Canvas.settings = {
	objects: {

	}
};

Monogatari.registerAction (Canvas);