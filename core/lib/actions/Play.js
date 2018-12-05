import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_, Text } from '@aegis-framework/artemis';
import { throws } from 'assert';

export class Play extends Action {

	static canProceed () {
		if ($_(`${Monogatari.selector} [data-component="video"]`).isVisible ()) {
			return Promise.reject ();
		}

		Play.shutUp ();

		return Promise.resolve ();
	}

	static canRevert () {
		if ($_(`${Monogatari.selector} [data-component="video"]`).isVisible ()) {
			Play.stopVideo ();
		}

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
		Monogatari.ambientPlayer = document.querySelector (`${selector} [data-component="ambient"]`);
		Monogatari.videoPlayer = document.querySelector (`${selector} [data-ui="player"]`);

		// Volume bars listeners
		$_(`${selector} [data-action="set-volume"]`).on ('change mouseover', function () {
			const target = $_(this).data('target');
			const value = $_(this).value();
			const players = Monogatari.mediaPlayers (target);

			for (const player of players) {
				player.volume = value;
			}

			Monogatari.preference ('Volume')[Text.capitalize (target)] = value;

			Monogatari.Storage.set ('Settings', Monogatari.preferences ());
		});

		$_(`${selector} [data-action="close-video"]`).click (() => {
			Play.stopVideo ();
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
		Play.stopVideo ();

		const players = Monogatari.mediaPlayers ();

		// Stop and remove all the media players
		for (const playerType of Object.keys (players)) {
			Monogatari.removeMediaPlayer (playerType);
		}

		$_(`${Monogatari.selector} [data-component="video"]`).removeClass ('modal--active');
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'play';
	}

	static stopVideo () {
		Monogatari.removeMediaPlayer ('video');
		$_(`${Monogatari.selector} [data-component="video"]`).removeClass ('active');
	}

	// Stop the voice player
	static shutUp () {
		const players = Monogatari.mediaPlayers ('voice', true);
		for (const media of Object.keys (players)) {
			Monogatari.removeMediaPlayer ('voice', media);
		}
	}

	constructor ([ action, type, media, ...props ]) {
		super ();
		this.type = type;
		this.mediaKey = media;
		this.props = props;

		// Check if a media was defined or just a `play music` was stated
		if (typeof media !== 'undefined') {
			if (typeof Monogatari.asset (type, media) !== 'undefined') {
				this.media = Monogatari.asset (type, media);
			} else {
				this.media = media;
			}

			if (this.type != 'video') {
				let player = Monogatari.mediaPlayer (this.type, this.mediaKey);
				if (typeof player === 'undefined') {
					player = new Audio ();
					player.volume = Monogatari.preference ('Volume')[Text.capitalize (this.type)];
					this.player = Monogatari.mediaPlayer (this.type, this.mediaKey, player);
				} else {
					this.player = player;
				}
			} else if (this.type == 'video') {
				this.player = Monogatari.mediaPlayer (this.type, this.mediaKey, Monogatari.videoPlayer);
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
		if (this.player instanceof Audio) {
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

			return this.player.play ();
		} else if (this.player instanceof HTMLVideoElement) {
			this.player.src = `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting('AssetsPath')[this.type]}/${this.media}`;
			$_(`${Monogatari.selector} [data-component="video"]`).addClass ('active');

			return this.player.play ();
		} else if (this.player instanceof Array) {
			const promises = [];
			for (const player of this.player) {
				if (player.paused && !player.ended) {
					promises.push (player.play ());
				}
			}
			return Promise.all (promises);
		}

	}

	didApply () {
		if (this.type !== 'video') {
			return Promise.resolve (true);
		}

		return Promise.resolve ();
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
		return Promise.resolve (true);
	}
}

Play.id = 'Play';

Monogatari.registerAction (Play);