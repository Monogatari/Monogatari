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
declare const AddPauseStateToMediaState: (save: MigrationSaveData) => MigrationSaveData;
export default AddPauseStateToMediaState;
//# sourceMappingURL=20200310-add-pause-state-to-media-state.d.ts.map