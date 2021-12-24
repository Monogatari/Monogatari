/**
 * @Compatibility [< v2.1.0]
 *
 * Monogatari v2.1.0 introduced a new format to save the history of the show
 * actions by adding the previous statement they may have replaced in order to
 * supress a bug where the incorrect items were shown as it assumed they were
 * previously visible.
 */
const AddPreviousStatementToShowHistory = (save) => {
	const { history } = save;

	if (history.character instanceof Array) {
		if (history.character.length > 0) {
			const characters = [];
			for (let i = 0; i < history.character.length; i++) {
				const statement = history.character[i];
				if (typeof statement === 'string') {

					const [show, character, asset, sprite] = statement.split(' ');

					const previous = [...history.character.slice(0, i)].reverse().find((item) => {
						const [_show, _character, _asset, _sprite] = item.split (' ');
						return asset === _asset;
					});
					characters.push ({
						statement,
						previous: previous || null
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