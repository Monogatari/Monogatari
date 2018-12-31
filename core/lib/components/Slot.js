import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import moment from 'moment';

class Slot extends Component {

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

	static render (slot, name, image, data) {
		return this.html (null, slot, name, image, data);
	}
}

Slot._id = 'SLOT';

Slot._html = (slot, name, image, data) => `
	<figure data-load-slot='${slot}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
		<button class='fas fa-times' data-delete='${slot}'></button>
		<small class='badge'>${name}</small>
		${ image ? `<img src="${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').scenes}/${image}" alt=''>` : '' }
		<figcaption>${moment (data.date).format ('MMMM Do YYYY, h:mm:ss a')}</figcaption>
	</figure>
`;

Monogatari.registerComponent (Slot);