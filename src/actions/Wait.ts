import Action from './../lib/Action';
import { FancyError } from './../lib/FancyError';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class Wait extends Action {
	static override id = 'Wait';

	static override matchString([action]: string[]): boolean {
		return action === 'wait';
	}

	time: number | undefined;

	constructor([action, time]: string[]) {
		super();
		// Check if the provided time is a valid integer
		if (!isNaN(Number(time))) {
			this.time = parseInt(time);
		} else {
			if (typeof time !== 'undefined') {
				FancyError.show('action:wait:invalid_time', {
					time: time,
					statement: `<code class='language=javascript'>"${this._statement}"</code>`,
					label: this.engine.state('label'),
					step: this.engine.state('step')
				});
			}
		}
	}

	override async apply(): Promise<void> {
    if (typeof this.time !== 'number') {
      return;
    }

		return new Promise<void>((resolve) => {
			this.engine.global('block', true);

			setTimeout(() => {
				this.engine.global('block', false);
				resolve();
			}, this.time);
		});
	}

	override async didApply(): Promise<ActionApplyResult> {
		return { advance: typeof this.time === 'number' };
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default Wait;