import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';

export class Next extends Action {

	static matchString ([ action ]) {
		return action === 'next';
	}

	apply () {
		this.engine.proceed ();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Next.id = 'Next';

Monogatari.registerAction (Next);