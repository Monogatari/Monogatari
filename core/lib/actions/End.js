import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class End extends Action {

	static setup (selector) {
		$_(selector).prepend (`
			<div data-notice="exit" class="modal">
				<div class="modal__content">
					<p data-string="Confirm">Do you want to quit</p>
					<div>
						<button data-action="quit" data-string="Quit">Quit</button>
						<button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
					</div>
				</div>
			</div>
		`);
		return Promise.resolve ();
	}

	static bind (selector) {
		$_(`${selector} [data-action="end"]`).click (() => {
			$_(`${Monogatari.selector} [data-notice="exit"]`).addClass ('modal--active');
		});

		$_(`${selector} [data-action="quit"]`).click (() => {
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
		$_(`${Monogatari.selector} section`).hide ();
		return Promise.resolve ();
	}

	apply () {
		Monogatari.global ('playing', false);
		Monogatari.resetGame ();
		Monogatari.showMainMenu ();
		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

End.id = 'End';

Monogatari.registerAction (End);