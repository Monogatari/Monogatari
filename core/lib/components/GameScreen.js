import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class GameScreen extends Component {

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
		$_(selector).append (GameScreen.html ());
		return Promise.resolve ();
	}

	static resize () {
		// TODO: get ratio from options,
		const h = Math.floor (window.innerWidth * (9/16));
		let widthCss = '100%';
		let heightCss = '100%';
		let marginTopCss = 0;

		if (h <= window.innerHeight) {
			const marginTop = Math.floor ((window.innerHeight - h)/2);
			marginTopCss = marginTop + 'px';
			heightCss = h + 'px';

		}
		else {
			const w = Math.floor (window.innerHeight * (16/9));
			widthCss = w + 'px';
		}

		$_('#game_visuals').style ({
			width: widthCss,
			height: heightCss,
			marginTop: marginTopCss,
			marginLeft: 'auto',
			marginRight: 'auto',
			backgroundSize: 'contain',
			position: 'relative'
		});
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

		GameScreen.resize();
		$_(window).on('resize', GameScreen.resize);

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

GameScreen._configuration = {};
GameScreen._state = {};
GameScreen._id = 'game_screen';

GameScreen._html = `
	<section data-component="game_screen" data-screen="game" id="game" class="unselectable">
		<div id='game_visuals'>
			<div id="particles-js" data-ui="particles"></div>
			<div id="background" data-ui="background"></div>
			<div id='components'></div>
		</div>
		<div data-component="text_box" data-ui="text">
			<img data-ui="face" alt="" data-content="character_expresion">
			<span data-ui="who" data-content="character_name"></span>
			<p data-ui="say" data_content="dialog"></p>
		</div>
		<div data-ui="quick-menu" data-component="quick-menu" class="text--right"></div>
	</section>
`;

Monogatari.registerComponent (GameScreen);