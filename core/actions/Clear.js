import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';

export class Clear extends Action {

	static matchString ([ action ]) {
		return action === 'clear';
	}

	apply () {
		Monogatari.action ('Dialog').reset ({ keepNVL: true });
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		return Promise.reject ();
	}
}

Clear.id = 'Clear';

Monogatari.registerAction (Clear, true);