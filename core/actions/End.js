import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class End extends Action {

	static bind (selector) {

		Monogatari.registerListener ('end', {
			keys: 'shift+q',
			callback: () => {
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
				Monogatari.dismissAlertDialog ('quit-warning');
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
		Monogatari.element ().find ('[data-screen]').hide ();
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