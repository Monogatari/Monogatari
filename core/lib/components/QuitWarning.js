import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class QuitWarning extends Component {

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
		$_(selector).prepend (QuitWarning.html ());
		return Promise.resolve ();
	}
}

QuitWarning._id = 'quit_warning';

QuitWarning._html = `
	<div data-component="quit_warning" data-notice="exit" class="modal">
		<div class="modal__content">
			<p data-string="Confirm">Do you want to quit</p>
			<div>
				<button data-action="quit" data-string="Quit">Quit</button>
				<button data-action="dismiss-notice" data-string="Cancel">Cancel</button>
			</div>
		</div>
	</div>
`;

Monogatari.registerComponent (QuitWarning);