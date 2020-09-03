import { Component } from './../../lib/Component';

class TextBox extends Component {

	constructor (...args) {
		super (...args);
		this.props = {
			mode: 'adv',
		};
	}

	show () {
		this.element ().show ('grid');
	}

	/**
	 * checkUnread - This function is used to add the unread class to the
	 * text box if new contents (dialogs) were added to it causing it to overflow
	 * but are not visible on screen right now so the player knows there is more
	 * and scrolls the element.
	 */
	checkUnread () {
		const text = this.content ('text').get (0);
		if ((text.clientHeight + text.scrollTop) < text.scrollHeight) {
			this.classList.add ('unread');
		} else {
			this.classList.remove ('unread');
		}
	}

	render () {
		return `
			<div data-content="name">
				<span data-ui="who" data-content="character-name"></span>
			</div>
			<div data-content="side-image">
				<img data-ui="face" alt="" data-content="character-expression">
			</div>
			<div data-content="text">
				<p data-ui="say" data-content="dialog"></p>
			</div>
		`;
	}
}

TextBox.tag = 'text-box';


export default TextBox;