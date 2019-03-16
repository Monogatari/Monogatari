import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class End extends Action {

	static bind (selector) {
		$_(selector).on ('click', '[data-action="end"], [data-action="end"] *', () => {
			$_(`${selector} [data-notice="exit"]`).addClass ('modal--active');
		});

		$_(selector).on ('click', '[data-action="quit"], [data-action="quit"] *', () => {
			$_(`${selector} [data-notice="exit"]`).removeClass ('modal--active');
			Monogatari.run ('end');
		});
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'end';
	}

	constructor ([ action ]) {
		super ();
	}

	willApply () {
		$_(`${Monogatari.selector} [data-screen]`).hide ();
		return Promise.resolve ();
	}

	apply () {
		Monogatari.global ('playing', false);
		Monogatari.resetGame ();
		Monogatari.showMainScreen ();
		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

End.id = 'End';

Monogatari.registerAction (End);