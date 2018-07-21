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

	apply () {
		this.player.pause ();
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	revert () {
		this.player.play ();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Pause.id = 'Pause';

Monogatari.registerAction (Pause);