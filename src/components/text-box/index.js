import { Component } from './../../lib/Component';

class TextBox extends Component {

	/**
	 * checkUnread - This function is used to add the unread class to the
	 * text box if new contents (dialogs) were added to it causing it to overflow
	 * but are not visible on screen right now so the player knows there is more
	 * and scrolls the element.
	 */
	checkUnread () {
		if ((this.clientHeight + this.scrollTop) < this.scrollHeight) {
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
					<p data-ui="say" data-content="dialog"></p>
				</div>
			</div>

		`;
	}
}

TextBox.tag = 'text-box';


export default TextBox;