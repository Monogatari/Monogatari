import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { FancyError } from '../FancyError';

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
					if (!isNaN (time)) {
						this.time = parseInt (time);
					} else {
						FancyError.show (
							'The specified time was not an integer',
							'Monogatari attempted to transform the given time into an integer value but failed.',
							{
								'Specified time': time,
								'Label': Monogatari.state ('label'),
								'Step': Monogatari.state ('step'),
								'Help': {
									'_': 'Check if the value you provided is actually an integer (whole number). Remember the value used must be given in milliseconds and must not be mixed with characters other than numbers.',
									'_1': 'For example, the following statement would make a notification go away after 5 seconds:',
									'_3':`
										<pre><code class='language-javascript'>"notify Welcome 5000"</code></pre>
									`
								}
							}
						);
					}
				}
			} else {
				FancyError.show (
					`The notification "${name}" was not found`,
					`Monogatari attempted to retrieve a notification named "${name}" but it didn't exist in the notifications object.`,
					{
						'Notification': name,
						'You may have meant': Object.keys (Notify.settings.notifications),
						'Label': Monogatari.state ('label'),
						'Step': Monogatari.state ('step'),
						'Help': {
							'_': 'Check the notification\'s name is correct and that you have defined it previously. A Notification is defined as follows:',
							'_1':`
								<pre>
									<code class='language-javascript'>
										monogatari.action ('Notify', {
											notifications: {
												'Welcome': {
													title: 'Welcome!',
													body: 'This is the Monogatari VN Engine',
													icon: ''
												}
											}
										});
									</code>
								</pre>
							`,
							'_2': 'Notice the notification defined uses a name or an id, in this case it was set to "Welcome" and to show it, you must use that exact name:',
							'_3':`
								<pre><code class='language-javascript'>"notify Welcome"</code></pre>
							`
						}
					}
				);
			}
		} else {
			console.warn ('Notifications are not supported in this platform.');
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
						} else {
							console.warn ('User denied notifications permission, none will be shown.');
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

	didApply () {
		// Advance the game instead of waiting for another click
		return Promise.resolve (true);
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Notify.id = 'Notify';
Notify.settings = {
	notifications: {}
};

Monogatari.registerAction (Notify);