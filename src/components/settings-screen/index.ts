import type { Properties } from '@aegis-framework/pandora';
import { Platform, Text } from '@aegis-framework/artemis';
import ScreenComponent, { ScreenState } from '../../lib/ScreenComponent';

// Extend Window interface for Electron support
declare global {
	interface Window {
		electron?: {
			send: (channel: string, data: unknown) => void;
			on: (channel: string, callback: (args: unknown) => void) => void;
		};
	}
}

class SettingsScreen extends ScreenComponent<Properties, ScreenState> {
	static override tag = 'settings-screen';

	static override bind(): Promise<void> {
		// Fix for select labels
		const self = this;
		this.engine.on('click', '[data-select]', function(this: HTMLElement) {
			const selector = `[data-action='${this.dataset.select}']`;
			const target = self.engine.element().find(selector).get(0);

			if (target) {
				target.focus();
				const event = new MouseEvent('mousedown', {
					bubbles: true,
					cancelable: true,
					view: window
				});
				target.dispatchEvent(event);
			}
		});

		return Promise.resolve();
	}

	electron(): void {
		this.element().find('[data-action="set-resolution"]').value(this.engine.preference('Resolution') as string);

		window.onbeforeunload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			this.engine.alert('quit-warning', {
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

		window.electron!.send('window-info-request', {
			title: this.engine.setting('Name'),
			resizable: this.engine.setting('ForceAspectRatio') !== 'Global'
		});

		window.electron!.on('window-info-reply', (args: unknown) => {
			const { resizable, minWidth, maxWidth, minHeight, maxHeight } = args as {
				resizable: boolean;
				minWidth: number;
				maxWidth: number;
				minHeight: number;
				maxHeight: number;
			};

			if (!resizable) {
				const aspectRatio = (this.engine.setting('AspectRatio') as string).split(':');
				const aspectRatioWidth = parseInt(aspectRatio[0]);
				const aspectRatioHeight = parseInt(aspectRatio[1]);

				for (let i = 0; i < 488; i += 8) {
					const calculatedWidth = aspectRatioWidth * i;
					const calculatedHeight = aspectRatioHeight * i;

					if (calculatedWidth >= minWidth && calculatedHeight >= minHeight && calculatedWidth <= maxWidth && calculatedHeight <= maxHeight) {
						this.element().find('[data-action="set-resolution"]').append(`<option value="${calculatedWidth}x${calculatedHeight}">${this.engine.string('Windowed')} ${calculatedWidth}x${calculatedHeight}</option>`);
					}
				}

				this.element().find('[data-action="set-resolution"]').append(`<option value="fullscreen">${this.engine.string('FullScreen')}</option>`);

				this.changeWindowResolution(this.engine.preference('Resolution') as string);
				this.element().find('[data-action="set-resolution"]').change((event: Event) => {
					const size = (event.target as HTMLSelectElement).value;
					this.changeWindowResolution(size);
				});

				this.element().find('[data-action="set-resolution"]').value(this.engine.preference('Resolution') as string);

			} else {
				this.element().find('[data-settings="resolution"]').hide();
			}
		});

		window.electron!.on('resize-reply', (args: unknown) => {
			const { width, height, fullscreen } = args as { width: number; height: number; fullscreen: boolean };

			if (fullscreen) {
				this.engine.preference('Resolution', 'fullscreen');
			} else {
				this.engine.preference('Resolution', `${width}x${height}`);
			}
		});
	}

	changeWindowResolution(resolution: string): void {
		if (resolution) {
			if (resolution === 'fullscreen') {
				window.electron!.send('resize-request', {
					fullscreen: true
				});
			} else if (resolution.indexOf('x') > -1) {
				const [width, height] = resolution.split('x');
				window.electron!.send('resize-request', {
					width: parseInt(width),
					height: parseInt(height),
					fullscreen: false
				});
			}
		}
	}

	override didMount(): Promise<void> {
		this.engine.on('didInit', () => {
			if (this.engine.setting('MultiLanguage') === true) {
				this.content('wrapper').html(`
					<select data-action="set-language" data-content="language-selector">
						${Object.keys(this.engine._script).map((language) => `<option value="${language}">${language}</option>`)}
					</select>
					<span class="fas fa-sort" data-select="set-language"></span>
				`);
				this.content('language-selector').value(this.engine.preference('Language') as string);

				// Bind Language select so that every time a language is selected, the
				// ui and game get correctly localized.
				this.content('language-selector').change(() => {
					this.engine.preference('Language', this.content('language-selector').value() as string);
					this.engine.localize();
				});
			} else {
				this.content('language-settings').remove();
			}

			for (const mediaType of Object.keys(this.engine.mediaPlayers())) {
				const volume = this.engine.preference('Volume') as Record<string, number>;
				this.content(`${mediaType}-audio-controller`).value(volume[Text.capitalize(mediaType)]);
			}

			// Set the electron quit handler.
			if (Platform.electron && typeof window.electron === 'object') {
				if (typeof window.electron.send === 'function' && typeof window.electron.on === 'function') {
					this.electron();
				}
			} else {
				this.element().find('[data-platform="electron"]').remove();
			}

			this.element().find('[data-action="set-text-speed"]').value(
				(this.engine.setting('maxTextSpeed') as number) - (this.engine.preference('TextSpeed') as number)
			);
		});

		// Disable audio settings in iOS since they are not supported
		if (Platform.mobile('iOS')) {
			// iOS handles the volume using the system volume, therefore there is no way to
			// handle each of the sound sources individually and as such, this is disabled.
			this.content('audio-settings').html(`<p>${this.engine.string('iOSAudioWarning')}</p>`);
		}

		const engine = this.engine;
		this.content('auto-play-speed-controller').on('change mouseover', function(this: HTMLInputElement) {
			const value = (engine.setting('MaxAutoPlaySpeed') as number) - parseInt(this.value);
			engine.preference('AutoPlaySpeed', value);
		});

		const autoPlayController = this.content('auto-play-speed-controller').get(0) as HTMLInputElement | undefined;
		if (autoPlayController) {
			this.engine.setting('MaxAutoPlaySpeed', parseInt(autoPlayController.max));
		}
		this.content('auto-play-speed-controller').value(this.engine.preference('AutoPlaySpeed') as number);

		return Promise.resolve();
	}

	override render(): string {
		return `
			<button class="top left" data-action="back"><span class="fas fa-arrow-left"></span></button>
			<h2 data-string="Settings">Settings</h2>
			<div class="settings">
				<div class="settings-group">
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

				<div class="settings-group">
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

export default SettingsScreen;

