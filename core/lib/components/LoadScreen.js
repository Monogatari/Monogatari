import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class LoadScreen extends Component {

	static html (html = null) {
		if (html !== null) {
			LoadScreen._html = html;
		} else {
			return LoadScreen._html;
		}
	}

	static setup (selector) {
		$_(selector).append (LoadScreen.html ());
		return Promise.resolve ();
	}
}

LoadScreen._configuration = {};
LoadScreen._state = {};
LoadScreen._id = 'LoadScreen';

LoadScreen._html = `
	<section data-menu="loading">
		<div class="middle">
			<h2 data-string="Loading">Loading</h2>
			<progress data-ui="load-progress" value="0" max="100"></progress>
			<small data-string="LoadingMessage">Wait while the assets are loaded.</small>
		</div>
	</section>
`;

Monogatari.registerComponent (LoadScreen);