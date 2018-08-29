import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class Game extends Component {

	static html (html = null) {
		if (html !== null) {
			Game._html = html;
		} else {
			return Game._html;
		}
	}

	static setup (selector) {
		$_(selector).append (Game.html ());
		return Promise.resolve ();
	}

	static bind (selector) {
		$_(`${selector} #game`).click (function () {
			Monogatari.canProceed ().then (() => {
				Monogatari.next ();
			}).catch (() => {
				// An action waiting for user interaction or something else
				// is blocking the game.
			});
		});

		$_(`${selector} #game [data-action="back"], ${selector} #game [data-action="back"] *`).click ((event) => {
			event.stopPropagation ();
			Monogatari.canRevert ().then (() => {
				Monogatari.revert ().catch (() => {
					// The game could not be reverted, either because an
					// action prevented it or because there are no statements
					// left to revert to.
				});
			}).catch (() => {
				// An action waiting for user interaction or something else
				// is blocking the game.
			});
		});
		return Promise.resolve ();
	}

}

Game._configuration = {};
Game._state = {};
Game._id = 'Game';

Game._html = `
	<section id="game" class="unselectable">
		<div id="particles-js" data-ui="particles"></div>
		<div id="background" data-ui="background"></div>
		<div id='components'>
			<audio type="audio/mpeg" data-component="music"></audio>
			<audio type="audio/mpeg" data-component="voice"></audio>
			<audio type="audio/mpeg" data-component="sound"></audio>
			<div class="video-wrapper text--center vertical middle" data-component="video" data-ui="video-player">
				<video type="video/mp4" data-ui="player" controls="true"></video>
				<button data-action="close-video" data-string="Close">Close</button>
			</div>
		</div>


		<div data-ui="text">
			<img data-ui="face" alt="">
			<span data-ui="who"></span>
			<p data-ui="say"></p>
		</div>
		<div data-ui="quick-menu" class="text--right"></div>
	</section>
`;

Monogatari.registerComponent (Game);