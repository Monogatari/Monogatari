import Component from './../../lib/Component';
import { Monogatari } from './../../monogatari';

class TextBox extends Component {

	/**
	 * checkUnread - This function is used to add the unread class to the
	 * text box if new contents (dialogs) were added to it causing it to overflow
	 * but are not visible on screen right now so the player knows there is more
	 * and scrolls the element.
	 */
	checkUnread () {
		const height = this.clientHeight;
		const scrollHeight = this.scrollHeight;

		if (height < scrollHeight) {
			this.classList.add ('unread');
		} else {
			this.classList.remove ('unread');
		}
	}

	render () {
		return `
			<div data-content="wrapper">
				<div data-content="side-image">
					<img data-ui="face" alt="" data-content="character_expression">
				</div>
				<div data-content="text">
					<span data-ui="who" data-content="character-name"></span>
					<p data-ui="say" data_content="dialog"></p>
				</div>
			</div>

		`;
	}
}

TextBox._id = 'text-box';

Monogatari.registerComponent (TextBox);