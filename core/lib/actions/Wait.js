import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { FancyError } from '../FancyError';

export class Wait extends Action {

	static matchString ([ action ]) {
		return action === 'wait';
	}

	constructor ([ action, time ]) {
		super ();
		// Check if the provided time is a valid integer
		if (!isNaN (time)) {
			this.time = parseInt (time);
		} else {
			FancyError.show (
				'The specified time was not an integer',
				'Monogatari attempted to transform the given time into an integer value but failed.',
				{
					'Specified time': time,
					'Statement': `<code class='language=javascript'>"${this._statement}"</code>`,
					'Label': Monogatari.state ('label'),
					'Step': Monogatari.state ('step'),
					'Help': {
						'_': 'Check if the value you provided is actually an integer (whole number). Remember the value used must be given in milliseconds and must not be mixed with characters other than numbers.',
						'_1': 'For example, the following statement would make the game wait for 5 seconds:',
						'_3':`
							<pre><code class='language-javascript'>"wait 5000"</code></pre>
						`
					}
				}
			);
		}
	}

	apply () {
		return new Promise ((resolve) => {
			// Block the game so the player can't advance
			Monogatari.global ('block', true);

			// Set the timeout for the specified time
			setTimeout (() => {
				// Unlock the game when the timeout ends.
				Monogatari.global ('block', false);
				resolve ();
			}, this.time);
		});
	}

	didApply () {
		return Promise.resolve ({ advance: true });
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Wait.id = 'Wait';

Monogatari.registerAction (Wait);