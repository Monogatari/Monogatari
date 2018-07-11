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
		Monogatari.assertAsync(this.statement.Condition, Monogatari).then(function () {
			Monogatari.run (this.statement.True, false);
		}).catch(function () {
			Monogatari.run (this.statement.False, false);
		}).finally (() => {
			Monogatari.global ('block', false);
		});
		return Promise.resolve ();
	}
}

Conditional.id = 'Conditional';

Monogatari.registerAction (Conditional);