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

	static render (title, subtitle, body) {
		return this.html (null, title, subtitle, body);
	}
}

Message._configuration = {};
Message._state = {};
Message._id = 'message';

Message._html = (title, subtitle, body) => `
	<div data-component="message" data-ui="messages" class="modal  modal--active">
		<div class="modal__content">
			<div data-ui="message-content" >
				<h3 data-content="title">${title}</h3>
				<p data-content="subtitle">${subtitle}</p>
				<p data-content="body">${body}</p>
			</div>
			<div class="horizontal horizontal--center" data-ui="inner-menu">
				<button data-action="close" data-close="messages" data-string="Close">Close</button>
			</div>
		</div>
	</div>
`;

Monogatari.registerComponent (Message);