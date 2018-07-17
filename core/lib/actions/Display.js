import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Display extends Action {

	static setup () {
		Monogatari.history ('image');
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'display';
	}

	constructor ([ action, type, asset, ...classes ]) {
		super ();
		this.type = type;
		this.asset = asset;


		if (typeof Monogatari.asset ('images', this.asset) !== 'undefined') {
			this.image = Monogatari.asset ('images', this.asset);
		} else {
			this.image = this.asset;
		}

		if (typeof classes !== 'undefined') {
			this.classes =  classes.join (' ').replace(' at ', ' ').replace (' with ', ' ').trim ().split (' ');
		} else {
			this.classes = [];
		}
	}


	apply () {
		const object = `<img src="assets/images/${this.image}" class="animated ${this.classes.join (' ')}" data-image="${this.asset}">`;
		$_('#game').append (object);
		Monogatari.history ('image').push (object);
		return Promise.resolve ();
	}

	revert () {
		$_(`[data-image="${this.asset}"]`).remove ();
		return Promise.resolve ();
	}
}

Display.id = 'Display';

Monogatari.registerAction (Display);