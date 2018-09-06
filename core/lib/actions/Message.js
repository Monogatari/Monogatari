import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';
import { FancyError } from '../FancyError';


export class Message extends Action {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Message._configuration[object];
			} else {
				Message._configuration = Object.assign ({}, Message._configuration, object);
			}
		} else {
			return Message._configuration;
		}
	}

	static setup (selector) {
		$_(`${selector} #game #components`).append (`
			<div data-component="modal" data-ui="messages" class="middle">
				<div data-ui="message-content"></div>
				<div class="horizontal horizontal--center" data-ui="inner-menu">
					<button data-action="close" data-close="messages" data-string="Close">Close</button>
				</div>
			</div>
		`);
		return Promise.resolve ();
	}

	static reset () {
		$_(`${Monogatari.selector} [data-ui="messages"]`).removeClass ('active');
		return Promise.resolve ();
	}

	static canProceed () {
		if ($_(`${Monogatari.selector} [data-ui="messages"]`).isVisible ()) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	static canRevert () {
		if ($_(`${Monogatari.selector} [data-ui="messages"]`).isVisible ()) {
			$_(`${Monogatari.selector} [data-ui="messages"]`).removeClass ('active');
			$_(`${Monogatari.selector} [data-ui="message-content"]`).html ('');
			Monogatari.global ('block', false);
		}
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

	constructor ([ show, type, message ]) {
		super ();
		this.id = message;
		this.message = Message.messages (message);
	}

	willApply () {
		if (typeof this.message !== 'undefined') {
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
											Title: 'Welcome!',
											Subtitle: 'This is the Monogatari VN Engine',
											Message: 'This is where the magic gets done!'
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
		$_(`${Monogatari.selector} [data-ui="message-content"]`).html (`
			<h3>${this.message.Title}</h3>
			<p>${this.message.Subtitle}</p>
			<p>${this.message.Message}</p>
		`);
		$_(`${Monogatari.selector} [data-ui="messages"]`).addClass ('active');
		return Promise.resolve ();
	}

	revert () {
		$_(`${Monogatari.selector} [data-ui="message-content"]`).html ('');
		$_(`${Monogatari.selector} [data-ui="messages"]`).removeClass ('active');
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Message.id = 'Message';
Message._configuration = {
	messages: {}
};

Monogatari.registerAction (Message);