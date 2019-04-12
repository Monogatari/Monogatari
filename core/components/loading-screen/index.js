import ScreenComponent from './../../lib/ScreenComponent';
import { Monogatari } from './../../monogatari';

class LoadingScreen extends ScreenComponent {

	constructor () {
		super ();

		this._state = {
			progress: 0
		};
	}

	didMount () {
		this.constructor.engine.element ().on ('asset-loaded', (event) => {
			const progress = this.state.progress;
			this.setState ({
				progress: progress + 1
			});

		});
		return Promise.resolve ();
	}

	update (origin, property, oldValue, newValue) {
		if (property === 'progress') {
			this.content ('progress').attribute ('max', newValue);
			this.content ('progress').value (newValue);
		}
	}

	render () {
		return `
			<div data-content="wrapper">
				<h2 data-string="Loading" data-content="title">Loading</h2>
				<progress value="0" max="100" data-content="progress"></progress>
				<small data-string="LoadingMessage" data-content="message">Wait while the assets are loaded.</small>
			</div>
		`;
	}
}

LoadingScreen._id = 'loading-screen';

Monogatari.registerComponent (LoadingScreen);