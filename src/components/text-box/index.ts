import type { Properties } from '@aegis-framework/pandora';
import Component from '../../lib/Component';

interface TextBoxProps extends Properties {
	mode: 'adv' | 'nvl';
}

interface TextBoxState extends Properties {
	hidden: boolean;
}

class TextBox extends Component<TextBoxProps, TextBoxState> {
	constructor () {
		super();

		this.props = {
			mode: 'adv',
		};

		this.state = {
			hidden: false,
		};
	}

	override onStateUpdate (property: string, _oldValue: unknown, newValue: unknown): Promise<void> {
		if (property === 'hidden') {
			if (newValue === true) {
				this.element().hide();
			} else {
				this.element().show('grid');
			}
		}

		return Promise.resolve();
	}

	show (): void {
		if (this.state.hidden) {
			return;
		}

		this.element().show('grid');
	}

	/**
	 * checkUnread - This function is used to add the unread class to the
	 * text box if new contents (dialogs) were added to it causing it to overflow
	 * but are not visible on screen right now so the player knows there is more
	 * and scrolls the element.
	 */
	checkUnread (): void {
		const text = this.content('text').get(0) as HTMLElement | undefined;

		if (!text) {
			return;
		}

		if ((text.clientHeight + text.scrollTop) < text.scrollHeight) {
			this.classList.add('unread');
		} else {
			this.classList.remove('unread');
		}
	}

	override async render (): Promise<string> {
		// In NVL mode, we don't want a static type-writer element
		// as dialogs will be appended dynamically
		const typeWriterElement = this.props.mode === 'nvl' ? '' : '<type-writer data-ui="say" data-content="dialog"></type-writer>';

		return `
			<div data-content="name">
				<span data-ui="who" data-content="character-name"></span>
			</div>
			<div data-content="side-image">
				<img data-ui="face" alt="" data-content="character-expression">
			</div>
			<div data-content="text">
				${typeWriterElement}
			</div>
		`;
	}
}

TextBox.tag = 'text-box';

export default TextBox;
