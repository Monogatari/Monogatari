import ScreenComponent from './../../lib/ScreenComponent';
import { Monogatari } from './../../monogatari';

class GameScreen extends ScreenComponent {

	static shouldProceed () {
		if (this.engine.element ().find ('[data-screen="game"]').isVisible ()) {
			return Promise.resolve ();
		}
		return Promise.reject ('Game screen is not visible.');
	}

	static bind (selector) {
		this.engine.on ('click', '[data-screen="game"] *:not([data-choice])', function () {
			Monogatari.debug.debug ('Next Statement Listener');
			Monogatari.proceed ().then (() => {
				// Nothing to do here
			}).catch (() => {
				// An action waiting for user interaction or something else
				// is blocking the game.
			});
		});

		Monogatari.registerListener ('back', {
			keys: 'left',
			callback: () => {
				Monogatari.global ('block', false);
				Monogatari.rollback ().then (() => {
					// Nothing to do here
				}).catch ((e) => {
					// An action waiting for user interaction or something else
					// is blocking the game.
				});
			}
		});

		return Promise.resolve ();
	}

	render () {
		return `
			<div data-content="visuals">
				<div id="particles-js" data-ui="particles"></div>
				<div id="background" data-ui="background"></div>
			</div>
		`;
	}

}

GameScreen._id = 'game-screen';

Monogatari.registerComponent (GameScreen);