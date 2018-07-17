import { Action } from '../Action';
import { Monogatari } from '../monogatari';

export class ReversibleFunction extends Action {

	static matchObject ({ Function: fn }) {
		return typeof fn !== 'undefined';
	}

	constructor ({ Function: fn }) {
		super ();
		this.statement = fn;
		this.shouldContinue = true;
	}

	apply () {
		return new Promise ((resolve) => {
			Monogatari.assertAsync (this.statement.Apply, Monogatari).then (() => {
				Monogatari.global ('block', false);
				resolve ();
			}).catch (() => {
				Monogatari.global ('block', false);
				this.shouldContinue = false;
				resolve ();
			});
		});
	}

	didApply () {
		return Promise.resolve (this.shouldContinue);
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