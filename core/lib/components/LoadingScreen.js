import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class LoadingScreen extends Component {

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
		$_(selector).append (LoadingScreen.html ());
		return Promise.resolve ();
	}
}

LoadingScreen._configuration = {};
LoadingScreen._state = {};
LoadingScreen._id = 'loading_screen';

LoadingScreen._html = `
	<section data-component="loading_screen" data-screen="loading">
		<div class="middle">
			<h2 data-string="Loading">Loading</h2>
			<progress data-ui="load-progress" value="0" max="100"></progress>
			<small data-string="LoadingMessage">Wait while the assets are loaded.</small>
		</div>
	</section>
`;

Monogatari.registerComponent (LoadingScreen);