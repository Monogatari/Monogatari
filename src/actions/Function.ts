import Action from './../lib/Action';
import { Util } from '@aegis-framework/artemis';
import { FancyError } from '../lib/FancyError';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class ReversibleFunction extends Action {

	static override id = 'Function';

	static override matchObject({ Function: fn }: any): boolean {
		return typeof fn !== 'undefined';
	}

	statement: any;
	shouldContinue: boolean;

	constructor({ Function: fn }: any) {
		super();
		this.statement = fn;
		this.shouldContinue = true;
	}

	override async apply(): Promise<void> {
		// The function will be run asynchronously (No matter if its code isn't)
		// if the function returns false, the next statement will not be run
		// automatically and the game will wait for user interaction or some other
		// code inside the function to keep going. Any other returnValue will
		// allow the game to keep going right away.
		try {
			const returnValue = await Util.callAsync(this.statement.Apply, this.engine);
			this.engine.global('block', false);
			if (returnValue === false) {
				this.shouldContinue = false;
			}
		} catch (e: any) {
			let error: any = {
				'Label': this.engine.state('label'),
				'Step': this.engine.state('step'),
				'Help': {
					'_': 'Check the code for your function, there may be additional information in the console.',
				}
			};

			if (typeof e === 'object') {
				error = Object.assign(error, {
					'Error Message': e.message,
					'File Name': e.fileName,
					'Line Number': e.lineNumber
				});
			} else if (typeof e === 'string') {
				error['Error Message'] = e;
			}

			FancyError.show(
				'An error occurred while trying to revert a Reversible Function.',
				'Monogatari attempted to run the `Apply` method of a Reversible Function but an error occurred.',
				error
			);
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
		return { advance: this.shouldContinue };
	}

	override async willApply(): Promise<void> {
		// @Compatibility [<= v2.0.0-beta.15]
		// To make everything more standardized, we decided to change the
		// 'Reverse' key to 'Revert' which actually follows the language being
		// used in other actions and parts of Monogatari
		if (typeof this.statement.Reverse === 'function' && typeof this.statement.Revert !== 'function') {
			this.statement.Revert = this.statement.Reverse;
		}
	}

	override async revert(): Promise<void> {
		// The function will be run asynchronously (No matter if its code isn't)
		// if the function returns false, the previous statement will not be run
		// automatically and the game will wait for user interaction or some other
		// code inside the function to keep going. Any other returnValue will
		// allow the game to keep going right away.
		try {
			const returnValue = await Util.callAsync(this.statement.Revert, this.engine);
			this.engine.global('block', false);
			if (returnValue === false) {
				this.shouldContinue = false;
			}
		} catch (e: any) {
			let error: any = {
				'Label': this.engine.state('label'),
				'Step': this.engine.state('step'),
				'Help': {
					'_': 'Check the code for your function, there may be additional information in the console.',
				}
			};

			if (typeof e === 'object') {
				error = Object.assign(error, {
					'Error Message': e.message,
					'File Name': e.fileName,
					'Line Number': e.lineNumber
				});
			} else if (typeof e === 'string') {
				error['Error Message'] = e;
			}

			FancyError.show(
				'An error occurred while trying to revert a Reversible Function.',
				'Monogatari attempted to run the `Revert` method of a Reversible Function but an error occurred.',
				error
			);
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: this.shouldContinue, step: true };
	}
}

export default ReversibleFunction;