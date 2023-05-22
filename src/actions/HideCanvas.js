import { Action } from './../lib/Action';
import { Util } from '@aegis-framework/artemis/index';

export class HideCanvas extends Action {


	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'canvas';
	}

	constructor ([ hide, canvas, name, separator, ...classes ]) {
		super ();

		this.name = name;
		this.object = this.engine.action ('Canvas').objects (name);

		this.element = document.querySelector (`[data-component="canvas-container"][canvas="${this.name}"]`);

		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
	}

	apply () {
		const { object } = this.element.props;

		return Util.callAsync (object.stop, this.engine, this.element.layers, object.props, object.state, this.element).then (() => {
			if (this.classes.length > 0) {
				const el = this.element.element ();
				el.addClass ('animated');
				for (const newClass of this.classes) {
					if (newClass) {
						el.addClass (newClass);
					}
				}

				el.data ('visibility', 'invisible');

				// Remove item after a while to prevent it from showing randomly
				// when coming from a menu to the game because of its animation
				el.on ('animationend', (e) => {
					if (e.target.dataset.visibility === 'invisible') {
						// Remove only if the animation ends while the element is not visible
						e.target.remove ();
					}
				});
			} else {
				this.engine.element ().find (`[data-component="canvas-container"][canvas="${this.name}"]`).remove ();
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