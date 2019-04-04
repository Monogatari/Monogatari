import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class MainScreen extends Component {

	static setup (selector) {
		$_(selector).append (this.html ());
		return Promise.resolve ();
	}
}

MainScreen._id = 'main_screen';

MainScreen._html = `
	<section data-component="main_screen" data-screen="main">
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