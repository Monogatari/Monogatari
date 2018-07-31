import { Action } from '../Action';
import { Monogatari } from '../monogatari';

export class Stop extends Action {

	static matchString ([ action ]) {
		return action === 'stop';
	}

	constructor ([ action, type ]) {
		super ();

		this.type = type;

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
		this.player.pause ();
		this.player.setAttribute ('src', '');
		this.player.currentTime = 0;
		return Promise.resolve ();
	}

	didApply () {
		if (this.type === 'music') {
			Monogatari.state ({
				music: ''
			});
		} else if (this.type === 'sound') {
			Monogatari.state ({
				sound: ''
			});
		}
		return Promise.resolve (true);
	}

	willRevert () {
		this.player.removeAttribute ('loop');
		return Promise.resolve ();
	}

	revert () {
		let last;
		if (this.type === 'music') {
			Monogatari.state ({
				music: ''
			});
			last = Monogatari.history ('music')[Monogatari.history ('music').length - 1].split (' ');
		} else if (this.type === 'sound') {
			Monogatari.state ({
				sound: ''
			});
			last = Monogatari.history ('sound')[Monogatari.history ('sound').length - 1].split (' ');
		}

		const [ , , media, ...props ] = last;

		if (props.indexOf ('loop') > -1) {
			this.player.setAttribute ('loop', '');
		}

		if (typeof  Monogatari.asset (this.type, media) !== 'undefined') {
			this.player.setAttribute('src', `assets/${this.type}/${Monogatari.asset (this.type, media)}`);
		} else {
			this.player.setAttribute('src', `assets/${this.type}/${media}`);
		}

		if (this.type == 'music') {
			Monogatari.state ({
				music: last.join (' ')
			});
		} else if (this.type == 'sound') {
			Monogatari.state ({
				sound: last.join (' ')
			});
		}

		this.player.play ();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Stop.id = 'Stop';

Monogatari.registerAction (Stop);