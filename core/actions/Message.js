import { Action } from './../lib/Action';
import { FancyError } from './../lib/FancyError';


export class Message extends Action {

	static bind () {
		// The close action removes the active class from the element it
		// points to.
		this.engine.on ('click', '[data-component="message-modal"] [data-action="close"]', () => {
			this.engine.global ('block', false);
			this.engine.element ().find ('[data-component="message-modal"]').remove ();
			this.engine.proceed ();
		});
		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'message';
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
		this.message = this.constructor.messages (message);
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
					'Label': this.engine.state ('label'),
					'Step': this.engine.state ('step'),
					'Help': {
						'_': 'Check the message name is correct and that you have defined it previously. A Message is defined as follows:',
						'_1':`
							<pre>
								<code class='language-javascript'>
									this.engine.action ('message').mesages ({
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

		this.engine.global ('block', true);

		const element = document.createElement ('message-modal');

		if (typeof this.message.title === 'string') {
			element.setProps ({
				title: this.engine.replaceVariables (this.message.title)
			});
		}

		if (typeof this.message.subtitle === 'string') {
			element.setProps ({
				subtitle: this.engine.replaceVariables (this.message.subtitle)
			});
		}

		if (typeof this.message.body === 'string') {
			element.setProps ({
				body: this.engine.replaceVariables (this.message.body)
			});
		}

		for (const newClass of this.classes) {
			if (newClass) {
				element.classList.add (newClass);
			}
		}

		this.engine.element ().find ('[data-screen="game"]').append (element);


		return Promise.resolve ();
	}

	revert () {
		this.engine.component ('message-modal').instances ().remove ();
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

export default Message;