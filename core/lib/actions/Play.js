import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Play extends Action {

	static canProceed () {
		if ($_(`${Monogatari.selector} [data-component="video"]`).isVisible ()) {
			return Promise.reject ();
		}
		Play.shutUp ();
		return Promise.resolve ();
	}

	static canRevert () {
		if ($_(`${Monogatari.selector} [data-component="video"]`).isVisible ()) {
			Play.stopVideo ();
		}
		Play.shutUp ();
		return Promise.resolve ();
	}

	static setup () {
		Monogatari.history ('music');
		Monogatari.history ('sound');
		Monogatari.state ({
			music: '',
			sound: ''
		});
		return Promise.resolve ();
	}

	static init (selector) {
		// Set the volume of all the media components
		Monogatari.musicPlayer.volume = Monogatari.preference ('Volume').Music;
		Monogatari.ambientPlayer.volume = Monogatari.preference ('Volume').Music;
		Monogatari.voicePlayer.volume = Monogatari.preference ('Volume').Voice;
		Monogatari.soundPlayer.volume = Monogatari.preference ('Volume').Sound;

		document.querySelector (`${selector} [data-target="music"]`).value = Monogatari.preference ('Volume').Music;
		document.querySelector (`${selector} [data-target="voice"]`).value = Monogatari.preference ('Volume').Voice;
		document.querySelector (`${selector} [data-target="sound"]`).value = Monogatari.preference ('Volume').Sound;
		return Promise.resolve ();
	}

	static bind (selector) {
		Monogatari.ambientPlayer = document.querySelector (`${selector} [data-component="ambient"]`);
		Monogatari.musicPlayer = document.querySelector (`${selector} [data-component="music"]`);
		Monogatari.soundPlayer = document.querySelector (`${selector} [data-component="sound"]`);
		Monogatari.videoPlayer = document.querySelector (`${selector} [data-ui="player"]`);
		Monogatari.voicePlayer = document.querySelector (`${selector} [data-component="voice"]`);

		// Volume bars listeners
		$_(`${selector} [data-action="set-volume"]`).on ('change mouseover', function () {
			const v = document.querySelector (`${Monogatari.selector} [data-component='${$_(this).data('target')}']`);
			const value = $_(this).value();

			switch ($_(this).data('target')) {
				case 'music':
					Monogatari.ambientPlayer.volume = value;
					v.volume = value;
					Monogatari.preference ('Volume').Music = value;
					break;

				case 'voice':
					v.volume = value;
					Monogatari.preference ('Volume').Voice = value;
					break;

				case 'sound':
					v.volume = value;
					Monogatari.preference ('Volume').Sound = value;
					break;
			}
			Monogatari.Storage.set ('Settings', Monogatari.preferences ());
		});

		$_(`${selector} [data-action="close-video"]`).click (() => {
			Play.stopVideo ();
		});
		Monogatari.state ({
			music: '',
			sound: ''
		});
		return Promise.resolve ();
	}

	static onLoad () {
		const { music, sound } = Monogatari.state ();
		if (music !== '') {
			Monogatari.run (music, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			Monogatari.history ('music').pop ();
		}

		if (sound !== '') {
			Monogatari.run (sound, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			Monogatari.history ('sound').pop ();
		}
		return Promise.resolve ();
	}

	static reset () {
		Play.stopVideo ();
		$_(`${Monogatari.selector} audio`).each ((element) => {
			if (!element.paused && typeof element.src !== 'undefined' && element.src !== '') {
				element.pause();
				element.currentTime = 0;
				element.src = '';
			}
		});
		$_(`${Monogatari.selector} [data-component="video"]`).removeClass ('modal--active');
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'play';
	}

	static stopVideo () {
		Monogatari.videoPlayer.pause ();
		Monogatari.videoPlayer.currentTime = 0;
		Monogatari.videoPlayer.setAttribute ('src', '');
		$_(`${Monogatari.selector} [data-component="video"]`).removeClass ('active');
	}

	// Stop the voice player
	static shutUp () {
		if (!Monogatari.voicePlayer.paused && typeof Monogatari.voicePlayer.src !== 'undefined' && Monogatari.voicePlayer.src != '') {
			Monogatari.voicePlayer.pause ();
			Monogatari.voicePlayer.currentTime = 0;
		}
	}

	constructor ([ action, type, media, ...props ]) {
		super ();
		this.type = type;
		this.props = props;

		if (typeof Monogatari.asset (type, media) !== 'undefined') {
			this.media = Monogatari.asset (type, media);
		} else {
			this.media = media;
		}

		if (this.type == 'music') {
			this.player = Monogatari.musicPlayer;
		} else if (this.type == 'sound') {
			this.player = Monogatari.soundPlayer;
		} else if (this.type == 'voice') {
			this.player = Monogatari.voicePlayer;
		} else if (this.type == 'video') {
			this.player = Monogatari.videoPlayer;
		}
	}

	willApply () {
		this.player.removeAttribute ('loop');
		return Promise.resolve ();
	}

	apply () {
		if (this.props.indexOf ('loop') > -1) {
			this.player.setAttribute ('loop', '');
		}

		this.player.setAttribute ('src', `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting('AssetsPath')[this.type]}/${this.media}`);

		if (this.type == 'music') {
			Monogatari.history ('music').push (this._statement);
			Monogatari.state ({
				music: this._statement
			});
			this.player.onended = () => {
				Monogatari.state ({
					music: ''
				});
			};
		} else if (this.type == 'sound') {
			Monogatari.history ('sound').push (this._statement);
			Monogatari.state ({
				sound: this._statement
			});
			this.player.onended = () => {
				Monogatari.state ({
					sound: ''
				});
			};
		} else if (this.type == 'video') {
			$_(`${Monogatari.selector} [data-component="video"]`).addClass ('active');
		}

		this.player.play ();
		return Promise.resolve ();
	}

	didApply () {
		if (this.type !== 'video') {
			return Promise.resolve (true);
		}
		return Promise.resolve ();
	}

	revert () {
		this.player.pause ();
		this.player.removeAttribute ('loop');
		this.player.setAttribute ('src', '');
		this.player.currentTime = 0;

		if (this.type === 'music') {
			Monogatari.history ('music').pop ();
			Monogatari.state ({
				music: ''
			});
		} else if (this.type === 'sound') {
			Monogatari.history ('sound').pop ();
			Monogatari.state ({
				sound: ''
			});
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Play.id = 'Play';

Monogatari.registerAction (Play);