import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';

/**
 * Props for MessageModal component
 */
export interface MessageModalProps extends Properties {
	title: string | null;
	subtitle: string | null;
	body: string;
	actionString: string;
}

class MessageModal extends Component<MessageModalProps, Properties> {
	static override tag = 'message-modal';

	constructor() {
		super();

		this.props = {
			title: null,
			subtitle: null,
			body: '',
			actionString: 'Close'
		};
	}

	override shouldProceed(): Promise<void> {
		return Promise.reject('Message Modal awaiting for user to close the modal window.');
	}

	override willProceed(): Promise<void> {
		this.remove();
		return Promise.resolve();
	}

	override willRollback(): Promise<void> {
		// If a choice is visible right now, we can simply remove it and let the
		// game revert to the previous statement.
		this.remove();
		return Promise.resolve();
	}

	override onReset(): Promise<void> {
		this.remove();
		return Promise.resolve();
	}

	override willMount(): Promise<void> {
		this.classList.add('modal', 'modal--active');
		return Promise.resolve();
	}

	override render(): string {
		const { title, subtitle, body } = this.props;
		return `
			<div class="modal__content">
				<div data-ui="message-content" >
					${typeof title === 'string' && title ? `<h3 data-content="title">${title}</h3>` : ''}
					${typeof subtitle === 'string' && subtitle ? `<p data-content="subtitle">${subtitle}</p>` : ''}
					${typeof body === 'string' && body ? `<p data-content="body">${body}</p>` : ''}
				</div>
				<div class="horizontal horizontal--center" data-ui="inner-menu">
					<button data-action="close" data-close="message-modal" data-string="Close">${this.engine.string(this.props.actionString)}</button>
				</div>
			</div>
		`;
	}
}

export default MessageModal;

