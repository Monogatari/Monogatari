import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';

export class End extends Action {

	static bind () {

		this.engine.registerListener ('end', {
			keys: 'shift+q',
			callback: () => {
				if (this.engine.global ('playing')) {
					this.engine.alert ('quit-warning', {
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

		this.engine.registerListener ('quit', {
			callback: () => {
				this.engine.dismissAlertDialog ('quit-warning');
				this.engine.run ('end');
			}
		});

		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'end';
	}

	willApply () {
		this.engine.element ().find ('[data-screen]').hide ();
		return Promise.resolve ();
	}

	apply () {
		this.engine.global ('playing', false);
		this.engine.resetGame ();
		//this.engine.showMainScreen ();
		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

End.id = 'End';

Monogatari.registerAction (End);