import Component from './../../lib/Component';
import { Monogatari } from './../../monogatari';

class MessageModal extends Component {

	constructor () {
		super ();

		this.props = {
			title: '',
			subtitle: '',
			body: ''
		};
	}

	shouldProceed () {
		return Promise.reject ('Message Modal awaiting for user to close the modal window.');
	}

	willProceed () {
		console.log ('Proceeding');
		this.remove ();
		return Promise.resolve ();
	}

	willRollback () {
		// If a choice is visible right now, we can simply remove it and let the
		// game revert to the previous statement.
		this.remove ();
		return Promise.resolve ();
	}

	onReset () {
		this.remove ();
		return Promise.resolve ();
	}

	willMount () {
		this.classList.add ('modal', 'modal--active');
		return Promise.resolve ();
	}

	didMount () {
		return Promise.resolve ();
	}

	render () {
		return `
			<div class="modal__content">
				<div data-ui="message-content" >
					<h3 data-content="title">${this.props.title}</h3>
					<p data-content="subtitle">${this.props.subtitle}</p>
					<p data-content="body">${this.props.body}</p>
				</div>
				<div class="horizontal horizontal--center" data-ui="inner-menu">
					<button data-action="close" data-close="message-modal" data-string="Close">Close</button>
				</div>
			</div>
		`;
	}
}

MessageModal._id = 'message-modal';


Monogatari.registerComponent (MessageModal);