import ScreenComponent from './../../lib/ScreenComponent';
import { Monogatari } from './../../monogatari';

class GameScreen extends ScreenComponent {


	// static resize (proportionWidth, proportionHeight) {
	// 	const mainElement = $_(Monogatari.selector).get (0);

	// 	const mainWidth = mainElement.offsetWidth;
	// 	const mainHeight = mainElement.offsetHeight;

	// 	const h = Math.floor (mainWidth * (proportionHeight/proportionWidth));
	// 	let widthCss = '100%';
	// 	let heightCss = '100%';
	// 	let marginTopCss = 0;

	// 	if (h <= mainHeight) {
	// 		const marginTop = Math.floor ((mainHeight - h)/2);
	// 		marginTopCss = marginTop + 'px';
	// 		heightCss = h + 'px';

	// 	}
	// 	else {
	// 		const w = Math.floor (mainHeight * (proportionWidth/proportionHeight));
	// 		widthCss = w + 'px';
	// 	}

	// 	$_('.forceAspectRatio').style ({
	// 		width: widthCss,
	// 		height: heightCss,
	// 		marginTop: marginTopCss
	// 	});
	// }

	static bind (selector) {
		// $_(`${selector}`).on ('click', '[data-screen="game"] *:not([data-choice])', function () {
		// 	Monogatari.debug ().debug ('Next Statement Listener');
		// 	Monogatari.canProceed ().then (() => {
		// 		Monogatari.next ();
		// 	}).catch (() => {
		// 		// An action waiting for user interaction or something else
		// 		// is blocking the game.
		// 	});
		// });

		// const forceAspectRatio = Monogatari.setting ('ForceAspectRatio');

		// if (forceAspectRatio) {
		// 	const [w, h] = Monogatari.setting ('AspectRatio').split (':');
		// 	const proportionWidth = parseInt(w);
		// 	const proportionHeight = parseInt(h);

		// 	$_('[data-content="visuals"]').addClass('forceAspectRatio');
		// 	GameScreen.resize(proportionWidth, proportionHeight);
		// 	$_(window).on('resize', () => GameScreen.resize(proportionWidth, proportionHeight));
		// }

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

	render () {
		return `
			<div data-content="visuals">
				<div id="particles-js" data-ui="particles"></div>
				<div id="background" data-ui="background"></div>
				<div id='components'></div>
			</div>
		`;
	}

}

GameScreen._id = 'game-screen';

Monogatari.registerComponent (GameScreen);