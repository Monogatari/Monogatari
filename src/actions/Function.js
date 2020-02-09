import { Action } from './../lib/Action';
import { Util } from '@aegis-framework/artemis';
import { FancyError } from '../lib/FancyError';

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
		// The function will be run asynchronously (No matter if its code isn't)
		// if the function returns false, the next statement will not be run
		// automatically and the game will wait for user interaction or some other
		// code inside the function to keep going. Any other returnValue will
		// allow the game to keep going right away.
		return Util.callAsync (this.statement.Apply, this.engine).then ((returnValue) => {
			this.engine.global ('block', false);
			if (returnValue === false) {
				this.shouldContinue = false;
			}
		}).catch ((e) => {
			let error = {
				'Label': this.engine.state ('label'),
				'Step': this.engine.state ('step'),
				'Help': {
					'_': 'Check the code for your function, there may be additional information in the console.',
				}
			};

			if (typeof e === 'object') {
				error = Object.assign (error, {
					'Error Message': e.message,
					'File Name': e.fileName,
					'Line Number': e.lineNumber
				});
			} else if (typeof e === 'string') {
				error['Error Message'] = e;
			}

			FancyError.show (
				'An error occurred while trying to revert a Reversible Function.',
				'Monogatari attempted to run the `Apply` method of a Reversible Function but an error occurred.',
				error
			);
		});
	}

	didApply () {
		return Promise.resolve ({ advance: this.shouldContinue });
	}

	revert () {
		// The function will be run asynchronously (No matter if its code isn't)
		// if the function returns false, the previous statement will not be run
		// automatically and the game will wait for user interaction or some other
		// code inside the function to keep going. Any other returnValue will
		// allow the game to keep going right away.
		return Util.callAsync (this.statement.Reverse, this.engine).then ((returnValue) => {
			this.engine.global ('block', false);
			if (returnValue === false) {
				this.shouldContinue = false;
			}
		}).catch ((e) => {
			let error = {
				'Label': this.engine.state ('label'),
				'Step': this.engine.state ('step'),
				'Help': {
					'_': 'Check the code for your function, there may be additional information in the console.',
				}
			};

			if (typeof e === 'object') {
				error = Object.assign (error, {
					'Error Message': e.message,
					'File Name': e.fileName,
					'Line Number': e.lineNumber
				});
			} else if (typeof e === 'string') {
				error['Error Message'] = e;
			}

			FancyError.show (
				'An error occurred while trying to revert a Reversible Function.',
				'Monogatari attempted to run the `Revert` method of a Reversible Function but an error occurred.',
				error
			);
		});
	}

	didRevert () {
		return Promise.resolve ({ advance: this.shouldContinue, step: true });
	}
}

ReversibleFunction.id = 'Function';

export default ReversibleFunction;