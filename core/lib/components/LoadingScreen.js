import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class LoadingScreen extends Component {

	static setup (selector) {
		$_(selector).append (LoadingScreen.html ());
		return Promise.resolve ();
	}
}

LoadingScreen._id = 'loading-screen';

LoadingScreen._html = `
	<section data-component="loading-screen" data-screen="loading">
		<div data-content="wrapper">
			<h2 data-string="Loading" data-content="title">Loading</h2>
			<progress data-ui="load-progress" value="0" max="100" data-content="progress_bar"></progress>
			<small data-string="LoadingMessage" data-content="message">Wait while the assets are loaded.</small>
		</div>
	</section>
`;

Monogatari.registerComponent (LoadingScreen);