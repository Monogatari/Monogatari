import { $_ } from '@aegis-framework/artemis';

import Action from './../lib/Action';
import { FancyError } from './../lib/FancyError';
import { ActionApplyResult, ActionRevertResult, ActionInstance } from '../lib/types';

export class Video extends Action {
	static override id = 'Video';
  static override blocking = false;

	static _configuration: { objects: Record<string, any>, modes: string[] } = {
		objects: {

		},
		modes: ['modal', 'displayable', 'immersive', 'fullscreen', 'background']
	};

	/**
	 * Properly cleanup a video element to prevent memory leaks
	 */
	static cleanupVideoElement(element: HTMLVideoElement): void {
		element.pause();
		element.onended = null;
		element.onerror = null;
		element.src = '';
		element.load(); // Reset the element
	}

	static override async shouldProceed(): Promise<void> {
    if (Video.blocking) {
      throw new Error('Video is still playing');
    }

		return new Promise((resolve, reject) => {
			$_('[data-video]').each((element: HTMLElement) => {
				const videoElement = element as HTMLVideoElement;
				if (videoElement.ended !== true && videoElement.dataset.mode !== 'background' && videoElement.dataset.mode !== 'displayable') {
					reject('Playing video must end before proceeding.');
				}
			});

			resolve();
		});
	}

	static override async onLoad(): Promise<void> {
		const state = this.engine.state('videos');

		if (state.length === 0) {
			return;
		}

		const promises = [];

		for (const video of state) {
			// prepareAction returns typeof Action but actually returns instance
			const action = this.engine.prepareAction(video, { cycle: 'Application' }) as ActionInstance | null;

			if (action === null) {
				continue;
			}

			const promise = (async () => {
				await action.willApply();
				await action.apply();
				await action.didApply({ updateHistory: false, updateState: false });
			})();

			promises.push(promise);
		}

		if (promises.length > 0) {
			await Promise.all(promises);
		}
	}

	static override async setup(): Promise<void> {
		this.engine.history({
			video: [] // string[]
		});

		this.engine.state({
			videos: [] // string[]
		});
	}

	static override async reset(): Promise<void> {
		// Properly clean up all video elements before removing
		this.engine.element().find('[data-video]').each((element: HTMLElement) => {
			Video.cleanupVideoElement(element as HTMLVideoElement);
		});
		this.engine.element().find('[data-video]').remove();

		this.engine.history({
			video: [] // string[]
		});

		this.engine.state({
			videos: [] // string[]
		});
	}

	static override matchString([show, type]: string[]): boolean {
		return show === 'show' && type === 'video';
	}

	/**
	 * Creates an instance of a Video Action
	 *
	 * @param {string[]} parameters - List of parameters received from the script statement.
	 * @param {string} parameters.action - In this case, action will always be 'video'
	 * @param {string} [parameters.mode='modal'] - Mode in which the video element will be shown (modal, displayable, background, immersive, full-screen)
	 * @param {string} parameters.name
	 * @param {string} parameters.props
	 */
	mode: string;
	name: string;
	props: string[];
	src: string | undefined;
	classes: string[];

	constructor([show, type, name, mode = 'modal', ...props]: string[]) {
		super();
		this.mode = mode;
		this.name = name;
		this.props = props;

		if (typeof this.engine.asset('videos', name) !== 'undefined') {
			this.src = this.engine.asset('videos', name);
		}

		if (typeof props !== 'undefined') {
			this.classes = ['animated', ...props.filter((item) => item !== 'with')];
		} else {
			this.classes = [];
		}
	}

	override async willApply(): Promise<void> {
		if (Video._configuration.modes.indexOf(this.mode) === -1) {
			FancyError.show('action:video:invalid_mode', {
				mode: this.mode,
				validModes: Video._configuration.modes,
				statement: `<code class='language=javascript'>"${this._statement}"</code>`,
				label: this.engine.state('label'),
				step: this.engine.state('step')
			});
			throw new Error('Invalid video mode provided.');
		}
	}

