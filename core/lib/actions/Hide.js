import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Hide extends Action {

	static matchString ([ action ]) {
		return action === 'hide';
	}

	constructor ([ action, asset, ...classes ]) {
		super ();
		this.asset = asset;

		if (typeof Monogatari.character (this.asset) !== 'undefined') {
			this.element = $_(`${Monogatari.selector} [data-character="${this.asset}"]`);
			this.state = 'characters';
		} else {
			this.element = $_(`${Monogatari.selector} [data-image="${this.asset}"]`);
			this.state = 'images';
		}

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

		const show = Monogatari.state (this.state).filter ((item) => {
			const [ , asset, ] = item.split (' ');
			return asset !== this.asset;
		});

		if (this.state == 'characters') {
			Monogatari.state ({ characters: show });
		} else if (this.state == 'images') {
			Monogatari.state ({ images: show });
		}

		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	willRevert () {
		if (typeof Monogatari.character (this.asset) !== 'undefined' && Monogatari.history ('character').length > 0) {
			this.history = 'character';
		} else if (typeof Monogatari.asset ('images', this.asset) !== 'undefined' && Monogatari.history ('image').length > 0) {
			this.history = 'image';
		} else {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	revert () {
		$_(`${Monogatari.selector} #game`).append (Monogatari.history (this.history).pop ());
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Hide.id = 'Hide';

Monogatari.registerAction (Hide);