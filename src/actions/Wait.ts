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
				FancyError.show(
					'The specified time was not an integer',
					'Monogatari attempted to transform the given time into an integer value but failed.',
					{
						'Specified time': time,
						'Statement': `<code class='language=javascript'>"${this._statement}"</code>`,
						'Label': this.engine.state('label'),
						'Step': this.engine.state('step'),
						'Help': {
							'_': 'Check if the value you provided is actually an integer (whole number). Remember the value used must be given in milliseconds and must not be mixed with characters other than numbers.',
							'_1': 'For example, the following statement would make the game wait for 5 seconds:',
							'_3': `
								<pre><code class='language-javascript'>"wait 5000"</code></pre>
							`
						}
					}
				);
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