import { Component } from '../Component';
import { Monogatari } from '../monogatari';

class Message extends Component {

	static render (title, subtitle, body) {
		return this.html (null, title, subtitle, body);
	}
}

Message._id = 'message-dialog';

Message._html = (title, subtitle, body) => `
	<div data-component="message" class="modal  modal--active">
		<div class="modal__content">
			<div data-ui="message-content" >
				<h3 data-content="title">${title}</h3>
				<p data-content="subtitle">${subtitle}</p>
				<p data-content="body">${body}</p>
			</div>
			<div class="horizontal horizontal--center" data-ui="inner-menu">
				<button data-action="close" data-close="message" data-string="Close">Close</button>
			</div>
		</div>
	</div>
`;

Monogatari.registerComponent (Message);