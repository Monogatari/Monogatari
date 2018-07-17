import { Action } from '../Action';
import { Monogatari } from '../monogatari';

export class Clear extends Action {

	static matchString ([ action ]) {
		return action === 'clear';
	}

	constructor ([ action ]) {
		super ();
	}

	apply () {
		Monogatari.whipeText();
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	willRevert () {
		return Promise.reject ();
	}
}

Clear.id = 'Clear';

Monogatari.registerAction (Clear);