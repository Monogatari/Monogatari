import { Action } from './../lib/Action';

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
				this.engine.dismissAlert ('quit-warning');

				if (this.engine.global ('playing') === true) {
					this.engine.run ('end');
				} else {
					if (typeof window.ipcRendererReceive === 'function' && typeof window.ipcRendererSend === 'function') {
						window.ipcRendererSend ('quit-request');
					}
				}
			}
		});

		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'end';
	}

	willApply () {
		this.engine.hideScreens ();
		return Promise.resolve ();
	}

	apply () {
		this.engine.global ('playing', false);
		this.engine.resetGame ();
		this.engine.showMainScreen ();
		this.engine.element ().find ('quick-menu').removeClass ('splash-screen');
		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

End.id = 'End';

export default End;