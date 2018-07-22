import { Action } from '../Action';
import { Monogatari } from '../monogatari';

export class Next extends Action {

	static matchString ([ action ]) {
		return action === 'next';
	}

	constructor ([ action ]) {
		super ();
	}

	apply () {
		Monogatari.next ();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Next.id = 'Next';

Monogatari.registerAction (Next);