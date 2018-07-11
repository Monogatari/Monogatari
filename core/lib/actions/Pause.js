import { Action } from '../Action';
import { Monogatari } from '../monogatari';

export class Pause extends Action {

	static matchString ([ action ]) {
		return action === 'pause';
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

	apply (advance) {
		this.player.pause ();

		if (advance) {
			Monogatari.next ();
		}

		return Promise.resolve ();
	}

	revert () {
		this.player.play ();
		return Promise.resolve ();
	}
}

Pause.id = 'Pause';

Monogatari.registerAction (Pause);