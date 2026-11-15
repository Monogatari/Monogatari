import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult, VisualNovelEngine } from '../lib/types';
/**
 * Asset loader function type
 * @param url - The URL of the asset to load
 * @param engine - The Monogatari engine instance
 * @returns A promise resolving to the loaded asset
 */
export type AssetLoader<T = unknown> = (url: string, engine: VisualNovelEngine) => Promise<T>;
/**
 * Asset cache accessor type for getting/setting/deleting cached assets
 */
export type AssetCacheAccessor<T = unknown> = {
    get: (engine: VisualNovelEngine, key: string) => T | undefined;
    set: (engine: VisualNovelEngine, key: string, value: T) => void;
    delete?: (engine: VisualNovelEngine, key: string) => void;
    clear?: (engine: VisualNovelEngine, prefix: string) => void;
};
/**
 * Configuration for registering a custom asset loader
 */
export type LoaderConfig<T = unknown> = {
    loader: AssetLoader<T>;
    cache: AssetCacheAccessor<T>;
};
/**
 * Type definitions for preload block configuration
 * Users can extend this via declaration merging to add custom categories
 */
export interface PreloadBlock {
    music?: string[];
    sound?: string[];
    voice?: string[];
    scenes?: string[];
    images?: string[];
    characters?: Record<string, string[]>;
    [category: string]: string[] | Record<string, string[]> | undefined;
}
export type PreloadBlocks = Record<string, PreloadBlock>;
export declare class Preload extends Action {
    static id: string;
    static _blocks: PreloadBlocks;
    static _loaders: Map<string, LoaderConfig>;
    static _categoryLoaderMap: Map<string, string>;
    static _categoryAliases: Map<string, string>;
    /**
     * Setup default loaders for built-in asset types.
     * Runs during setup() phase to ensure loaders are available before scripts execute.
     */
    static setup(): Promise<void>;
    /**
     * Register a custom asset loader
     * @param type - Unique identifier for this loader type (e.g., 'audio', 'image', 'video')
     * @param config - Loader configuration with loader function and cache accessors
     */
    static registerLoader<T>(type: string, config: LoaderConfig<T>): void;
    /**
     * Register a category to use a specific loader type
     * @param category - Category name (e.g., 'music', 'videos')
     * @param loaderType - The loader type to use (e.g., 'audio', 'video')
     */
    static registerCategory(category: string, loaderType: string): void;
    /**
     * Get the loader type for a category
     * @param category - Category name
     * @returns The loader type string or undefined if not registered
     */
    static getLoaderType(category: string): string | undefined;
    /**
     * Get a loader configuration by type
     * @param type - Loader type name
     * @returns The loader configuration or undefined if not registered
     */
    static getLoader(type: string): LoaderConfig | undefined;
    /**
     * Check if a category has a registered loader
     * @param category - Category name
     * @returns True if the category has a registered loader
     */
    static hasLoader(category: string): boolean;
    /**
     * Register an alias for a category (e.g., 'sound' -> 'sounds')
     * @param alias - The alias name (e.g., 'sound')
     * @param category - The actual category name (e.g., 'sounds')
     */
    static registerAlias(alias: string, category: string): void;
    /**
     * Resolve a category name, applying any registered aliases
     * @param category - The category name or alias
     * @returns The resolved category name
     */
    static resolveCategory(category: string): string;
    /**
     * Register or retrieve block configurations
     * @param config - Block configuration object to register (if setting)
     * @returns Current blocks configuration
     */
    static blocks(): PreloadBlocks;
    static blocks(config: PreloadBlocks): void;
    static matchString([action]: string[]): boolean;
    private category;
    private assetName;
    private blockId;
    private isBlock;
    private isBlocking;
    private characterId;
    private preloadPromise;
    constructor([_action, typeOrBlock, ...rest]: string[]);
    /**
     * Preload a single asset using the registered loader for its category
     * @param category - The asset category (e.g., 'music', 'scenes', 'videos')
     * @param assetName - The asset identifier
     */
    private preloadAsset;
    /**
     * Preload a character sprite using the registered 'image' loader
     */
    private preloadCharacterSprite;
    /**
     * Preload all assets in a block
     */
    private preloadBlock;
    apply(): Promise<void>;
    didApply(): Promise<ActionApplyResult>;
    revert(): Promise<void>;
    didRevert(): Promise<ActionRevertResult>;
}
export default Preload;
//# sourceMappingURL=Preload.d.ts.map