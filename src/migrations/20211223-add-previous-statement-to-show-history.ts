import type { CharacterHistoryItem, SaveGameData } from '../lib/types';

/**
 * Save data structure for migration
 */
interface MigrationSaveData {
	state?: Record<string, unknown>;
	history: {
		character?: (string | CharacterHistoryItem)[];
		[key: string]: unknown[] | undefined;
	};
	storage?: Record<string, unknown>;
	game?: SaveGameData;
}

/**
 * @Compatibility [< v2.1.0]
 *
 * Monogatari v2.1.0 introduced a new format to save the history of the show
 * actions by adding the previous statement they may have replaced in order to
 * suppress a bug where the incorrect items were shown as it assumed they were
 * previously visible.
 */
const AddPreviousStatementToShowHistory = (save: MigrationSaveData): MigrationSaveData => {
	const { history } = save;

	if (history.character instanceof Array) {
		if (history.character.length > 0) {
			const characters: CharacterHistoryItem[] = [];
			for (let i = 0; i < history.character.length; i++) {
				const statement = history.character[i];
				if (typeof statement === 'string') {
					const [_show, _character, asset] = statement.split(' ');

					const previous = ([...history.character.slice(0, i)] as (string | CharacterHistoryItem)[]).reverse().find((item) => {
						if (typeof item === 'string') {
							const [, , _asset] = item.split(' ');
							return asset === _asset;
						}
						return false;
					});

					characters.push({
						statement,
						previous: typeof previous === 'string' ? previous : null
					});
				} else {
					characters.push(statement);
				}
			}

			history.character = characters;
			save.history = history;
		}
	}

	return save;
};

export default AddPreviousStatementToShowHistory;

