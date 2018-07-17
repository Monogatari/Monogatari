import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Play extends Action {

	static reset () {
		Play.stopVideo ();
		$_('audio').each ((element) => {
			if (!element.paused && typeof element.src !== 'undefined' && element.src !== '') {
				element.pause();
				element.currentTime = 0;
				element.src = '';
			}
		});
		return Promise.resolve ();
	}

	static bind () {
		$_('[data-action="close-video"]').click (() => {
			Play.stopVideo ();
		});
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

	constructor (statement) {
		super ();
		const [ action, type, media, ...props ] = statement;

		this.statement = statement;
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
		} else if (this.type == 'sound') {


			Monogatari.setting ('Sound', this.statement.join (' '));
			Monogatari.setting ('SoundHistory').push (Monogatari.setting ('Sound'));

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