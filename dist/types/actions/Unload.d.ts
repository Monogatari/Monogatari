import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
export declare class Unload extends Action {
    static id: string;
    static matchString([action]: string[]): boolean;
    private category;
    private assetName;
    private blockId;
    private isBlock;
    private isAll;
    private isCategoryOnly;
    private characterId;
    private isPermanent;
    constructor([_action, typeOrBlock, ...rest]: string[]);
    /**
     * Unload a single asset using the registered loader for its category
     * @param category - The asset category (e.g., 'music', 'scenes', 'videos')
     * @param assetName - The asset identifier
     */
    private unloadAsset;
    /**
     * Unload a character sprite or all sprites for a character
     * Uses the registered 'image' loader
     */
    private unloadCharacter;
    /**
     * Unload all assets in a block
     */
    private unloadBlock;
    /**
     * Unload all assets in a category using the registered loader
     */
    private unloadCategoryAssets;
    /**
     * Determine if a category uses audio (for persistent storage)
     */
    private isAudioCategory;
    /**
     * Unload from persistent storage (IndexedDB) if applicable
     */
    private unloadPersistent;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Unload;
//# sourceMappingURL=Unload.d.ts.map