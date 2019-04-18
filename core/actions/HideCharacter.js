import { Action } from './../lib/Action';
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
			this.element = Monogatari.element ().find (`[data-character="${this.asset}"]`);
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
		const show = Monogatari.state ('characters').filter ((item) => {
			const [ show, type, asset, ] = item.split (' ');
			return asset !== this.asset;
		});

		Monogatari.state ({ characters: show });
		return Promise.resolve ({ advance: true });
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
		return Promise.resolve ({ advance: true, step: true });
	}
}

HideCharacter.id = 'Hide::Character';

Monogatari.registerAction (HideCharacter);