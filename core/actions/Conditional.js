import { Action } from '../lib/Action';
import { Util } from '@aegis-framework/artemis';

export class Conditional extends Action {

	static setup () {
		this.engine.history ('conditional');
	}

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
			Util.callAsync (this.statement.Condition, this.engine).then ((returnValue) => {

				this.engine.global ('block', false);

				// Check if the function returned true so we run the True branch
				// of the conditional. If false is returned, we run the False
				// branch of the conditional and if a string is returned, we use
				// it as a key so we run the branch that has that key
				if (returnValue === true) {
					this.engine.run (this.statement.True, false);
					this.engine.history ('conditional').push ('True');
				} else if (typeof returnValue === 'string') {
					this.engine.run (this.statement[returnValue], false);
					this.engine.history ('conditional').push (returnValue);
				} else {
					this.engine.run (this.statement.False, false);
					this.engine.history ('conditional').push ('False');
				}
			}).catch (() => {
				this.engine.global ('block', false);
				this.engine.run (this.statement.False, false);
				this.engine.history ('conditional').push ('False');
			}).finally (() => {
				resolve ();
			});
		});
	}

	willRevert () {
		if (this.engine.history ('conditional').length > 0) {
			const conditional = this.engine.history ('conditional')[this.engine.history ('conditional').length - 1];
			if (this.statement[conditional] !== 'undefined') {
				return Promise.resolve ();
			}
		}
		return Promise.reject ();
	}

	revert () {
		const conditional = this.engine.history ('conditional')[this.engine.history ('conditional').length - 1];
		return this.engine.revert (this.statement[conditional], false);
	}

	didRevert () {
		this.engine.history ('conditional').pop ();
		return Promise.resolve ({ advance: false, step: false });
	}
}

Conditional.id = 'Conditional';

export default Conditional;