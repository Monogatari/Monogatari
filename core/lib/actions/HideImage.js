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
		if (this.classes.length > 0) {
			for (const newClass of this.classes) {
				this.element.addClass (newClass);
			}
			this.element.data ('visibility', 'invisible');
		} else {
			this.element.remove ();
		}

		const show = Monogatari.state ('images').filter ((item) => {
			const [ , asset, ] = item.split (' ');
			return asset !== this.asset;
		});

		Monogatari.state ({ images: show });

		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	willRevert () {
		if (Monogatari.history ('image').length <= 0) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	revert () {
		$_(`${Monogatari.selector} #game`).append (Monogatari.history ('image').pop ());
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

HideImage.id = 'Hide::Image';

Monogatari.registerAction (HideImage);