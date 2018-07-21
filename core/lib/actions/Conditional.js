import { Action } from '../Action';
import { Monogatari } from '../monogatari';

export class Conditional extends Action {

	static matchObject (statement) {
		return typeof statement.Conditional !== 'undefined';
	}

	constructor (statement) {
		super ();
		this.statement = statement.Conditional;
	}

	apply () {
		Monogatari.assertAsync (this.statement.Condition, Monogatari).then (() => {
			Monogatari.global ('block', false);
			Monogatari.run (this.statement.True, false);
		}).catch (() => {
			Monogatari.global ('block', false);
			Monogatari.run (this.statement.False, false);
		});
		return Promise.resolve ();
	}

	// TODO: Conditionals are not reversible right now because there's no way to
	// tell what they actually did in all cases.
	willRevert () {
		return Promise.reject ();
	}
}

Conditional.id = 'Conditional';

Monogatari.registerAction (Conditional);