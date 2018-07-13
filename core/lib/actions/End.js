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
	}

	static bind () {
		$_('[data-action="end"]').click (() => {
			$_('[data-notice="exit"]').addClass ('modal--active');
		});

		$_('[data-action="quit"]').click (() => {
			$_('[data-notice="exit"]').removeClass ('modal--active');
			Monogatari.run ('end');
		});
	}

	static matchString ([ action ]) {
		return action === 'end';
	}

	constructor ([ action ]) {
		super ();
	}

	willApply () {
		$_('section').hide ();
		return Promise.resolve ();
	}

	apply () {
		Monogatari.global ('playing', false);
		Monogatari.resetGame ();

		// Show main menu
		Monogatari.playAmbient ();
		$_('[data-menu="main"]').show ();
		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

End.id = 'End';

Monogatari.registerAction (End);