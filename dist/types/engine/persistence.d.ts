import type { VisualNovelEngine } from '../lib/types/Monogatari';
import type { HistoryMap, StateMap } from '../lib/types';
/**
 * Get all the relevant information of the game state.
 * Named `gameObject` to avoid collision with JS `Object`.
 *
 * @returns An object containing the current histories, state and storage variables.
 */
export declare function gameObject(engine: VisualNovelEngine): {
    history: HistoryMap;
    state: StateMap;
    storage: unknown;
};
export declare function saveTo(engine: VisualNovelEngine, prefix?: string, id?: number | null, name?: string | null): Promise<unknown>;
export declare function resetGame(engine: VisualNovelEngine): Promise<unknown[]>;
export declare function upgrade(engine: VisualNovelEngine, oldVersion: string, newVersion: string, callbacks: {
    storage?: (oldData: unknown) => unknown;
    replaceStorage?: boolean;
}): void;
export declare function setupStorage(engine: VisualNovelEngine): void;
/**
 * Load a slot from the storage. This will recover the state of the game
 * from what was saved in it.
 *
 * @param slot - The key with which the slot was saved on the storage
 */
export declare function loadFromSlot(engine: VisualNovelEngine, slot: string): Promise<void>;
//# sourceMappingURL=persistence.d.ts.map