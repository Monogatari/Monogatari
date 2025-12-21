import type { MediaStateItem, SaveGameData } from '../lib/types';

interface MigrationSaveData {
	state: {
		music?: (string | MediaStateItem)[];
		sound?: (string | MediaStateItem)[];
		voice?: (string | MediaStateItem)[];
		[key: string]: unknown;
	};
	history?: Record<string, unknown[]>;
	storage?: Record<string, unknown>;
	game?: SaveGameData;
}

/**
 * @Compatibility [<= v2.0.0-beta.15]
 *
 * Monogatari v2.0.0-beta.15 introduced a new format to save the state of the media
 * being played. Therefore, we need to check if the old format is being used in the
 * save file and transform it to the new one.
 */
const AddPauseStateToMediaState = (save: MigrationSaveData): MigrationSaveData => {
	const { state } = save;

	if (state.music instanceof Array) {
		if (state.music.length > 0) {
			const music: MediaStateItem[] = [];
			for (const statement of state.music) {
				if (typeof statement === 'string') {
					music.push({
						statement,
						paused: false,
					});
				} else {
					music.push(statement);
				}
			}
			state.music = music;
		}
	}

	if (state.sound instanceof Array) {
		if (state.sound.length > 0) {
			const sound: MediaStateItem[] = [];
			for (const statement of state.sound) {
				if (typeof statement === 'string') {
					sound.push({
						statement,
						paused: false,
					});
				} else {
					sound.push(statement);
				}
			}
			state.sound = sound;
		}
	}

	if (state.voice instanceof Array) {
		if (state.voice.length > 0) {
			const voice: MediaStateItem[] = [];
			for (const statement of state.voice) {
				if (typeof statement === 'string') {
					voice.push({
						statement,
						paused: false,
					});
				} else {
					voice.push(statement);
				}
			}
			state.voice = voice;
		}
	}

	save.state = state;

	return save;
};

export default AddPauseStateToMediaState;

