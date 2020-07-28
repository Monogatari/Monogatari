import { Action } from './../lib/Action';
import { $_ } from '@aegis-framework/artemis';

export class Video extends Action {

	static shouldProceed () {
		return new Promise ((resolve, reject) => {
			$_('[data-video]').each ((element) => {
				if (element.ended !== true && element.dataset.mode !== 'background' && element.dataset.mode !== 'displayable') {
					reject ('Playing video must end before proceeding.');
				}
			});

			resolve ();
		});
	}

	static onLoad () {
		if (this.engine.state ('videos').length > 0) {
			const promises = [];

			for (const video of this.engine.state ('videos')) {
				promises.push (this.engine.run (video, false));
				// TODO: Find a way to prevent the histories from filling up on loading
				// So there's no need for this pop.
				this.engine.history ('video').pop ();
				this.engine.state ('videos').pop ();
			}

			if (promises.length > 0) {
				return Promise.all (promises);
			}
		}
		return Promise.resolve ();
	}

	static setup () {
		this.engine.history ('video');
		this.engine.state ({
			videos: []
		});
		return Promise.resolve ();
	}

	static reset () {
		this.engine.element ().find ('[data-video]').remove ();

		this.engine.history ({
			video: []
		});

		this.engine.state ({
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
	 * @param {string} [parameters.mode='modal'] - Mode in which the video element will be shown (modal, displayable, background, immersive, full-screen)
	 * @param {string} parameters.name
	 * @param {string} parameters.props
	 */
	constructor ([ show, type, name, mode = 'modal', ...props]) {
		super ();
		this.mode = mode;
		this.name = name;
		this.props = props;

		if (typeof this.engine.asset ('videos', name) !== 'undefined') {
			this.src = this.engine.asset ('videos', name);
		}

		if (typeof props !== 'undefined') {
			this.classes = ['animated', ...props.filter((item) => item !== 'with')];
		} else {
			this.classes = [];
		}
	}

	apply () {
		// TODO: Find a way to remove the resize listeners once the video is stopped
		const element = document.createElement ('video');

		element.volume = this.engine.preference ('Volume').Video;

		element.dataset.video = this.name;
		element.dataset.mode = this.mode;

		for (const newClass of this.classes) {
			element.classList.add (newClass);
		}

		$_(element).attribute ('src', `${this.engine.setting ('AssetsPath').root}/${this.engine.setting ('AssetsPath').videos}/${this.src}`);

		if (this.props.indexOf ('close') > -1) {
			element.onended = () => {
				this.engine.element ().find (`[data-video="${this.name}"]`).remove ();
				if (this.mode === 'immersive') {
					this.engine.state ('videos').pop ();
					this.engine.global ('block', false);
					this.engine.proceed ({ userInitiated: false, skip: false, autoPlay: false });
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
			this.engine.element ().find ('[data-ui="background"]').append (element);
		} else if (this.mode === 'immersive') {
			this.engine.global ('block', true);
			this.engine.element ().find ('[data-screen="game"]').prepend (element);
		} else if (this.mode === 'fullscreen') {
			if (element.requestFullscreen) {
				this.engine.element ().find ('[data-screen="game"]').append (element);
				element.requestFullscreen ();
			} else {
				this.engine.global ('block', true);
				$_(element).data ('mode','immersive');
				this.engine.element ().find ('[data-screen="game"]').prepend (element);
			}
		} else if (this.mode === 'displayable') {
			this.engine.element ().find ('[data-screen="game"]').append (element);
		} else {
			this.engine.element ().find ('[data-screen="game"]').append (element);
		}

		element.play ();

		return Promise.resolve ();
	}

	didApply () {
		this.engine.state ('videos').push (this._statement);
		this.engine.history ('video').push (this._statement);

		if (this.mode === 'background' || this.mode === 'modal' || this.mode === 'displayable') {
			return Promise.resolve ({ advance: true });
		}

		return Promise.resolve ({ advance: false });
	}

	revert () {
		this.engine.element ().find (`[data-video="${this.name}"]`).remove ();
		return Promise.resolve ();
	}

	didRevert () {
		for (let i = this.engine.state ('videos').length - 1; i >= 0; i--) {
			const last = this.engine.state ('videos')[i];
			const [show, video, mode, name] = last.split (' ');
			if (name === this.name) {
				this.engine.state ('videos').splice (i, 1);
				break;
			}
		}

		for (let i = this.engine.history ('video').length - 1; i >= 0; i--) {
			const last = this.engine.history ('video')[i];
			const [show, video, mode, name] = last.split (' ');
			if (name === this.name) {
				this.engine.history ('video').splice (i, 1);
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

export default Video;