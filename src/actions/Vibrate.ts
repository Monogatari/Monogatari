import Action from './../lib/Action';
import { FancyError } from './../lib/FancyError';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class Vibrate extends Action {

	static override id = 'Vibrate';

	static override matchString([action]: string[]): boolean {
		return action === 'vibrate';
	}

	time: number[] | undefined;

	constructor([action, ...time]: string[]) {
		super();

		// First check if vibration is available available
		if (navigator) {
			if (typeof navigator.vibrate === 'function') {
				// Since time can be a pattern made of different lengths, we have
				// to use an array
				this.time = [];
				for (const i in time) {
					// Check if all times are valid integers
					if (!isNaN(Number(time[i]))) {
						this.time[i] = parseInt(time[i]);
					} else {
						FancyError.show('action:vibrate:invalid_time', {
							time: time[i],
							statement: `<code class='language=javascript'>"${this._statement}"</code>`,
							label: this.engine.state('label'),
							step: this.engine.state('step')
						});
					}
				}
			} else {
				console.warn('Vibration is not supported in this platform.');
			}
		} else {
			console.warn('Vibration is not supported in this platform.');
		}
	}

	override async willApply(): Promise<void> {
		if (typeof this.time !== 'undefined') {
			return;
		}
		throw new Error('Time for vibration was not provided');
	}

	override async apply(): Promise<void> {
		if (this.time) {
			navigator.vibrate(0);
			navigator.vibrate(this.time);
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
		return { advance: true };
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default Vibrate;