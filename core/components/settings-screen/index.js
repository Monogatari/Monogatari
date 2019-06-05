import ScreenComponent from './../../lib/ScreenComponent';
import { Monogatari } from './../../monogatari';
import { Platform, Text } from '@aegis-framework/artemis';

class SettingsScreen extends ScreenComponent {

	static bind () {
		// Fix for select labels
		this.engine.on ('click', '[data-select]', () => {
			const e = document.createEvent ('MouseEvents');
			e.initMouseEvent ('mousedown');
			this.engine.element ().find (`[data-action='${this.dataset.select}']`).first ().dispatchEvent (e);
		});

		return Promise.resolve ();
	}

	electron (selector) {
		this.element ().find ('[data-action="set-resolution"]').value (Monogatari.preference ('Resolution'));

		window.onbeforeunload = (event) => {
			event.preventDefault ();
			this.engine.alert ('quit-warning', {
				message: 'Confirm',
				actions: [
					{
						label: 'Quit',
						listener: 'quit'
					},
					{
						label: 'Cancel',
						listener: 'dismiss-alert'
					}
				]
			});
			return false;
		};

		window.ipcRendererSend ('window-info-request', {
			title: Monogatari.setting ('Name'),
			resizable: Monogatari.setting ('ForceAspectRatio') !== 'Global'
		});

		window.ipcRendererReceive ('window-info-reply', (event, args) => {
			const { resizable, minWidth, maxWidth, minHeight, maxHeight } = args;

			if (!resizable) {
				const aspectRatio = Monogatari.setting ('AspectRatio').split (':');
				const aspectRatioWidth = parseInt (aspectRatio[0]);
				const aspectRatioHeight = parseInt (aspectRatio[1]);

				for (let i = 0; i < 488; i += 8) {
					const calculatedWidth = aspectRatioWidth * i;
					const calculatedHeight = aspectRatioHeight * i;

					if (calculatedWidth >= minWidth && calculatedHeight >= minHeight && calculatedWidth <= maxWidth && calculatedHeight <= maxHeight) {
						this.element ().find ('[data-action="set-resolution"]').append(`<option value="${calculatedWidth}x${calculatedHeight}">${Monogatari.string ('Windowed')} ${calculatedWidth}x${calculatedHeight}</option>`);
					}
				}

				this.element ().find ('[data-action="set-resolution"]').append(`<option value="fullscreen">${Monogatari.string ('FullScreen')}</option>`);

				this.changeWindowResolution (Monogatari.preference ('Resolution'));
				this.element ().find ('[data-action="set-resolution"]').change ((event) => {
					const size = event.target.value;
					this.changeWindowResolution (size);
				});

			} else {
				this.element ().find ('[data-settings="resolution"]').hide ();
			}
		});

		window.ipcRendererReceive ('resize-reply', (event, args) => {
			const { width, height, fullscreen } = args;

			if (fullscreen) {
				Monogatari.preference ('Resolution', 'fullscreen');
			} else {
				Monogatari.preference ('Resolution', `${width}x${height}`);
			}
		});
	}

	changeWindowResolution (resolution) {
		if (resolution) {
			if (resolution == 'fullscreen') {
				window.ipcRendererSend ('resize-request', {
					fullscreen: true
				});
			} else if (resolution.indexOf ('x') > -1) {
				const [ width, height ] = resolution.split ('x');
				window.ipcRendererSend ('resize-request', {
					width: parseInt (width),
					height: parseInt (height),
					fullscreen: false
				});
			}
		}
	}

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
			const value = engine.setting ('MaxAutoPlaySpeed') - parseInt(this.value);
			engine.preference ('AutoPlaySpeed', value);
		});

		this.engine.setting ('MaxAutoPlaySpeed', parseInt (this.content ('auto-play-speed-controller').property ('max')));
		this.content ('auto-play-speed-controller').value (this.engine.preference ('AutoPlaySpeed'));

		// Set the electron quit handler.
		if (Platform.electron () || (typeof window.ipcRendererReceive === 'function' && typeof window.ipcRendererSend === 'function')) {
			this.electron ();
		} else {
			this.element ().find ('[data-platform="electron"]').remove ();
		}

		return Promise.resolve ();
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
						<span data-string="Video">Video Volume:</span>
						<input type="range" min="0.0" max="1.0" step="0.1" data-action="set-volume" data-target="video">
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

SettingsScreen.tag = 'settings-screen';


Monogatari.registerComponent (SettingsScreen);