import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_, Util } from '@aegis-framework/artemis';

export class Canvas extends Action {

	static setup () {

	}

	static matchString ([ action ]) {
		return action === 'canvas';
	}


	/**
	 * Creates an instance of a Canvas Action.
	 *
	 * @param {string[]} parameters - List of parameters received from the script statement.
	 * @param {string} parameters.action - In this case, action will always be 'canvas'
	 * @param {string} [parameters.mode='displayable'] - Mode in which the canvas element will be shown (displayable, background, full-screen, immersive)
	 * @param {string} parameters.mode
	 */
	constructor ([ action, mode = 'displayable', name ]) {
		super ();
		this.mode = mode;
		this.name = name;

		if (typeof Canvas.settings.objects[name] !== 'undefined') {
			this.object = Canvas.settings.objects[name];
		}
	}

	apply () {
		if (this.mode === 'background') {
			$_('[data-ui="background"]').append (`
				<canvas data-canvas="${this.name}" class='${this.mode}'></canvas>
			`);

			$_(`[data-canvas="${this.name}"]`).get (0).width = Monogatari.width ();
			$_(`[data-canvas="${this.name}"]`).get (0).height = Monogatari.height ();
			window.addEventListener ('resize', () => {
				$_(`[data-canvas="${this.name}"].background`).each ((canvas) => {
					canvas.width = Monogatari.width ();
					canvas.height = Monogatari.height ();
				});
			});
			return Util.callAsync (this.object.start, Monogatari, $_(`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (this.mode === 'immersive') {
			$_('#game').prepend (`
				<canvas data-canvas="${this.name}" class='${this.mode}'></canvas>
			`);

			$_(`[data-canvas="${this.name}"]`).get (0).width = Monogatari.width ();
			$_(`[data-canvas="${this.name}"]`).get (0).height = Monogatari.height ();
			window.addEventListener ('resize', () => {
				$_(`[data-canvas="${this.name}"].background`).each ((canvas) => {
					canvas.width = Monogatari.width ();
					canvas.height = Monogatari.height ();
				});
			});
			return Util.callAsync (this.object.start, Monogatari, $_(`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (this.mode === 'displayable' || this.mode === 'character') {
			$_('#game').append (`
				<canvas data-canvas="${this.name}" class='${this.mode}'></canvas>
			`);
			return Util.callAsync (this.object.start, Monogatari, $_(`[data-canvas="${this.name}"]`), `[data-canvas="${this.name}"]`);
		} else if (this.mode === 'stop') {
			return Util.callAsync (this.object.stop, Monogatari).then (() => {
				$_(`[data-canvas="${this.name}"]`).remove ();
			});
		}
	}

	revert () {
		return this.apply ();
	}

}

Canvas.id = 'Canvas';
Canvas.settings = {
	objects: {

	}
};

Monogatari.registerAction (Canvas);