import ScreenComponent from './../../lib/ScreenComponent';
import { Monogatari } from './../../monogatari';
import { Platform, Text } from '@aegis-framework/artemis';

class SettingsScreen extends ScreenComponent {

	static bind () {
		// Fix for select labels
		this.engine.element ().on ('click', '[data-select]', () => {
			const e = document.createEvent ('MouseEvents');
			e.initMouseEvent ('mousedown');
			this.engine.element ().find (`[data-action='${this.dataset.select}']`).first ().dispatchEvent (e);
		});

		return Promise.resolve ();
	}

	// static init (selector) {



	// 	// Set the electron quit handler.
	// 	if (Platform.electron ()) {
	// 		SettingsScreen.electron (selector);
	// 	} else {
	// 		$_(`${selector} [data-platform="electron"]`).hide ();
	// 	}

	// 	return Promise.resolve ();
	// }

	// static electron (selector) {
	// 	const remote = require ('electron').remote;
	// 	const win = remote.getCurrentWindow ();

	// 	$_(`${selector} [data-action="set-resolution"]`).value (Monogatari.preference ('Resolution'));

	// 	window.addEventListener ('beforeunload', (event) => {
	// 		event.preventDefault ();
	// 		$_(`${selector} [data-notice="exit"]`).addClass ('modal--active');
	// 	});

	// 	if (!win.isResizable ()) {
	// 		const aspectRatio = Monogatari.setting ('AspectRatio').split (':');
	// 		const aspectRatioWidth = parseInt (aspectRatio[0]);
	// 		const aspectRatioHeight = parseInt (aspectRatio[1]);
	// 		const minSize = win.getMinimumSize ();
	// 		const {width, height} = remote.screen.getPrimaryDisplay ().workAreaSize;

	// 		for (let i = 0; i < 488; i+=8) {
	// 			const calculatedWidth = aspectRatioWidth * i;
	// 			const calculatedHeight = aspectRatioHeight * i;

	// 			if (calculatedWidth >= minSize[0] && calculatedHeight >= minSize[1] && calculatedWidth <= width && calculatedHeight <= height) {
	// 				$_(`${selector} [data-action="set-resolution"]`).append(`<option value="${calculatedWidth}x${calculatedHeight}">${Monogatari.string ('Windowed')} ${calculatedWidth}x${calculatedHeight}</option>`);
	// 			}
	// 		}

	// 		$_(`${selector} [data-action="set-resolution"]`).append(`<option value="fullscreen">${Monogatari.string ('FullScreen')}</option>`);

	// 		SettingsScreen.changeWindowResolution (Monogatari.preference ('Resolution'));
	// 		$_(`${selector} [data-action="set-resolution"]`).change(function () {
	// 			const size = $_(this).value ();
	// 			SettingsScreen.changeWindowResolution (size);
	// 		});
	// 	} else {
	// 		$_(`${selector} [data-settings="resolution"]`).hide ();
	// 	}
	// }

	// static changeWindowResolution (resolution) {
	//	/* global require */
	// 	const remote = require ('electron').remote;
	// 	const win = remote.getCurrentWindow ();
	// 	const {width, height} = remote.screen.getPrimaryDisplay ().workAreaSize;
	// 	if (resolution) {
	// 		win.setResizable (true);

	// 		if (resolution == 'fullscreen' && !win.isFullScreen () && win.isFullScreenable ()) {
	// 			win.setFullScreen(true);
	// 			Monogatari.preference ('Resolution', resolution);
	// 		} else if (resolution.indexOf ('x') > -1) {
	// 			win.setFullScreen (false);
	// 			const size = resolution.split ('x');
	// 			const chosenWidth = parseInt (size[0]);
	// 			const chosenHeight = parseInt (size[1]);

	// 			if (chosenWidth <= width && chosenHeight <= height) {
	// 				win.setSize(chosenWidth, chosenHeight, true);
	// 				Monogatari.preference ('Resolution', resolution);
	// 			}
	// 		}
	// 		win.setResizable (false);
	// 	}
	// }

