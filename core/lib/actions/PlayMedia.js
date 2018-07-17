import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Play extends Action {

	static canProceed () {
		if ($_('[data-component="video"]').isVisible ()) {
			return Promise.reject ();
		}
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

	static init () {
		// Set the volume of all the media components
		Monogatari.musicPlayer.volume = Monogatari.preference ('Volume').Music;
		Monogatari.ambientPlayer.volume = Monogatari.preference ('Volume').Music;
		Monogatari.voicePlayer.volume = Monogatari.preference ('Volume').Voice;
		Monogatari.soundPlayer.volume = Monogatari.preference ('Volume').Sound;

		document.querySelector ('[data-target="music"]').value = Monogatari.preference ('Volume').Music;
		document.querySelector ('[data-target="voice"]').value = Monogatari.preference ('Volume').Voice;
		document.querySelector ('[data-target="sound"]').value = Monogatari.preference ('Volume').Sound;
		return Promise.resolve ();
	}

	static bind (selector) {
		Monogatari.ambientPlayer = document.querySelector ('[data-component="ambient"]');
		Monogatari.musicPlayer = document.querySelector ('[data-component="music"]');
		Monogatari.soundPlayer = document.querySelector ('[data-component="sound"]');
		Monogatari.videoPlayer = document.querySelector ('[data-ui="player"]');
		Monogatari.voicePlayer = document.querySelector ('[data-component="voice"]');

		// Volume bars listeners
		$_('[data-action="set-volume"]').on ('change mouseover', function () {
			const v = document.querySelector (`[data-component='${$_(this).data('target')}']`);
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

		$_('[data-action="close-video"]').click (() => {
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
		}

		if (sound !== '') {
			Monogatari.run (sound, false);
		}
		return Promise.resolve ();
	}

	static reset () {
		Play.stopVideo ();
		$_('audio').each ((element) => {
			if (!element.paused && typeof element.src !== 'undefined' && element.src !== '') {
				element.pause();
				element.currentTime = 0;
				element.src = '';
			}
		});
		$_('[data-component="video"]').removeClass ('modal--active');
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'play';
	}

	static stopVideo () {
		Monogatari.videoPlayer.pause ();
		Monogatari.videoPlayer.currentTime = 0;
		Monogatari.videoPlayer.setAttribute ('src', '');
		$_('[data-component="video"]').removeClass ('active');
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

		this.player.setAttribute ('src', `assets/${this.type}/${this.media}`);

		if (this.type == 'music') {

			Monogatari.setting ('Song', this.statement.join (' '));
			Monogatari.setting ('MusicHistory').push (Monogatari.setting ('Song'));

			Monogatari.history ('music').push (this._statement);
			Monogatari.state ({
				music: this._statement
			});
		} else if (this.type == 'sound') {

			Monogatari.setting ('Sound', this.statement.join (' '));
			Monogatari.setting ('SoundHistory').push (Monogatari.setting ('Sound'));

			Monogatari.history ('sound').push (this._statement);
			Monogatari.state ({
				sound: this._statement
			});
		} else if (this.type == 'video') {
			$_('[data-component="video"]').addClass ('active');
		}

		this.player.play ();
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	revert () {
		this.player.pause ();
		this.player.removeAttribute ('loop');
		this.player.setAttribute ('src', '');
		this.player.currentTime = 0;

		if (this.type === 'music') {
			Monogatari.setting ('Song', '');
		} else if (this.type === 'sound') {
			Monogatari.setting ('Sound', '');
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Play.id = 'Play';

Monogatari.registerAction (Play);