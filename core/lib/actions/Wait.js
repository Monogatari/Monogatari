import { Action } from '../Action';
import { Monogatari } from '../monogatari';

export class Wait extends Action {

	static matchString ([ action ]) {
		return action === 'wait';
	}

	constructor ([ action, time ]) {
		super ();
		this.time = parseInt (time);
	}

	apply (advance) {
		Monogatari.global ('block', true);
		setTimeout (() => {
			Monogatari.global ('block', false);
			if (advance === true) {
				Monogatari.next ();
			}

		}, this.time);

		return Promise.resolve ();
	}
}

Wait.id = 'Wait';

Monogatari.registerAction (Wait);