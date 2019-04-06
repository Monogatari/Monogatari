import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class End extends Action {

	static bind (selector) {

		Monogatari.registerListener ('end', {
			keys: 'shift+q',
			callback: () => {
				$_(`${selector} [data-notice="exit"]`).addClass ('modal--active');
				if (Monogatari.global ('playing')) {
					Monogatari.alert ('quit-warning', {
						message: 'Confirm',
						actions: [
							{
								label: 'Quit',
								listener: 'quit'
							},
							{
								label: 'Cancel',
								listener: 'dismiss-alert'
							}
						]
					});
				}
			}
		});

		Monogatari.registerListener ('quit', {
			callback: () => {
				Monogatari.dismissAlert ('quit-warning');
				Monogatari.run ('end');
			}
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