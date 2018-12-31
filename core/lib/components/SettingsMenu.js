import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_, Platform } from '@aegis-framework/artemis';

/* global require */

class SettingsMenu extends Component {

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

		$_(selector).append (SettingsMenu.html ());
		if (Monogatari.setting ('MultiLanguage') === true) {
			$_(`${selector} [data-settings="language"] div`).html ('');
			$_(`${selector} [data-settings="language"] div`).html (`
				<select data-action="set-language">
					${Object.keys (Monogatari._script).map ((language) => `<option value="${language}">${language}</option>`)}
				</select>
				<span class="fas fa-sort" data-select="set-language"></span>
			`);
			$_(`${selector} [data-action="set-language"]`).value (Monogatari.preference ('Language'));
		} else {
			$_(`${selector} [data-settings="language"]`).hide ();
		}
		return Promise.resolve ();
	}

	static bind (selector) {
		// Fix for select labels
		$_(`${selector} [data-select]`).click (function () {
			const e = document.createEvent ('MouseEvents');
			e.initMouseEvent ('mousedown');
			$_(`${selector} [data-action='${$_(this).data ('select')}']`).get (0). dispatchEvent (e);
		});

		// Bind Language select so that every time a language is selected, the
		// ui and game get correctly localized.
		$_(`${selector} [data-action="set-language"]`).change (function () {
			Monogatari.preference ('Language', $_(this).value ());
			Monogatari.localize ();
		});

		$_(`${selector} [data-action="set-auto-play-speed"]`).on ('change mouseover', function () {
			const value = Monogatari.setting ('maxAutoPlaySpeed') - parseInt($_(this).value());
			Monogatari.preference ('AutoPlaySpeed', value);
		});
		return Promise.resolve ();
	}

	static init (selector) {
		// Disable audio settings in iOS since they are not supported
		if (Platform.mobile ('iOS')) {
			// iOS handles the volume using the system volume, therefore there is now way to
			// handle each of the sound sources individually and as such, this is disabled.
			$_(`${selector} [data-settings="audio"]`).html (`<p>${Monogatari.string ('iOSAudioWarning')}</p>`);
		}

		Monogatari.setting ('maxAutoPlaySpeed', parseInt ($_(`${selector} [data-action="set-auto-play-speed"]`).property ('max')));
		document.querySelector(`${selector} [data-action="set-auto-play-speed"]`).value = Monogatari.preference ('AutoPlaySpeed');

		// Set the electron quit handler.
		if (Platform.electron ()) {
			SettingsMenu.electron (selector);
		} else {
			$_(`${selector} [data-platform="electron"]`).hide ();
		}

		return Promise.resolve ();
	}

	static render () {
		return Promise.resolve ();
	}

	static electron (selector) {
		const remote = require ('electron').remote;
		const win = remote.getCurrentWindow ();

		$_(`${selector} [data-action="set-resolution"]`).value (Monogatari.preference ('Resolution'));

		window.addEventListener ('beforeunload', (event) => {
			event.preventDefault ();
			$_(`${selector} [data-notice="exit"]`).addClass ('modal--active');
		});

		if (!win.isResizable ()) {
			const aspectRatio = Monogatari.setting ('AspectRatio').split (':');
			const aspectRatioWidth = parseInt (aspectRatio[0]);
			const aspectRatioHeight = parseInt (aspectRatio[1]);
			win.setResizable (true);
			const minSize = win.getMinimumSize ();
			const {width, height} = remote.screen.getPrimaryDisplay ().workAreaSize;
			win.setResizable (false);

			for (let i = 0; i < 488; i+=8) {
				const calculatedWidth = aspectRatioWidth * i;
				const calculatedHeight = aspectRatioHeight * i;

				if (calculatedWidth >= minSize[0] && calculatedHeight >= minSize[1] && calculatedWidth <= width && calculatedHeight <= height) {
					$_(`${selector} [data-action="set-resolution"]`).append(`<option value="${calculatedWidth}x${calculatedHeight}">${Monogatari.string ('Windowed')} ${calculatedWidth}x${calculatedHeight}</option>`);
				}
			}

			$_(`${selector} [data-action="set-resolution"]`).append(`<option value="fullscreen">${Monogatari.string ('FullScreen')}</option>`);

			SettingsMenu.changeWindowResolution (Monogatari.preference ('Resolution'));
			$_(`${selector} [data-action="set-resolution"]`).change(function () {
				const size = $_(this).value ();
				SettingsMenu.changeWindowResolution (size);
			});
		} else {
			$_(`${selector} [data-settings="resolution"]`).hide ();
		}
	}

	static changeWindowResolution (resolution) {
		const remote = require ('electron').remote;
		const win = remote.getCurrentWindow ();
		const {width, height} = remote.screen.getPrimaryDisplay ().workAreaSize;
		if (resolution) {
			win.setResizable (true);

			if (resolution == 'fullscreen' && !win.isFullScreen () && win.isFullScreenable ()) {
				win.setFullScreen(true);
				Monogatari.preference ('Resolution', resolution);
			} else if (resolution.indexOf ('x') > -1) {
				win.setFullScreen (false);
				const size = resolution.split ('x');
				const chosenWidth = parseInt (size[0]);
				const chosenHeight = parseInt (size[1]);

				if (chosenWidth <= width && chosenHeight <= height) {
					win.setSize(chosenWidth, chosenHeight, true);
					Monogatari.preference ('Resolution', resolution);
				}
			}
			win.setResizable (false);
		}
	}
}

SettingsMenu._configuration = {};
SettingsMenu._state = {};
SettingsMenu._id = 'SETTINGS_MENU';

SettingsMenu._html = `
	<section data-menu="settings" class="text--center">
		<button class="fas fa-arrow-left top left" data-action="back"></button>
		<h2 data-string="Settings">Settings</h2>
		<div class="row row--spaced padded text---center">
			<div class="row__column row__column--12 row__column--phone--12 row__column--phablet--12 row__column--tablet--6 row__column--desktop--6 row__column--desktop-large--6 row__column--retina--6">
				<div data-settings="audio" class="vertical vertical--center text--center">
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
					<input type="range" min="0" max="60" step="1" data-action="set-auto-play-speed">
				</div>
				<div data-settings="language">
					<h3 data-string="Language">Language</h3>
					<div class="horizontal horizontal--center"></div>
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
	</section>
`;

Monogatari.registerComponent (SettingsMenu);