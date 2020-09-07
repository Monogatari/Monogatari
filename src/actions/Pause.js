import { Action } from './../lib/Action';

export class Pause extends Action {

	static matchString ([ action ]) {
		return action === 'pause';
	}

	constructor ([ pause, type, media ]) {
		super ();

		this.type = type;
		this.media = media;

		if (typeof media === 'undefined') {
			this.player = this.engine.mediaPlayers (type);
		} else {
			this.player = this.engine.mediaPlayer (type, media);
		}
	}

	willApply () {
		if (this.player) {
			return Promise.resolve ();
		}
		return Promise.reject ('Media player was not defined.');
	}

	apply () {
		if (this.player instanceof Array) {
			for (const player of this.player) {
				player.pause ();
			}
		} else {
			this.player.pause ();
		}
		return Promise.resolve ();
	}

	didApply () {
		const state = {};
		if (this.player instanceof Array) {
			state[this.type] = this.engine.state (this.type).map ((s) => {
				s.paused = true;
				return s;
			});
		} else {
			state[this.type] = [...this.engine.state (this.type).map ((item) => {
				if (typeof item.statement === 'string') {
					const [play, type, media] = item.statement.split (' ');

					if (media === this.media) {
						item.paused = true;
					}
					return item;
				}
				return item;
			})];
		}
		this.engine.state (state);
		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		if (this.player) {
			return Promise.resolve ();
		}
		return Promise.reject ('Media player was not defined.');
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
		const state = {};
		if (this.player instanceof Array) {
			state[this.type] = this.engine.state (this.type).map ((s) => {
				s.paused = false;
				return s;
			});
		} else {
			state[this.type] = [...this.engine.state (this.type).map ((item) => {
				if (typeof item.statement === 'string') {
					const [play, type, media] = item.statement.split (' ');

					if (media === this.media) {
						item.paused = false;
					}
					return item;
				}
			})];
		}
		this.engine.state (state);
		return Promise.resolve ({ advance: true, step: true });
	}
}

Pause.id = 'Pause';

export default Pause;