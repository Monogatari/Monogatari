import { Action } from './../lib/Action';
import { Util } from '@aegis-framework/artemis';

export class HideCanvas extends Action {


	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'canvas';
	}

	constructor ([ hide, canvas, name, separator, ...classes ]) {
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
			const element = this.engine.element ().find (`[data-canvas="${this.name}"]`);
			if (this.classes.length > 0) {
				element.addClass ('animated');
				for (const newClass of this.classes) {
					if (newClass) {
						element.addClass (newClass);
					}
				}

				element.data ('visibility', 'invisible');

				// Remove item after a while to prevent it from showing randomly
				// when coming from a menu to the game because of its animation
				element.on ('animationend', (e) => {
					if (e.target.dataset.visibility === 'invisible') {
						// Remove only if the animation ends while the element is not visible
						e.target.remove ();
					}
				});
			} else {
				this.engine.element ().find (`[data-canvas="${this.name}"]`).remove ();
			}

			return Promise.resolve ();
		});
	}

	didApply () {
		for (let i = this.engine.state ('canvas').length - 1; i >= 0; i--) {
			const last = this.engine.state ('canvas')[i];
			const [show, canvas, name, mode] = last.split (' ');
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
			const [show, canvas, name, mode] = last.split (' ');
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