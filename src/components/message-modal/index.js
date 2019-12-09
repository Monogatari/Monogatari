import { Component } from './../../lib/Component';

class MessageModal extends Component {

	constructor () {
		super ();

		this.props = {
			title: null,
			subtitle: null,
			body: ''
		};
	}

	shouldProceed () {
		return Promise.reject ('Message Modal awaiting for user to close the modal window.');
	}

	willProceed () {
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

	render () {
		const { title, subtitle, body } = this.props;
		return `
			<div class="modal__content">
				<div data-ui="message-content" >
					${ typeof title === 'string' && title ? `<h3 data-content="title">${title}</h3>` : '' }
					${ typeof subtitle === 'string' && subtitle ? `<p data-content="subtitle">${subtitle}</p>` : '' }
					${ typeof body === 'string' && body ? `<p data-content="body">${body}</p>` : '' }
				</div>
				<div class="horizontal horizontal--center" data-ui="inner-menu">
					<button data-action="close" data-close="message-modal" data-string="Close">${monogatari.string ('Close')}</button>
				</div>
			</div>
		`;
	}
}

MessageModal.tag = 'message-modal';



export default MessageModal;