import { Action } from './../lib/Action';
import { Util } from '@aegis-framework/artemis';

export class HideCanvas extends Action {


	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'canvas';
	}

	constructor ([ hide, type, name, separator, ...classes ]) {
		super ();
		this.name = name;
		this.object = this.engine.action ('Canvas').objects (name);
		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
	}

	apply () {
		return Util.callAsync (this.object.stop, this.engine).then (() => {
			if (this.classes.length > 0) {
				this.engine.element ().find (`[data-canvas="${this.name}"]`).addClass ('animated');
				for (const newClass of this.classes) {
					this.engine.element ().find (`[data-canvas="${this.name}"]`).addClass (newClass);
				}

				// Remove item after a while to prevent it from showing randomly
				// when coming from a menu to the game because of its animation
				setTimeout (() => {
					this.engine.element ().find (`[data-canvas="${this.name}"]`).remove ();
				}, 10000);
			} else {
				this.engine.element ().find (`[data-canvas="${this.name}"]`).remove ();
			}
		});
	}

	didApply () {
		for (let i = this.engine.state ('canvas').length - 1; i >= 0; i--) {
			const last = this.engine.state ('canvas')[i];
			const [show, type, mode, name] = last.split (' ');
			if (name === this.name) {
				this.engine.state ('canvas').splice (i, 1);
				break;
			}
		}
		return Promise.resolve ({ advance: true });
	}

	revert () {
		for (let i = this.engine.history ('canvas').length - 1; i >= 0; i--) {
			const last = this.engine.history ('canvas')[i];
			const [show, canvas, mode, name] = last.split (' ');
			if (name === this.name) {
				this.engine.history ('canvas').splice (i, 1);
				return this.engine.run (last, false);

			}
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

HideCanvas.id = 'Hide::Canvas';

export default HideCanvas;