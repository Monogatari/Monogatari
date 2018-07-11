import { Action } from './../Action';
import { Monogatari } from './../monogatari';

export class Notify extends Action {

	static matchString ([ action ]) {
		return action === 'notify';
	}

	constructor ([ action, name, time ]) {
		super ();

		// First check if HTML5 notifications are available
		if ('Notification' in window) {

			// Finally check if the given notification exists in the object
			if (typeof Notify.settings.notifications[name] !== 'undefined') {
				this.notification = Notify.settings.notifications[name];

				if (typeof time !== 'undefined') {
					this.time = parseInt (time);
				}
			} else {
				console.error (`The Notification ${name} could not be shown because it doesn't exist in the notifications object.`);
			}
		} else {
			console.error ('Notifications are not supported in this platform.');
		}
	}

	willApply () {
		if (typeof this.notification !== 'undefined') {
			return new Promise ((resolve, reject) => {
				// Let's check whether notification permissions have already been granted
				if (Notification.permission === 'granted') {
					resolve ();
				} else if (Notification.permission !== 'denied') {
					Notification.requestPermission((permission) => {
						// If the user accepts, let's create a notification

						if (permission === 'granted') {
							resolve ();
						}
					});
				} else {
					reject ();
				}

			});
		}

		return Promise.resolve ();
	}

	apply () {
		const notification = new Notification (this.notification.title, this.notification);

		if (typeof this.time !== 'undefined') {
			setTimeout(() => {
				notification.close ();
			}, this.time);
		}

		return Promise.resolve ();
	}
}

Notify.id = 'Notify';
Notify.settings = {
	notifications: {}
};

Monogatari.registerAction (Notify);