import Action from './../lib/Action';
import { FancyError } from './../lib/FancyError';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class Notify extends Action {
	static override id = 'Notification';
  static override blocking = false;

	static _configuration: { notifications: Record<string, any> } = {
		notifications: {}
	};

  static override async shouldProceed(): Promise<void> {
    if (Notify.blocking) {
      throw new Error('Waiting for user input');
    }
  }

  static override async willRollback(): Promise<void> {
    Notify.blocking = false;
  }

	static override matchString([show, type]: string[]): boolean {
		return show === 'show' && type === 'notification';
	}

	static notifications(object: Record<string, any> | string | null = null): any {
		if (object !== null) {
			if (typeof object === 'string') {
				return Notify._configuration.notifications[object];
			} else {
				Notify._configuration.notifications = Object.assign({}, Notify._configuration.notifications, object);
			}
		} else {
			return Notify._configuration.notifications;
		}
	}

	hasPermission: boolean;
	notification: any;
	time: number | undefined;

	constructor([show, type, name, time]: string[]) {
		super();

		this.hasPermission = false;

		// First check if HTML5 notifications are available
		if (!('Notification' in window)) {
			console.warn('Notifications are not supported in this platform.');
		}

    // Finally check if the given notification exists in the object
    if (typeof Notify.notifications(name) !== 'undefined') {
      this.notification = Object.assign({}, Notify.notifications(name));

      if (typeof time !== 'undefined') {
        if (!isNaN(Number(time))) {
          this.time = parseInt(time);
        } else {
          FancyError.show('action:notification:invalid_time', {
            time: time,
            statement: `<code class='language=javascript'>"${this._statement}"</code>`,
            label: this.engine.state('label'),
            step: this.engine.state('step')
          });
        }
      }
    } else {
      FancyError.show('action:notification:not_found', {
        name: name,
        availableNotifications: Object.keys(Notify.notifications()),
        label: this.engine.state('label'),
        step: this.engine.state('step')
      });
    }
	}

	override async willApply(): Promise<void> {
		if (!this.notification) {
      return;
    }
    Notify.blocking = true;

    return new Promise<void>((resolve, reject) => {
      // Let's check whether notification permissions have already been granted
      if (Notification.permission === 'granted') {
        this.hasPermission = true;
        resolve();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission((permission) => {
          // If the user accepts, let's create a notification
          if (permission === 'granted') {
            this.hasPermission = true;
            resolve();
          } else {
            console.warn('User denied notifications permission, none will be shown.');
            resolve();
          }
        });
      } else {
        console.warn('The permission to display notifications was denied by the user.');
        resolve();
      }
    });
	}

	override async apply(): Promise<void> {
		if (!this.notification) {
      return;
    }

		for (const key of Object.keys(this.notification)) {
			if (typeof this.notification[key] === 'string') {
				this.notification[key] = this.engine.replaceVariables(this.notification[key]);
			}
		}

		if (this.hasPermission) {
			const notification = new Notification(this.notification.title, this.notification);

			if (typeof this.time !== 'undefined') {
				setTimeout(() => {
					notification.close();
				}, this.time);
			}
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
    Notify.blocking = false;
		// Advance the game instead of waiting for another click
		return { advance: true };
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default Notify;