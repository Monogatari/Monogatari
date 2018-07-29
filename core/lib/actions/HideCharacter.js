import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class HideCharacter extends Action {

	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'character';
	}

	constructor ([ hide, type, asset, ...classes ]) {
		super ();
		this.asset = asset;

		if (typeof Monogatari.character (this.asset) !== 'undefined') {
			this.element = $_(`${Monogatari.selector} [data-character="${this.asset}"]`);
		} else {
			// TODO: Add FancyError for when the character does not exist
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

		const show = Monogatari.state ('characters').filter ((item) => {
			const [ show, type , asset, ] = item.split (' ');
			return asset !== this.asset;
		});

		Monogatari.state ({ characters: show });

		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	willRevert () {
		if (Monogatari.history ('character').length <= 0) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	revert () {
		Monogatari.run (Monogatari.history ('character').pop (), false);
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

HideCharacter.id = 'Hide::Character';

Monogatari.registerAction (HideCharacter);