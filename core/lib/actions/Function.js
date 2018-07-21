import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { Util } from '@aegis-framework/artemis';

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
		return Util.callAsync (this.statement.Apply, Monogatari).then ((returnValue) => {
			Monogatari.global ('block', false);
			if (returnValue !== true) {
				this.shouldContinue = false;
			}
		});
	}

	didApply () {
		return Promise.resolve (this.shouldContinue);
	}

	revert () {
		return Util.callAsync (this.statement.Reverse, Monogatari).then ((returnValue) => {
			Monogatari.global ('block', false);
			if (returnValue !== true) {
				this.shouldContinue = false;
			}
		});
	}

	didRevert () {
		return Promise.resolve (this.shouldContinue);
	}
}

ReversibleFunction.id = 'Function';

Monogatari.registerAction (ReversibleFunction);