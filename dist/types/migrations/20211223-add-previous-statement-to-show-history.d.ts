import type { CharacterHistoryItem, SaveGameData } from '../lib/types';
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
declare const AddPreviousStatementToShowHistory: (save: MigrationSaveData) => MigrationSaveData;
export default AddPreviousStatementToShowHistory;
//# sourceMappingURL=20211223-add-previous-statement-to-show-history.d.ts.map