import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { Util } from '@aegis-framework/artemis';

export class Conditional extends Action {

	static matchObject (statement) {
		return typeof statement.Conditional !== 'undefined';
	}

	constructor (statement) {
		super ();
		this.statement = statement.Conditional;
	}

	apply () {
		return new Promise ((resolve) => {

			// Call the condition function. Since the function might use a 
			// Promise.reject () to return as false, we also define a catch
			// block to run the False branch of the condition.
			Util.callAsync (this.statement.Condition, Monogatari).then ((returnValue) => {

				Monogatari.global ('block', false);

				// Check if the function returned true so we run the True branch
				// of the conditional. If false is returned, we run the False
				// branch of the conditional and if a string is returned, we use 
				// it as a key so we run the branch that has that key
				if (returnValue === true) {
					Monogatari.run (this.statement.True, false);
				} else if (typeof returnValue === 'string') {
					Monogatari.run (this.statement[returnValue], false);
				} else {
					Monogatari.run (this.statement.False, false);
				}
			}).catch (() => {
				Monogatari.global ('block', false);
				Monogatari.run (this.statement.False, false);
			}).finally (() => {
				resolve ();
			});
		});
	}

	// TODO: Conditionals are not reversible right now because there's no way to
	// tell what they actually did in all cases. And there's also no history on
	// what function was applied.
	willRevert () {
		return Promise.reject ();
	}
}

Conditional.id = 'Conditional';

Monogatari.registerAction (Conditional);