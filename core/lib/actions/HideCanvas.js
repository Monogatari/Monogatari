import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_, Util } from '@aegis-framework/artemis';

export class HideCanvas extends Action {


	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'canvas';
	}

	constructor ([ hide, type, name, separator, ...classes ]) {
		super ();
		this.name = name;
		this.object = Monogatari.action ('Canvas').objects (name);
		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
	}

	apply () {
		return Util.callAsync (this.object.stop, Monogatari).then (() => {
			if (this.classes.length > 0) {
				$_(`${Monogatari.selector} [data-canvas="${this.name}"]`).addClass ('animated');
				for (const newClass of this.classes) {
					$_(`${Monogatari.selector} [data-canvas="${this.name}"]`).addClass (newClass);
				}

				// Remove item after a while to prevent it from showing randomly
				// when coming from a menu to the game because of its animation
				setTimeout (() => {
					$_(`${Monogatari.selector} [data-canvas="${this.name}"]`).remove ();
				}, 10000);
			} else {
				$_(`${Monogatari.selector} [data-canvas="${this.name}"]`).remove ();
			}
		});
	}

	didApply () {
		for (let i = Monogatari.state ('canvas').length - 1; i >= 0; i--) {
			const last = Monogatari.state ('canvas')[i];
			const [show, type, mode, name] = last.split (' ');
			if (name === this.name) {
				Monogatari.state ('canvas').splice (i, 1);
				break;
			}
		}
		return Promise.resolve ({ advance: true });
	}

	revert () {
		for (let i = Monogatari.history ('canvas').length - 1; i >= 0; i--) {
			const last = Monogatari.history ('canvas')[i];
			const [show, canvas, mode, name] = last.split (' ');
			if (name === this.name) {
				Monogatari.history ('canvas').splice (i, 1);
				return Monogatari.run (last, false);

			}
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

HideCanvas.id = 'Hide::Canvas';

Monogatari.registerAction (HideCanvas);