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

	apply () {
		Monogatari.global ('block', true);
		setTimeout (() => {
			Monogatari.global ('block', false);
		}, this.time);

		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Wait.id = 'Wait';

Monogatari.registerAction (Wait);