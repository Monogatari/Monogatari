import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class HideImage extends Action {

	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'image';
	}

	constructor ([ hide, type, asset, ...classes ]) {
		super ();
		this.asset = asset;

		this.element = $_(`${Monogatari.selector} [data-image="${this.asset}"]`);

		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
		this.classes = this.classes.filter ((c) => (c !== 'at' && c !== 'with'));
	}

	apply () {
		this.element.removeClass ();
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
		} else {
			this.element.remove ();
		}

		return Promise.resolve ();
	}

	didApply () {
		const show = Monogatari.state ('images').filter ((item) => {
			const [ show, type, asset, ] = item.split (' ');
			return asset !== this.asset;
		});

		Monogatari.state ({ images: show });
		return Promise.resolve (true);
	}

	willRevert () {
		if (Monogatari.history ('image').length <= 0) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	revert () {
		Monogatari.run (Monogatari.history ('image').pop (), false);
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

HideImage.id = 'Hide::Image';

Monogatari.registerAction (HideImage);