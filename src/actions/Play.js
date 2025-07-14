import { Action } from './../lib/Action';
import { $_, Text } from '@aegis-framework/artemis';

export class Play extends Action {

	static shouldProceed ({ userInitiated, skip }) {
		if (userInitiated === false && skip === false) {
			const voicePlayers = this.engine.mediaPlayers ('voice');

			for (const player of voicePlayers) {
				if (!player.ended) {
					return Promise.reject('Voice player still playing.');
				}
			}
		}

		return Promise.resolve ();
	}

	static willProceed () {
		Play.shutUp ();
		return Promise.resolve ();
	}

	static willRollback () {
		Play.shutUp ();
		return Promise.resolve ();
	}

	static setup () {
		this.engine.history ('music');
		this.engine.history ('sound');
		this.engine.history ('voice');
		this.engine.state ({
			music: [],
			sound: [],
			voice: []
		});
		return Promise.resolve ();
	}

	static init (selector) {

		const mediaPlayers = Object.keys (this.engine.mediaPlayers ());
		// Set the volume of all the media components on the settings screen
		for (const mediaType of mediaPlayers) {
			const element = document.querySelector (`${selector} [data-target="${mediaType}"]`);

			if (element !== null) {
				let volume = this.engine.preference ('Volume')[Text.capitalize (mediaType)];

				if (typeof volume === 'string') {
					volume = parseFloat(volume);
				}

				element.value = volume;
			}
		}

		return Promise.resolve ();
	}

	static bind (selector) {
		const engine = this.engine;

		// Volume bars listeners
		$_(`${selector} [data-action="set-volume"]`).on ('change mouseover', function () {
			const target = this.dataset.target;
			let value = this.value;

			if (typeof value === 'string') {
				value = parseFloat(value);
			}

			if (target === 'video') {
				$_('[data-video]').each ((element) => {
					element.volume = value;
				});
			} else {
				const players = engine.mediaPlayers (target);

				// Music volume should also affect the main screen
				// ambient music
				if (target === 'music') {
					if (engine.ambientPlayer instanceof Audio) {
						engine.ambientPlayer.volume = value;
					}
				}

				for (const player of players) {
					if (!isNaN (player.dataset.volumePercentage)) {
						player.volume = (parseInt(player.dataset.volumePercentage) / 100 ) * value;
					} else {
						player.volume = value;
					}
				}
			}

			engine.preference ('Volume')[Text.capitalize (target)] = value;

			engine.preferences (engine.preferences (), true);
		});

		this.engine.state ({
			music: [],
			sound: [],
			voice: [],
		});

		return Promise.resolve ();
	}

	static onLoad () {
		const mediaPlayers = Object.keys (this.engine.mediaPlayers ());
		const promises = [];

		for (const mediaType of mediaPlayers) {
			const state =  this.engine.state (mediaType);

			if (typeof state !== 'undefined') {
				if (state.length > 0) {
					for (const s of state) {
						const action = this.engine.prepareAction (s.statement, { cycle: 'Application' });
						const promise = action.willApply ().then (() => {
							return action.apply ({ paused: s.paused }).then (() => {
								return action.didApply ({ updateHistory: false, updateState: false });
							});
						});

						promises.push (promise);
					}
				}
			}
		}

		if (promises.length > 0) {
			return Promise.all (promises);
		}
		return Promise.resolve ();
	}

	static reset () {

		const players = this.engine.mediaPlayers ();

		// Stop and remove all the media players
		for (const playerType of Object.keys (players)) {
			this.engine.removeMediaPlayer (playerType);
		}

		this.engine.state ({
			music: [],
			sound: [],
			voice: []
		});

		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'play';
	}

	// Stop the voice player
	static shutUp () {
		const players = this.engine.mediaPlayers ('voice', true);
		for (const media of Object.keys (players)) {
			this.engine.removeMediaPlayer ('voice', media);
		}

		this.engine.state ({ voice : [] });
	}

	/**
	 * Prepare the needed values to run the fade function on the given player
	 *
	 * @param {string} fadeTime - The time it will take the audio to reach it's maximum audio
	 * @param {Audio} player - The Audio object to modify
	 *
	 * @return {Promise} - This promise will resolve once the fadeIn has ended
	 */
	static fadeIn (fadeTime, player) {
		const time = parseFloat (fadeTime.match (/\d*(\.\d*)?/));
		const increments = time / 0.1;

		const targetVolume = player.volume;
		const maxVolume = targetVolume * 100;

		const volume = (maxVolume / increments) / maxVolume;

		const interval = (1000 * time) / increments;

		const expected = Date.now () + interval;

		player.volume = 0;

		player.dataset.fade = 'in';
		player.dataset.maxVolume = maxVolume;

		if (Math.sign (volume) === 1) {
			return new Promise ((resolve, reject) => {
				setTimeout (() => {
					Play.fade (player, volume, targetVolume, interval, expected, resolve);
				}, interval);
			});
		} else {
			// If the volume is set to zero or not valid, the fade effect is disabled
			// to prevent errors
			return Promise.resolve ();
		}
	}

