import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { $_, Text } from '@aegis-framework/artemis';

export class Play extends Action {

	static shouldProceed () {
		Play.shutUp ();
		return Promise.resolve ();
	}

	static shouldRollback () {
		Play.shutUp ();
		return Promise.resolve ();
	}

	static setup () {
		Monogatari.history ('music');
		Monogatari.history ('sound');
		Monogatari.history ('voice');
		Monogatari.state ({
			music: [],
			sound: [],
			voice: []
		});
		return Promise.resolve ();
	}

	static init (selector) {

		const mediaPlayers = Object.keys (Monogatari.mediaPlayers ());
		// Set the volume of all the media components on the settings screen
		for (const mediaType of mediaPlayers) {
			const element = document.querySelector (`${selector} [data-target="${mediaType}"]`);
			if (element !== null) {
				element.value = Monogatari.preference ('Volume')[Text.capitalize (mediaType)];
			}
		}

		return Promise.resolve ();
	}

	static bind (selector) {

		// Volume bars listeners
		$_(`${selector} [data-action="set-volume"]`).on ('change mouseover', function () {
			const target = this.dataset.target;
			const value = this.value;

			if (target === 'video') {
				$_('[data-video]').each ((element) => {
					element.volume = value;
				});
			} else {
				const players = Monogatari.mediaPlayers (target);

				for (const player of players) {
					player.volume = value;
				}
			}

			Monogatari.preference ('Volume')[Text.capitalize (target)] = value;

			Monogatari.preferences (Monogatari.preferences (), true);
		});

		Monogatari.state ({
			music: [],
			sound: [],
			voice: [],
		});

		return Promise.resolve ();
	}

	static onLoad () {
		const mediaPlayers = Object.keys (Monogatari.mediaPlayers ());

		for (const mediaType of mediaPlayers) {
			const state =  Monogatari.state (mediaType);

			if (typeof state !== 'undefined') {
				if (state.length > 0) {
					for (const statement of state) {
						Monogatari.run (statement, false);
						// TODO: Find a way to prevent the histories from filling up on loading
						// So there's no need for this pop.
						Monogatari.history (mediaType).pop ();
					}
				}
			}
		}
		return Promise.resolve ();
	}

	static reset () {

		const players = Monogatari.mediaPlayers ();

		// Stop and remove all the media players
		for (const playerType of Object.keys (players)) {
			Monogatari.removeMediaPlayer (playerType);
		}

		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'play';
	}

	// Stop the voice player
	static shutUp () {
		const players = Monogatari.mediaPlayers ('voice', true);
		for (const media of Object.keys (players)) {
			Monogatari.removeMediaPlayer ('voice', media);
		}
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
		this.mediaKey = media;
		this.props = props;

		// Check if a media was defined or just a `play music` was stated
		if (typeof media !== 'undefined' && media !== 'with') {
			if (typeof Monogatari.asset (type, media) !== 'undefined') {
				this.media = Monogatari.asset (type, media);
			} else {
				this.media = media;
			}

			let player = Monogatari.mediaPlayer (this.type, this.mediaKey);
			if (typeof player === 'undefined') {
				player = new Audio ();
				player.volume = Monogatari.preference ('Volume')[Text.capitalize (this.type)];
				this.player = Monogatari.mediaPlayer (this.type, this.mediaKey, player);
			} else {
				this.player = player;
			}
		} else {
			this.player = Monogatari.mediaPlayer (this.type);
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

				this.player.src = `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting('AssetsPath')[this.type]}/${this.media}`;

				Monogatari.history (this.type).push (this._statement);

				const state = {};
				state[this.type] = [...Monogatari.state (this.type), this._statement];
				Monogatari.state (state);

				this.player.onended = () => {
					const endState = {};
					endState[this.type] = Monogatari.state (this.type).filter ((s) => s !== this._statement);
					Monogatari.state (endState);
					Monogatari.removeMediaPlayer (this.type, this.mediaKey);
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
			Monogatari.removeMediaPlayer (this.type, this.mediaKey);

			Monogatari.history (this.type).pop ();

			const state = {};
			state[this.type] = Monogatari.state (this.type).filter ((m) => m !== this._statement);
			Monogatari.state (state);
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

Monogatari.registerAction (Play, true);