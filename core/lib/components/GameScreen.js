import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class GameScreen extends Component {

	static setup (selector) {
		$_(selector).append (GameScreen.html ());
		return Promise.resolve ();
	}

	static bind (selector) {
		$_(`${selector}`).on ('click', '[data-screen="game"] *:not([data-choice])', function () {
			Monogatari.debug ().debug ('Next Statement Listener');
			Monogatari.canProceed ().then (() => {
				Monogatari.next ();
			}).catch (() => {
				// An action waiting for user interaction or something else
				// is blocking the game.
			});
		});

		Monogatari.registerListener ('back', {
			keys: 'left',
			callback: () => {
				Monogatari.global ('block', false);
				Monogatari.canRevert ().then (() => {
					Monogatari.previous ();
				}).catch ((e) => {
					// An action waiting for user interaction or something else
					// is blocking the game.
				});
			}
		});

		return Promise.resolve ();
	}

}

GameScreen._id = 'game-screen';

GameScreen._html = `
	<section data-component="game-screen" data-screen="game" id="game" class="unselectable">
		<div id="particles-js" data-ui="particles"></div>
		<div id="background" data-ui="background"></div>
		<div id='components'></div>
		<div data-component="text_box" data-ui="text">
			<img data-ui="face" alt="" data-content="character_expression">
			<span data-ui="who" data-content="character_name"></span>
			<p data-ui="say" data_content="dialog"></p>
		</div>
		<div data-ui="quick-menu" data-component="quick-menu" class="text--right"></div>
	</section>
`;

Monogatari.registerComponent (GameScreen);