	/**
	 * Fade the player's audio on small iterations until it reaches the maximum value for it
	 *
	 * @param {Audio} player The Audio player to which the audio will fadeIn
	 * @param {number} volume The amount to increase the volume on each iteration
	 * @param {number} interval The time in milliseconds between each iteration
	 * @param {Date} expected The expected time the next iteration will happen
	 * @param {function} resolve The resolve function of the promise returned by the fadeIn function
	 *
	 * @return {void}
	 */
	static fade (player, volume, targetVolume, interval, expected, resolve) {
		const now = Date.now () - expected; // the drift (positive for overshooting)

		if (now > interval) {
			// something really bad happened. Maybe the browser (tab) was inactive?
			// possibly special handling to avoid futile "catch up" run
		}

		if (player.volume !== 1 && player.dataset.fade === 'in') {
			if (player.volume + volume > targetVolume) {
				player.volume = targetVolume;
				delete player.dataset.fade;
				resolve ();
			} else {
				player.volume += volume;
				expected += interval;
				setTimeout (() => {
					Play.fade (player, volume, targetVolume, interval, expected, resolve);
				}, Math.max (0, interval - now)); // take into account drift
			}
		}
	}

	constructor ([ action, type, media, ...props ]) {
		super ();
		this.type = type;

		if (this.type === 'music') {
			this.directory = this.type;
		} else {
			// Directories are always plural so we need to add an "s"
			this.directory = this.type + 's';
		}

		this.mediaKey = media;
		this.props = props;

		this.mediaVolume = this.engine.preference ('Volume')[Text.capitalize (this.type)];

		// Check if a media was defined or just a `play music` was stated
		if (typeof media !== 'undefined' && media !== 'with') {
			if (typeof this.engine.asset (this.directory, media) !== 'undefined') {
				this.media = this.engine.asset (this.directory, media);
			} else {
				this.media = media;
			}

			let player = this.engine.mediaPlayer (this.type, this.mediaKey);
			if (typeof player === 'undefined') {
				player = new Audio ();
				player.volume = this.mediaVolume;
				this.player = this.engine.mediaPlayer (this.type, this.mediaKey, player);
			} else {
				this.player = player;
			}
		} else {
			this.player = this.engine.mediaPlayers (this.type);
		}
	}

	willApply () {
		if (this.player) {
			if (this.player instanceof Audio) {
				this.player.loop = false;
			}
			return Promise.resolve ();
		} else {
			return Promise.reject ('Media player was not defined.');
		}
	}

	apply ({ paused = false } = {}) {
		// Check if the audio should have a fade time
		const fadePosition = this.props.indexOf ('fade');

		if (this.player instanceof Audio) {
			// Make the audio loop if it was provided as a prop
			if (this.props.indexOf ('loop') > -1) {
				this.player.loop = true;
			}

			if (this.props.indexOf ('volume') > -1) {
				const percentage = parseInt (this.props[this.props.indexOf ('volume') + 1]);
				this.player.dataset.volumePercentage = percentage;
				this.player.volume = (percentage * this.mediaVolume) / 100;
			}

			this.player.src = `${this.engine.setting ('AssetsPath').root}/${this.engine.setting('AssetsPath')[this.directory]}/${this.media}`;

			this.player.onended = () => {
				const endState = {};
				endState[this.type] = this.engine.state (this.type).filter ((s) => s.statement !== this._statement);
				this.engine.state (endState);
				this.engine.removeMediaPlayer (this.type, this.mediaKey);
			};

			if (fadePosition > -1) {
				Play.fadeIn (this.props[fadePosition + 1], this.player);
			}

			if (paused !== true) {
				return this.player.play ();
			}
			this.player.pause ();
			return Promise.resolve ();
		} else if (this.player instanceof Array) {
			const promises = [];
			for (const player of this.player) {
				if (player.paused && !player.ended) {
					if (fadePosition > -1) {
						Play.fadeIn (this.props[fadePosition + 1], player);
					}
					promises.push (player.play ());
				}
			}
			return Promise.all (promises);
		}
		return Promise.reject('An error occurred, you probably have a typo on the media you want to play.');
	}

	didApply ({ updateHistory = true, updateState = true } = {}) {
		if (updateHistory === true) {
			if (this.player instanceof Audio) {
				this.engine.history (this.type).push (this._statement);
			}
		}

		if (updateState === true) {
			if (this.player instanceof Audio) {
				const state = {};
				state[this.type] = [...this.engine.state (this.type), { statement: this._statement, paused: false }];
				this.engine.state (state);
			} else if (this.player instanceof Array) {
				const state = {};
				state[this.type] = [...this.engine.state (this.type).map ((item) => {
					item.paused = false;
					return item;
				})];
				this.engine.state (state);
			}
		}

		return Promise.resolve ({ advance: true });
	}

	revert () {
		if (typeof this.mediaKey !== 'undefined') {
			this.engine.removeMediaPlayer (this.type, this.mediaKey);
		} else if (this.player instanceof Array) {
			for (const player of this.player) {
				if (!player.paused && !player.ended) {
					player.pause ();
				}
			}
		}

		return Promise.resolve ();
	}

	didRevert () {
		if (typeof this.mediaKey !== 'undefined') {
			this.engine.history (this.type).pop ();

			const state = {};
			state[this.type] = this.engine.state (this.type).filter ((m) => m.statement !== this._statement);
			this.engine.state (state);
		} else if (this.player instanceof Array) {
			const state = {};
			state[this.type] = [...this.engine.state (this.type).map ((item) => {
				item.paused = true;
				return item;
			})];
			this.engine.state (state);
		}
		return Promise.resolve ({ advance: true, step: true });
	}
}

Play.id = 'Play';

export default Play;
