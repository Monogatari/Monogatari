import { Component } from '../Component';
import { Monogatari } from '../monogatari';

class LoadingScreen extends Component {

	static setup () {
		Monogatari.element ().append (this.html ());
		return Promise.resolve ();
	}

	static render () {
		// Update the progress bar when the state is updated
		this.content ('progress').value (this.state ('progress'));
		return Promise.resolve ();
	}

}

LoadingScreen._state = {
	progress: 0
};

LoadingScreen._id = 'loading-screen';

LoadingScreen._html = `
	<section data-component="loading-screen" data-screen="loading">
		<div data-content="wrapper">
			<h2 data-string="Loading" data-content="title">Loading</h2>
			<progress value="0" max="100" data-content="progress"></progress>
			<small data-string="LoadingMessage" data-content="message">Wait while the assets are loaded.</small>
		</div>
	</section>
`;

Monogatari.registerComponent (LoadingScreen);