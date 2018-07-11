import { Action } from '../Action';
import { Monogatari } from '../monogatari';

export class ReversibleFunction extends Action {

	static matchObject ({ Function: fn }) {
		return typeof fn !== 'undefined';
	}

	constructor ({ Function: fn }) {
		super ();
		this.statement = fn;
	}

	apply (advance) {
		Monogatari.assertAsync (this.statement.Apply, Monogatari).then (() => {
			Monogatari.global ('block', false);
			if (advance) {
				Monogatari.next ();
			}
		}).catch (() => {
			Monogatari.global ('block', false);
		});
		return Promise.resolve ();
	}

	revert () {
		Monogatari.assertAsync (this.statement.Reverse, Monogatari).finally (() => {
			Monogatari.global ('block', false);
			if ((Monogatari.setting ('Step') - 1) >= 0) {
				Monogatari.setting ('Step', Monogatari.setting ('Step') - 1);
			}
		});
		return Promise.resolve ();
	}
}

ReversibleFunction.id = 'Function';

Monogatari.registerAction (ReversibleFunction);