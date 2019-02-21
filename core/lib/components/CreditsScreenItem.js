import { Component } from '../Component';
import { Monogatari } from '../monogatari';

class CreditsScreenItem extends Component {

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

	static render (section, content) {
		return this.html (null, section, content);
	}
}

CreditsScreenItem._id = 'CREDITS_MENU_ITEM';

CreditsScreenItem._html = (section, content) => {
	let html = `<h3>${section}</h3><div>`;

	if (typeof content === 'string') {
		return `
			<p class='row row--spaced'>
				<span class="row__column row__column--phone--12">${content}</span>
			</p>`;
	}

	for (const key of Object.keys (content)) {
		if (key.indexOf ('_') === 0) {
			html += `<p class='row row--spaced'>
						<span class="row__column row__column--phone--12">${content[key]}</span>
					</p>`;
		} else {
			html += `<p class='row row--spaced'>
						<b class="row__column row__column--phone--6">${key}</b>
						<span class="row__column row__column--phone--6">${content[key]}</span>
					</p>`;
		}

	}
	html += '</div>';
	return html;
};

Monogatari.registerComponent (CreditsScreenItem);