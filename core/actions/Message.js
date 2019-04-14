import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { FancyError } from './../lib/FancyError';


export class Message extends Action {

	static reset () {
		Monogatari.component ('mesage-dialog').element ().remove ();
		return Promise.resolve ();
	}

	static canProceed () {
		if (Monogatari.component ('mesage-dialog').element ().isVisible ()) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	static canRevert () {
		if (Monogatari.component ('mesage-dialog').element ().isVisible ()) {
			Monogatari.component ('mesage-dialog').element ().remove ();
			Monogatari.global ('block', false);
		}

		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'mesage-dialog';
	}

	static messages (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Message._configuration.messages[object];
			} else {
				Message._configuration.messages = Object.assign ({}, Message._configuration.messages, object);
			}
		} else {
			return Message._configuration.messages;
		}
	}

	constructor ([ show, type, message, ...classes ]) {
		super ();
		this.id = message;
		this.message = Message.messages (message);
		this.classes = classes;
	}

	willApply () {
		if (typeof this.message !== 'undefined') {
			// Check if the old format is being use and translate it to the new one
			if (this.message.Title && this.message.Subtitle && this.message.Message) {
				this.message.title = this.message.Title;
				this.message.subtitle = this.message.Subtitle;
				this.message.body = this.message.Message;
			}
			return Promise.resolve ();
		} else {
			FancyError.show (
				`The message "${this.id}" was not found`,
				`Monogatari attempted to retrieve a message named "${this.id}" but it didn't exist in the messages object.`,
				{
					'Message': this.id,
					'You may have meant': Object.keys (Message.messages ()),
					'Label': Monogatari.state ('label'),
					'Step': Monogatari.state ('step'),
					'Help': {
						'_': 'Check the message name is correct and that you have defined it previously. A Message is defined as follows:',
						'_1':`
							<pre>
								<code class='language-javascript'>
									Monogatari.action ('Message').mesages ({
										'Welcome': {
											title: 'Welcome!',
											subtitle: 'This is the Monogatari VN Engine',
											body: 'This is where the magic gets done!'
										}
									});
								</code>
							</pre>
						`,
						'_2': 'Notice the message defined uses a name or an id, in this case it was set to "Welcome" and to show it, you must use that exact name:',
						'_3':`
							<pre><code class='language-javascript'>"show message Welcome"</code></pre>
						`
					}
				}
			);
		}
		return Promise.reject ();
	}

	apply () {

		Monogatari.element ().find ('[data-screen="game"]').append (
			Monogatari.replaceVariables(Monogatari.component ('mesage-dialog').render (this.message.title, this.message.subtitle, this.message.body))
		);

		Monogatari.component ('mesage-dialog').element ().addClass ('animated');

		for (const newClass of this.classes) {
			Monogatari.component ('mesage-dialog').element ().addClass (newClass);
		}

		return Promise.resolve ();
	}

	revert () {
		Monogatari.component ('mesage-dialog').element ().remove ();
		return this.apply ();
	}

	didRevert () {
		return Promise.resolve ({ advance: false, step: true });
	}
}

Message.id = 'Message';
Message._configuration = {
	messages: {}
};

Monogatari.registerAction (Message);