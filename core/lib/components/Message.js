import { Component } from '../Component';
import { Monogatari } from '../monogatari';

class Message extends Component {

	static html (html = null, ...params) {
		if (html !== null && typeof params === 'undefined') {
			this._html = html;
		} else {
			// Check if additional parameters have been sent to a rendering function
			if (typeof params !== 'undefined' && typeof this._html === 'function') {
				if (html === null) {
					return this._html.call (this, ...params);
				} else {
					return this._html.call (html, ...params);
				}
			}

			// Check if no parameters were set but the HTML is still a function to be called
			if (typeof params === 'undefined' && html === null && typeof this._html === 'function') {
				return this._html.call (this);
			}

			// If this is reached, the HTML was just a string
			return this._html;
		}
	}

	static render (title, subtitle, message) {
		return this.html (null, title, subtitle, message);
	}
}

Message._configuration = {};
Message._state = {};
Message._id = 'MESSAGE';

Message._html = (title, subtitle, message) => `
	<div data-component="modal" data-ui="messages" class="middle active">
		<div data-ui="message-content">
			<h3>${title}</h3>
			<p>${subtitle}</p>
			<p>${message}</p>
		</div>
		<div class="horizontal horizontal--center" data-ui="inner-menu">
			<button data-action="close" data-close="messages" data-string="Close">Close</button>
		</div>
	</div>
`;

Monogatari.registerComponent (Message);