import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { FancyError } from './../lib/FancyError';

export class Vibrate extends Action {

	static matchString ([ action ]) {
		return action === 'vibrate';
	}

	constructor ([ action, ...time ]) {
		super ();

		// First check if vibration is available available
		if (navigator) {
			if (navigator.vibrate) {
				// Since time can be a pattern made of different lengths, we have
				// to use an array
				this.time = [];
				for (const i in time) {
					// Check if all times are valid integers
					if (!isNaN (time[i])) {
						this.time[i] = parseInt (time[i]);
					} else {
						FancyError.show (
							'The specified time was not an integer',
							'Monogatari attempted to transform the given time into an integer value but failed.',
							{
								'Specified time': time[i],
								'Statement': `<code class='language=javascript'>"${this._statement}"</code>`,
								'Label': Monogatari.state ('label'),
								'Step': Monogatari.state ('step'),
								'Help': {
									'_': 'Check if the value you provided is actually an integer (whole number). Remember the value used must be given in milliseconds and must not be mixed with characters other than numbers.',
									'_1': 'For example, the following statement would make the device vibrate for 5 seconds:',
									'_3':`
										<pre><code class='language-javascript'>"vibrate 5000"</code></pre>
									`,
									'_4': 'If you wanted to make the device vibrate on a pattern, this is a correct syntax:',
									'_5':`
										<pre><code class='language-javascript'>"vibrate 5000 100 4000 200 3000"</code></pre>
									`
								}
							}
						);
					}
				}
			} else {
				console.warn ('Vibration is not supported in this platform.');
			}
		} else {
			console.warn ('Vibration is not supported in this platform.');
		}
	}

	willApply () {
		if (typeof this.time !== 'undefined') {
			return Promise.resolve ();
		}
		return Promise.reject ();
	}

	apply () {
		navigator.vibrate (0);
		navigator.vibrate (this.time);
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve ({ advance: true });
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Vibrate.id = 'Vibrate';
Monogatari.registerAction (Vibrate);