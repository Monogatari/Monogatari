import { Action } from '../Action';
import { Monogatari } from '../monogatari';

export class Stop extends Action {

	static matchString ([ action ]) {
		return action === 'stop';
	}

	constructor ([ action, type, media ]) {
		super ();

		this.type = type;
		this.media = media;

		if (typeof media === 'undefined') {
			this.player = Monogatari.mediaPlayers (type, true);
		} else {
			this.player = Monogatari.mediaPlayer (type, media);
		}
	}

	willApply () {
		if (typeof this.player === 'object' && !(this.player instanceof Audio)) {
			for (const player of Object.values (this.player)) {
				player.loop = false;
			}
		} else {
			this.player.loop = false;
		}
		return Promise.resolve ();
	}

	apply () {
		if (typeof this.player === 'object' && !(this.player instanceof Audio)) {
			Monogatari.removeMediaPlayer (this.type);
		} else {
			Monogatari.removeMediaPlayer (this.type, this.mediaKey);
		}

		return Promise.resolve ();
	}

	didApply () {
		const state = {};

		if (typeof this.media !== 'undefined') {
			state[this.type] = Monogatari.state (this.type).filter ((m) => m.indexOf (`play ${this.type} ${this.media}`) <= -1);
		} else {
			Monogatari.history (this.type).push (Monogatari.state (this.type));
			state[this.type] = [];
		}

		Monogatari.state (state);

		return Promise.resolve (true);
	}

	revert () {
		if (typeof this.media !== 'undefined') {
			const last = Monogatari.history (this.type).reverse ().find ((m) => m.indexOf (`play ${this.type} ${this.media}`) > -1);

			return Monogatari.run (last);
		} else {
			const statements = Monogatari.history (this.type).pop ();

			const promises = [];
			for (const statement of statements) {
				promises.push (Monogatari.run (statement, false).then (() => {
					Monogatari.history (this.type).pop ();
					return Promise.resolve ();
				}));
			}
			return Promise.all (promises);
		}
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Stop.id = 'Stop';

Monogatari.registerAction (Stop);