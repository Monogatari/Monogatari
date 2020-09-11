import { Action } from './../lib/Action';

export class HideImage extends Action {

	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'image';
	}

	constructor ([ hide, type, asset, ...classes ]) {
		super ();
		this.asset = asset;

		this.element = this.engine.element ().find (`[data-image="${this.asset}"]`);

		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
		this.classes = this.classes.filter ((c) => (c !== 'at' && c !== 'with'));
	}

	apply () {
		const currentPosition = this.element.data ('position');
		const position = this._statement.match (/at\s(\S*)/);

		const oldClasses = [...this.element.get (0).classList];

		for (const oldClass of oldClasses) {
			if (oldClass !== currentPosition || position instanceof Array) {
				this.element.removeClass (oldClass);
			}
		}

		if (position instanceof Array) {
			// If it was, we'll set that position to the character
			const [at, positionClass] = position;
			this.element.data ('position', positionClass);
		}

		this.element.addClass ('animated');

		const durationPosition = this.classes.indexOf ('duration');

		if (durationPosition > -1) {
			this.element.style ('animation-duration', this.classes[durationPosition + 1]);
		} else {
			this.element.style ('animation-duration', '');
		}

		if (this.classes.length > 0) {
			for (const newClass of this.classes) {
				this.element.addClass (newClass);
			}
			this.element.data ('visibility', 'invisible');
			this.element.on ('animationend', (e) => {
				if (e.target.dataset.visibility === 'invisible') {
					// Remove only if the animation ends while the element is not visible
					e.target.remove ();
				}
			});
		} else {
			this.element.remove ();
		}

		return Promise.resolve ();
	}

	didApply () {
		const show = this.engine.state ('images').filter ((item) => {
			const [ show, type, asset, ] = item.split (' ');
			return asset !== this.asset;
		});

		this.engine.state ({ images: show });
		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		if (this.engine.history ('image').length === 0) {
			return Promise.reject ('Image history was empty.');
		}
		return Promise.resolve ();
	}

	revert () {
		// return this.engine.run (this.engine.history ('image').pop (), false);
		for (let i = this.engine.history ('image').length - 1; i >= 0; i--) {
			const last = this.engine.history ('image')[i];
			const [show, image, asset] = last.split (' ');
			if (asset === this.asset) {
				const action = this.engine.prepareAction (last, { cycle: 'Application' });
				return action.willApply ().then (() => {
					return action.apply ().then (() => {
						return action.didApply ({ updateHistory: false, updateState: true });
					});
				});
			}
		}

		Promise.reject ('Could not find a previous state to revert to');
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

HideImage.id = 'Hide::Image';

export default HideImage;