	override async apply(): Promise<void> {
		// TODO: Find a way to remove the resize listeners once the video is stopped
		const element = document.createElement('video');

		const volumePrefs = this.engine.preference('Volume') as { Video?: number } | undefined;
		const videoVolume = volumePrefs?.Video ?? 1;

		element.volume = videoVolume;

		element.dataset.video = this.name;
		element.dataset.mode = this.mode;

		for (const newClass of this.classes) {
			element.classList.add(newClass);
		}

		const { root, videos: videoPath } = this.engine.setting('AssetsPath') as { root: string, videos: string };

		$_(element).attribute('src', `${root}/${videoPath}/${this.src}`);

		// Add error handler for video loading failures
		element.onerror = () => {
			this.engine.debug.error(`Failed to load video: ${this.name}`);
		};

		if (this.props.indexOf('close') > -1) {
			element.onended = () => {
				// Exit fullscreen if we're in fullscreen mode
				if (this.mode === 'fullscreen' && document.fullscreenElement) {
					document.exitFullscreen().catch(() => {
						// Ignore errors when exiting fullscreen
					});
				}

				// Cleanup and remove the element
				const videoElement = this.engine.element().find(`[data-video="${this.name}"][data-mode="${this.mode}"]`).get(0) as HTMLVideoElement | undefined;
				if (videoElement) {
					Video.cleanupVideoElement(videoElement);
					videoElement.remove();
				}

				let index = -1;

				const state = this.engine.state('videos');
				for (let i = state.length - 1; i >= 0; i--) {
					const last = state[i];
					const [, , name, mode] = last.split(' ');
					if (name === this.name && mode === this.mode) {
						index = i;
						break;
					}
				}

				if (this.mode === 'immersive' || this.mode === 'fullscreen' || this.mode === 'modal') {
					if (index > -1) {
						const videos = this.engine.state('videos');
						videos.splice(index, 1);
					}

				  Video.blocking = false;
					this.engine.proceed({ userInitiated: false, skip: false, autoPlay: false });
				} else if (this.mode === 'background' || this.mode === 'displayable') {
					if (index > -1) {
						const videos = this.engine.state('videos');
						videos.splice(index, 1);
					}
				}
			};
		}

		if (this.props.indexOf('loop') > -1) {
			$_(element).attribute('loop', '');
		}

		if (this.props.indexOf('controls') > -1) {
			$_(element).attribute('controls', '');
		}

		if (this.mode === 'background') {
			this.engine.element().find('[data-ui="background"]').append(element);
		} else if (this.mode === 'immersive') {
			Video.blocking = true;
			this.engine.element().find('[data-screen="game"]').prepend(element);
		} else if (this.mode === 'fullscreen') {
			Video.blocking = true;
			if (element.requestFullscreen) {
				this.engine.element().find('[data-screen="game"]').append(element);
				element.requestFullscreen();
			} else {
				$_(element).addClass('immersive');
				this.engine.element().find('[data-screen="game"]').prepend(element);
			}
		} else if (this.mode === 'displayable') {
			this.engine.element().find('[data-screen="game"]').append(element);
		} else if (this.mode === 'modal') {
			Video.blocking = true;
			this.engine.element().find('[data-screen="game"]').append(element);
		} else {
			throw new Error('Invalid video mode.');
		}

		element.play();
	}

	override async didApply({ updateHistory = true, updateState = true } = {}): Promise<ActionApplyResult> {
		const statement = this._statement as string;
		if (updateHistory === true) {
			this.engine.history('video').push(statement);
		}

		if (updateState === true) {
			this.engine.state('videos').push(statement);
		}

		if (this.mode === 'background' || this.mode === 'modal' || this.mode === 'displayable') {
			return { advance: true };
		}

		return { advance: false };
	}

	override async revert(): Promise<void> {
		const element = this.engine.element().find(`[data-video="${this.name}"][data-mode="${this.mode}"]`).get(0) as HTMLVideoElement | undefined;
		if (element) {
			// Exit fullscreen if we're in fullscreen mode
			if (this.mode === 'fullscreen' && document.fullscreenElement) {
				await document.exitFullscreen().catch(() => {
					// Ignore errors when exiting fullscreen
				});
			}
			Video.cleanupVideoElement(element);
			element.remove();
		}

		// Unblock if this was a blocking video
		if (this.mode === 'immersive' || this.mode === 'fullscreen' || this.mode === 'modal') {
			Video.blocking = false;
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		const state = this.engine.state('videos');
		const history = this.engine.history('video');

		for (let i = state.length - 1; i >= 0; i--) {
			const last = state[i];
			const [show, video, name, mode] = last.split(' ');
			if (name === this.name && mode === this.mode) {
				state.splice(i, 1);
				break;
			}
		}

		for (let i = history.length - 1; i >= 0; i--) {
			const last = history[i];
			const [show, video, name, mode] = last.split(' ');
			if (name === this.name && mode === this.mode) {
				history.splice(i, 1);
				break;
			}
		}

		return { advance: true, step: true };
	}
}

export default Video;