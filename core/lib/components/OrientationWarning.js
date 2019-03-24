import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class OrientationWarning extends Component {

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

	static setup (selector) {
		$_(selector).prepend (OrientationWarning.html ());
		return Promise.resolve ();
	}
}

OrientationWarning._configuration = {};
OrientationWarning._state = {};
OrientationWarning._id = 'orientation_warning';

OrientationWarning._html = `
	<div data-component="orientation_warning" data-notice="orientation" class="modal">
		<div class="modal__content">
			<p data-string="OrientationWarning">Please rotate your device to play.</p>
		</div>
	</div>
`;

Monogatari.registerComponent (OrientationWarning);