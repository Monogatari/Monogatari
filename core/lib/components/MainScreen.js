import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class MainScreen extends Component {

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
		$_(selector).append (this.html ());
		return Promise.resolve ();
	}
}

MainScreen._id = 'MAIN_MENU';

MainScreen._html = `
	<section data-screen="main">
		<audio type="audio/mpeg" data-component="ambient"></audio>

		<div class="vertical vertical--right text--right bottom animated bounceIn" data-ui="inner-menu">
			<button data-action="start" data-string="Start">Start</button>
			<button data-action="open-screen" data-open="load" data-string="Load">Load</button>
			<button data-action="open-screen" data-open="settings" data-string="Settings">Settings</button>
			<button data-action="open-screen" data-open="help" data-string="Help">Help</button>
		</div>
	</section>
`;

Monogatari.registerComponent (MainScreen);