	didMount () {
		this.engine.on ('didInit', () => {
			if (this.engine.setting ('MultiLanguage') === true) {
				this.content ('wrapper').html (`
					<select data-action="set-language" data-content="language-selector">
						${Object.keys (this.engine._script).map ((language) => `<option value="${language}">${language}</option>`)}
					</select>
					<span class="fas fa-sort" data-select="set-language"></span>
				`);
				this.content ('language-selector').value (this.engine.preference ('Language'));

				// Bind Language select so that every time a language is selected, the
				// ui and game get correctly localized.
				this.content ('language-selector').change (() => {
					this.engine.preference ('Language', this.content ('language-selector').value ());
					this.engine.localize ();
				});
			} else {
				this.content ('language-settings').remove ();
			}


			for (const mediaType of Object.keys (this.engine.mediaPlayers ())) {
				this.content (`${mediaType}-audio-controller`).value ('value', this.engine.preference ('Volume')[Text.capitalize (mediaType)]);
			}
		});

		// Disable audio settings in iOS since they are not supported
		if (Platform.mobile ('iOS')) {
			// iOS handles the volume using the system volume, therefore there is now way to
			// handle each of the sound sources individually and as such, this is disabled.
			this.content ('audio-settings').html (`<p>${this.engine.string ('iOSAudioWarning')}</p>`);
		}

		const engine = this.engine;
		this.content ('auto-play-speed-controller').on ('change mouseover', function () {
			const value = engine.setting ('maxAutoPlaySpeed') - parseInt(this.value);
			engine.preference ('AutoPlaySpeed', value);
		});

		this.engine.setting ('maxAutoPlaySpeed', parseInt (this.content ('auto-play-speed-controller').property ('max')));
		this.content ('auto-play-speed-controller').value (this.engine.preference ('AutoPlaySpeed'));
	}

	render () {
		return `
			<button class="fas fa-arrow-left top left" data-action="back"></button>
			<h2 data-string="Settings">Settings</h2>
			<div class="row row--spaced padded text---center">
				<div class="row__column row__column--12 row__column--phone--12 row__column--phablet--12 row__column--tablet--6 row__column--desktop--6 row__column--desktop-large--6 row__column--retina--6">
					<div data-settings="audio" class="vertical vertical--center text--center" data-content="audio-settings">
						<h3 data-string="Audio">Audio</h3>
						<span data-string="Music">Music Volume:</span>
						<input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="music">
						<span data-string="Sound">Sound Volume:</span>
						<input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="sound">
						<span data-string="Voice">Voice Volume:</span>
						<input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="voice">
					</div>
				</div>

				<div class="row__column row__column--12 row__column--phone--12 row__column--phablet--12 row__column--tablet--6 row__column--desktop--6 row__column--desktop-large--6 row__column--retina--6">

					<div data-settings="text-speed">
						<h3 data-string="TextSpeed">Text Speed</h3>
						<input type="range" min="1" max="50" step="1" data-action="set-text-speed">
					</div>

					<div data-settings="auto-play-speed">
						<h3 data-string="AutoPlaySpeed">Auto Play Speed</h3>
						<input type="range" min="0" max="60" step="1" data-action="set-auto-play-speed" data-content="auto-play-speed-controller">
					</div>

					<div data-settings="language" data-content="language-settings">
						<h3 data-string="Language">Language</h3>
						<div class="horizontal horizontal--center" data-content="wrapper"></div>
					</div>

					<div data-settings="resolution" data-platform="electron">
						<h3 data-string="Resolution">Resolution</h3>
						<div class="horizontal">
							<select data-action="set-resolution"></select>
							<span class="fas fa-sort" data-select="set-resolution"></span>
						</div>
					</div>
				</div>
			</div>
		`;
	}
}

SettingsScreen._id = 'settings-screen';


Monogatari.registerComponent (SettingsScreen);