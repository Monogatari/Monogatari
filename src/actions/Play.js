import { $_, Text } from '@aegis-framework/artemis';

import { Action } from './../lib/Action';
import AudioPlayer from './../lib/AudioPlayer';

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
		if (!this.engine.audioContext) {
			this.engine.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		}

		// Initialize AudioPlayer worklets for the audio context
		AudioPlayer.initialize(this.engine.audioContext).catch(error => {
			console.warn('Failed to initialize AudioPlayer worklets:', error);
		});

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

				// Music volume should also affect the main screen ambient music
				if (target === 'music') {
					if (engine.ambientPlayer.gainNode) {
						engine.ambientPlayer.gainNode.gain.setValueAtTime(value, engine.audioContext.currentTime);
					} else if (engine.ambientPlayer.volume !== undefined) {
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

			const player = this.engine.mediaPlayer (this.type, this.mediaKey);

			// We'll create the player in the apply method since it's async
			this.player = typeof player === 'undefined' ? null : player;
		} else {
			this.player = this.engine.mediaPlayers (this.type);
		}
	}

	async createAudioPlayer (paused = false) {
		const audioContext = this.engine.audioContext;
		const gainNode = audioContext.createGain ();
		gainNode.connect (audioContext.destination);
		gainNode.gain.setValueAtTime (this.mediaVolume, audioContext.currentTime);

		// Load audio file
		const response = await fetch (`${this.engine.setting ('AssetsPath').root}/${this.engine.setting('AssetsPath')[this.directory]}/${this.media}`);
		const arrayBuffer = await response.arrayBuffer ();
		const audioBuffer = await audioContext.decodeAudioData (arrayBuffer);

		// Parse effects from props
		const effects = this.parseEffects();

		return new AudioPlayer(audioContext, audioBuffer, { 
			outputNode: gainNode, 
			effects: effects,
			paused: paused,
		});
	}

	parseEffects () {
		const availableEffects = AudioPlayer.effects ();
		
		const effects = {};
		
		for (const [id, config] of Object.entries (availableEffects)) {
			const index = this.props.indexOf (id);
			
			if (index === -1) {
				continue;
			}

			const params = {};
			
			// Parse parameters based on the effect's parameter list
			for (let i = 0; i < config.params.length; i++) {
				const paramName = config.params[i];
				const paramValue = this.props[index + 1 + i];
				
				if (paramValue !== undefined) {
					// Try to parse as number first, fallback to string
					const numValue = parseFloat (paramValue);
					params[paramName] = isNaN (numValue) ? paramValue : numValue;
				}
			}
			
			effects[id] = params;
		}

		return effects;
	}

	willApply () {
		if (this.player || this.mediaKey) {
			if (this.player instanceof AudioPlayer) {
				this.player.loop = false;
			}
			return Promise.resolve ();
		}

		return Promise.reject ('Media player was not defined.');
	}

	async apply ({ paused = false } = {}) {
		// Check if the audio should have a fade time
		const fadePosition = this.props.indexOf ('fade');

		// Create player if it doesn't exist yet
		if (this.player === null) {
			this.player = await this.createAudioPlayer(paused);
			this.engine.mediaPlayer (this.type, this.mediaKey, this.player);
		}

		if (this.player instanceof AudioPlayer) {
			// Make the audio loop if it was provided as a prop
			if (this.props.indexOf ('loop') > -1) {
				this.player.loop = true;
			}

			if (this.props.indexOf ('volume') > -1) {
				const percentage = parseInt (this.props[this.props.indexOf ('volume') + 1]);
				this.player.dataset.volumePercentage = percentage;
				this.player.volume = (percentage * this.mediaVolume) / 100;
			}

			this.player.onended = () => {
				const endState = {};
				endState[this.type] = this.engine.state (this.type).filter ((s) => s.statement !== this._statement);
				this.engine.state (endState);
				this.engine.removeMediaPlayer (this.type, this.mediaKey);
			};

			if (fadePosition > -1) {
				const fadeTime = this.props[fadePosition + 1];
				const duration = parseFloat(fadeTime.match(/\d*(\.\d*)?/)[0]);
				this.player.fadeIn(duration);
			}

			if (paused === true) {	
				return Promise.resolve();
			}
			
			return this.player.play ();
			
		}
		else if (this.player instanceof Array) {
			const promises = [];
			for (const player of this.player) {
				if (player.paused && !player.ended) {
					if (fadePosition > -1) {
						const fadeTime = this.props[fadePosition + 1];
						const duration = parseFloat(fadeTime.match(/\d*(\.\d*)?/)[0]);
						player.fadeIn(duration);
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
			if (this.player instanceof AudioPlayer || this.mediaKey) {
				this.engine.history (this.type).push (this._statement);
			}
		}

		if (updateState === true) {
			if (this.player instanceof AudioPlayer || this.mediaKey) {
				const state = {};
				state[this.type] = [...this.engine.state (this.type), { statement: this._statement, paused: false }];
				this.engine.state (state);
			} else if (this.player instanceof Array) {
				const state = {};
				state[this.type] = [...this.engine.state (this.type).map ((item) => ({
					...item,
					paused: false
				}))];
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
			state[this.type] = [...this.engine.state (this.type).map ((item) => ({
				...item,
				paused: true
			}))];
			this.engine.state (state);
		}
		return Promise.resolve ({ advance: true, step: true });
	}
}

Play.id = 'Play';

export default Play;
