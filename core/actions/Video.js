import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Video extends Action {

	static shouldProceed () {
		return new Promise ((resolve, reject) => {
			$_('[data-video]').each ((element) => {
				if (element.hasAttribute ('controls') === true && element.ended !== true) {
					reject ();
				}
			});

			resolve ();
		});
	}

	static onLoad () {
		if (Monogatari.state ('videos').length > 0) {
			for (const video of Monogatari.state ('videos')) {
				Monogatari.run (video, false);
				// TODO: Find a way to prevent the histories from filling up on loading
				// So there's no need for this pop.
				Monogatari.history ('video').pop ();
				Monogatari.state ('videos').pop ();
			}
		}
		return Promise.resolve ();
	}

	static setup () {
		Monogatari.history ('video');
		Monogatari.state ({
			videos: []
		});
		return Promise.resolve ();
	}

	static reset () {
		Monogatari.element ().find ('[data-video]').remove ();
		Monogatari.history ({
			video: []
		});
		Monogatari.state ({
			videos: []
		});
		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'video';
	}

	/**
	 * Creates an instance of a Video Action
	 *
	 * @param {string[]} parameters - List of parameters received from the script statement.
	 * @param {string} parameters.action - In this case, action will always be 'video'
	 * @param {string} [parameters.mode='modal'] - Mode in which the video element will be shown (modal, background, immersive, full-screen)
	 * @param {string} parameters.name
	 * @param {string} parameters.props
	 */
	constructor ([ show, type, mode = 'modal', name, ...props]) {
		super ();
		this.mode = mode;
		this.name = name;
		this.props = props;

		if (typeof Monogatari.asset ('video', name) !== 'undefined') {
			this.src = Monogatari.asset ('video', name);
		}
	}

	apply () {
		// TODO: Find a way to remove the resize listeners once the video is stopped
		const element = document.createElement ('video');

		$_(element).data ('video', this.name);
		$_(element).addClass (this.mode);

		$_(element).attribute ('src', `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').video}/${this.src}`);

		if (this.props.indexOf ('close') > -1) {
			element.onended = () => {
				Monogatari.element ().find (`[data-video="${this.name}"]`).remove ();
				if (this.mode === 'immersive') {
					Monogatari.global ('block', false);
				}
			};
		}

		if (this.props.indexOf ('loop') > -1) {
			$_(element).attribute ('loop', '');
		}

		if (this.props.indexOf ('controls') > -1) {
			$_(element).attribute ('controls', '');
		}

		if (this.mode === 'background') {
			Monogatari.element ().find ('[data-ui="background"]').append (element);
		} else if (this.mode === 'immersive') {
			Monogatari.global ('block', true);
			Monogatari.element ().find ('[data-screen="game"]').prepend (element);
		} else if (this.mode === 'fullscreen') {
			if (element.requestFullscreen) {
				Monogatari.element ().find ('[data-screen="game"]').append (element);
				element.requestFullscreen ();
			} else {
				Monogatari.global ('block', true);
				$_(element).toggleClass ('full-screen immersive');
				Monogatari.element ().find ('[data-screen="game"]').prepend (element);
			}
		} else {
			Monogatari.element ().find ('[data-screen="game"]').append (element);
		}

		element.play ();

		return Promise.resolve ();
	}

	didApply () {
		Monogatari.state ('videos').push (this._statement);
		Monogatari.history ('video').push (this._statement);
		return Promise.resolve ({ advance: true });
	}

	revert () {
		Monogatari.element ().find (`[data-video="${this.name}"]`).remove ();
		return Promise.resolve ();
	}

	didRevert () {
		for (let i = Monogatari.state ('videos').length - 1; i >= 0; i--) {
			const last = Monogatari.state ('videos')[i];
			const [show, video, mode, name] = last.split (' ');
			if (name === this.name) {
				Monogatari.state ('videos').splice (i, 1);
				break;
			}
		}

		for (let i = Monogatari.history ('video').length - 1; i >= 0; i--) {
			const last = Monogatari.history ('video')[i];
			const [show, video, mode, name] = last.split (' ');
			if (name === this.name) {
				Monogatari.history ('video').splice (i, 1);
				break;
			}
		}
		return Promise.resolve ({ advance: true, step: true });
	}
}

Video.id = 'Video';
Video._configuration = {
	objects: {

	}
};

Monogatari.registerAction (Video);