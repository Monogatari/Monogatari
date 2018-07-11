import { Action } from '../Action';
import { Monogatari } from '../monogatari';

export class Clear extends Action {

	static matchString ([ action ]) {
		return action === 'clear';
	}

	constructor ([ action ]) {
		super ();
	}

	apply (advance) {
		Monogatari.whipeText();
		if (advance) {
			Monogatari.next ();
		}
		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

Clear.id = 'Clear';

Monogatari.registerAction (Clear);