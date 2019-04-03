import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class LoadingScreen extends Component {

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