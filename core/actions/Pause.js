import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';

export class Pause extends Action {

	static matchString ([ action ]) {
		return action === 'pause';
	}

	constructor ([ action, type, media ]) {
		super ();

		this.type = type;
		this.media = media;

		if (typeof media === 'undefined') {
			this.player = Monogatari.mediaPlayers (type);
		} else {
			this.player = Monogatari.mediaPlayer (type, media);
		}
	}

	apply () {
		if (this.player) {
			if (this.player instanceof Array) {
				for (const player of this.player) {
					player.pause ();
				}
			} else {
				this.player.pause ();
			}
			return Promise.resolve ();
		}
		return Promise.reject ();
	}

	didApply () {
		return Promise.resolve ({ advance: true });
	}

	revert () {
		if (this.player instanceof Array) {
			const promises = [];
			for (const player of this.player) {
				promises.push (player.play ());
			}
			return Promise.all (promises);
		} else {
			return this.player.play ();
		}
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Pause.id = 'Pause';

Monogatari.registerAction (Pause, true);