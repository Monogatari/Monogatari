import { Action } from './../lib/Action';
import { $_, Text } from '@aegis-framework/artemis';

export class Play extends Action {

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
				element.value = this.engine.preference ('Volume')[Text.capitalize (mediaType)];
			}
		}

		return Promise.resolve ();
	}

	static bind (selector) {
		const engine = this.engine;

		// Volume bars listeners
		$_(`${selector} [data-action="set-volume"]`).on ('change mouseover', function () {
			const target = this.dataset.target;
			const value = this.value;

			if (target === 'video') {
				$_('[data-video]').each ((element) => {
					element.volume = value;
				});
			} else {
				const players = engine.mediaPlayers (target);

				for (const player of players) {
					player.volume = value;
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
					for (const statement of state) {
						promises.push (this.engine.run (statement, false));
						// TODO: Find a way to prevent the histories from filling up on loading
						// So there's no need for this pop.
						this.engine.history (mediaType).pop ();
						this.engine.state (mediaType).pop ();
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
		const maxVolume = player.volume * 100;

		const volume = (maxVolume / increments) / maxVolume;

		const interval = (1000 * time) / increments;

		const expected = Date.now () + interval;

		player.volume = 0;

		player.dataset.fade = 'in';
		player.dataset.maxVolume = maxVolume;

		return new Promise ((resolve, reject) => {
			setTimeout (() => {
				Play.fade (player, volume, interval, expected, resolve);
			}, interval);
		});
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
	static fade (player, volume, interval, expected, resolve) {
		const now = Date.now () - expected; // the drift (positive for overshooting)

		if (now > interval) {
			// something really bad happened. Maybe the browser (tab) was inactive?
			// possibly special handling to avoid futile "catch up" run
		}

		if (player.volume !== 1 && player.dataset.fade === 'in') {
			if (player.volume + volume > 1) {
				player.volume = 1;
				delete player.dataset.fade;
				resolve ();
			} else {
				player.volume += volume;
				expected += interval;
				setTimeout (() => {
					Play.fade (player, volume, interval, expected, resolve);
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
			this.player = this.engine.mediaPlayer (this.type);
		}
	}

	willApply () {
		if (this.player instanceof Audio) {
			this.player.loop = false;
		}
		return Promise.resolve ();
	}

	apply () {
		if (this.player) {
			// Check if the audio should have a fade time
			const fadePosition = this.props.indexOf ('fade');

			if (this.player instanceof Audio) {
				// Make the audio loop if it was provided as a prop
				if (this.props.indexOf ('loop') > -1) {
					this.player.loop = true;
				}

				if (this.props.indexOf ('volume') > -1) {
					this.player.volume = (parseInt (this.props[this.props.indexOf ('volume') + 1]) * this.mediaVolume) / 100;
				}

				this.player.src = `${this.engine.setting ('AssetsPath').root}/${this.engine.setting('AssetsPath')[this.directory]}/${this.media}`;

				this.engine.history (this.type).push (this._statement);

				const state = {};
				state[this.type] = [...this.engine.state (this.type), this._statement];
				this.engine.state (state);

				this.player.onended = () => {
					const endState = {};
					endState[this.type] = this.engine.state (this.type).filter ((s) => s !== this._statement);
					this.engine.state (endState);
					this.engine.removeMediaPlayer (this.type, this.mediaKey);
				};

				if (fadePosition > -1) {
					Play.fadeIn (this.props[fadePosition + 1], this.player);
				}

				return this.player.play ();
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
		}
		return Promise.reject('An error occurred, you probably have a typo on the media you want to play.');
	}

	didApply () {
		return Promise.resolve ({ advance: true });
	}

	revert () {
		if (typeof this.mediaKey !== 'undefined') {
			this.engine.removeMediaPlayer (this.type, this.mediaKey);

			this.engine.history (this.type).pop ();

			const state = {};
			state[this.type] = this.engine.state (this.type).filter ((m) => m !== this._statement);
			this.engine.state (state);
		} else {
			for (const player of this.player) {
				if (!player.paused && !player.ended) {
					player.pause ();
				}
			}
		}

		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Play.id = 'Play';

export default Play;