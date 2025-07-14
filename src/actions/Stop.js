import { Action } from './../lib/Action';
import AudioPlayer from './../lib/AudioPlayer';

export class Stop extends Action {

	static matchString ([ action ]) {
		return action === 'stop';
	}

	constructor ([ action, type, media, ...props ]) {
		super ();

		this.type = type;
		this.media = media;
		this.props = props;

		if (typeof media === 'undefined' || media === 'with') {
			this.player = this.engine.mediaPlayers (type);
		} else {
			this.player = this.engine.mediaPlayer (type, media);
		}
	}

	willApply () {
		if (this.player) {
			if (typeof this.player === 'object' && !(this.player instanceof AudioPlayer)) {
				for (const player of Object.values (this.player)) {
					player.loop = false;
				}
			} else {
				this.player.loop = false;
			}
		}
		return Promise.resolve ();
	}

	apply () {
		// Check if the audio should have a fade time
		const fadePosition = this.props.indexOf ('fade');

		if (typeof this.player === 'object' && !(this.player instanceof AudioPlayer)) {
			if (fadePosition > -1) {
				for (const player of this.player) {
					const fadeTime = this.props[fadePosition + 1];
					const duration = parseFloat(fadeTime.match(/\d*(\.\d*)?/)[0]);
					player.fadeOut(duration).then(() => {
						this.engine.removeMediaPlayer(this.type, player.dataset.key);
					});
				}
			} else {
				this.engine.removeMediaPlayer(this.type);
			}
		} else {
			if (fadePosition > -1) {
				const fadeTime = this.props[fadePosition + 1];
				const duration = parseFloat(fadeTime.match(/\d*(\.\d*)?/)[0]);
				this.player.fadeOut(duration).then(() => {
					this.engine.removeMediaPlayer(this.type, this.media);
				});
			} else {
				this.engine.removeMediaPlayer(this.type, this.media);
			}
		}
		return Promise.resolve ();
	}

	didApply () {
		const state = {};

		if (typeof this.media !== 'undefined') {
			state[this.type] = [...this.engine.state (this.type).filter ((item) => {
				if (typeof item.statement === 'string') {
					const [play, type, media] = item.statement.split (' ');
					return !(type === this.type && media === this.media);
				}
			})];
		} else {
			this.engine.history (this.type).push (this.engine.state (this.type));
			state[this.type] = [];
		}

		this.engine.state (state);

		return Promise.resolve ({ advance: true });
	}

	revert () {
		if (typeof this.media !== 'undefined') {
			for (let i = this.engine.history (this.type).length - 1; i >= 0; i--) {
				const last = this.engine.history (this.type)[i];
				if (typeof last !== 'undefined') {
					const [play, type, media] = last.split (' ');

					if (this.type === type && this.media === media) {
						const action = this.engine.prepareAction (last, { cycle: 'Application'});
						return action.willApply ().then (() => {
							return action.apply ().then (() => {
								return action.didApply ({ updateHistory: false, updateState: true });
							});
						});
					}
				}
			}
			return Promise.resolve ();
		} else {
			const statements = this.engine.history (this.type).pop ();
			const promises = [];
			for (const state of statements) {
				const action = this.engine.prepareAction (state.statement, { cycle: 'Application'});
				const promise =  action.willApply ().then (() => {
					return action.apply ({ paused: state.paused }).then (() => {
						return action.didApply ({ updateHistory: false, updateState: true });
					});
				});

				promises.push (promise);
			}
			return Promise.all (promises);
		}
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Stop.id = 'Stop';

export default Stop;