import { Preload as ArtemisPreload } from '@aegis-framework/artemis';
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
	characters?: Record<string, string[]>; // { characterId: [sprite names] }
	[category: string]: string[] | Record<string, string[]> | undefined;
}

export type PreloadBlocks = Record<string, PreloadBlock>;

export class Preload extends Action {

	static override id = 'Preload';

	// Static storage for block configurations
	static _blocks: PreloadBlocks = {};

	// Registry of custom loaders by type name
	static _loaders: Map<string, LoaderConfig> = new Map();

	// Registry mapping category names to loader types
	static _categoryLoaderMap: Map<string, string> = new Map();

	// Registry mapping category aliases (e.g., 'sound' -> 'sounds')
	static _categoryAliases: Map<string, string> = new Map();

	/**
	 * Setup default loaders for built-in asset types.
	 * Runs during setup() phase to ensure loaders are available before scripts execute.
	 */
	static override async setup(): Promise<void> {
		// Register default audio loader with IndexedDB persistence
		if (!this._loaders.has('audio')) {
			this.registerLoader('audio', {
				loader: async (url: string, eng: VisualNovelEngine) => {
					// Try to load from IndexedDB first (fast path - no network, no decode)
					const cacheKey = url; // URL is used as key for persistent storage
					const persistedBuffer = await eng.getAudioBufferPersistent(cacheKey);
					if (persistedBuffer) {
						return persistedBuffer;
					}

					// Not in IndexedDB, fetch and decode from network
					const buffer = await ArtemisPreload.audio(url, eng.audioContext);

					// Store in IndexedDB for future sessions (async, don't wait)
					eng.storeAudioBufferPersistent(cacheKey, buffer).catch(() => {
						// Silently ignore storage failures
					});

					return buffer;
				},
				cache: {
					get: (eng: VisualNovelEngine, key: string) => eng.audioBufferCache(key),
					set: (eng: VisualNovelEngine, key: string, value: AudioBuffer) => eng.audioBufferCache(key, value),
					delete: (eng: VisualNovelEngine, key: string) => eng.audioBufferUncache(key),
					clear: (eng: VisualNovelEngine, prefix: string) => eng.audioBufferClearCache(prefix),
				}
			});
		}

		// Register default image loader
		if (!this._loaders.has('image')) {
			this.registerLoader('image', {
				loader: async (url: string) => {
					return ArtemisPreload.image(url);
				},
				cache: {
					get: (eng: VisualNovelEngine, key: string) => eng.imageCache(key),
					set: (eng: VisualNovelEngine, key: string, value: HTMLImageElement) => eng.imageCache(key, value),
					delete: (eng: VisualNovelEngine, key: string) => eng.imageUncache(key),
					clear: (eng: VisualNovelEngine, prefix: string) => eng.imageClearCache(prefix),
				}
			});
		}

		// Register default category mappings (using plural names as assets are registered)
		const defaultAudioCategories = ['music', 'sounds', 'voices'];
		const defaultImageCategories = ['scenes', 'images', 'characters'];

		for (const category of defaultAudioCategories) {
			if (!this._categoryLoaderMap.has(category)) {
				this.registerCategory(category, 'audio');
			}
		}

		for (const category of defaultImageCategories) {
			if (!this._categoryLoaderMap.has(category)) {
				this.registerCategory(category, 'image');
			}
		}

		// Register default category aliases (singular -> plural)
		const defaultAliases: Record<string, string> = {
			'scene': 'scenes',
			'image': 'images',
			'sound': 'sounds',
			'voice': 'voices'
		};

		for (const [alias, category] of Object.entries(defaultAliases)) {
			if (!this._categoryAliases.has(alias)) {
				this.registerAlias(alias, category);
			}
		}
	}

	/**
	 * Register a custom asset loader
	 * @param type - Unique identifier for this loader type (e.g., 'audio', 'image', 'video')
	 * @param config - Loader configuration with loader function and cache accessors
	 */
	static registerLoader<T>(type: string, config: LoaderConfig<T>): void {
		this._loaders.set(type, config as LoaderConfig);
	}

	/**
	 * Register a category to use a specific loader type
	 * @param category - Category name (e.g., 'music', 'videos')
	 * @param loaderType - The loader type to use (e.g., 'audio', 'video')
	 */
	static registerCategory(category: string, loaderType: string): void {
		this._categoryLoaderMap.set(category, loaderType);
	}

	/**
	 * Get the loader type for a category
	 * @param category - Category name
	 * @returns The loader type string or undefined if not registered
	 */
	static getLoaderType(category: string): string | undefined {
		return this._categoryLoaderMap.get(category);
	}

	/**
	 * Get a loader configuration by type
	 * @param type - Loader type name
	 * @returns The loader configuration or undefined if not registered
	 */
	static getLoader(type: string): LoaderConfig | undefined {
		return this._loaders.get(type);
	}

	/**
	 * Check if a category has a registered loader
	 * @param category - Category name
	 * @returns True if the category has a registered loader
	 */
	static hasLoader(category: string): boolean {
		const loaderType = this._categoryLoaderMap.get(category);
		return loaderType !== undefined && this._loaders.has(loaderType);
	}

	/**
	 * Register an alias for a category (e.g., 'sound' -> 'sounds')
	 * @param alias - The alias name (e.g., 'sound')
	 * @param category - The actual category name (e.g., 'sounds')
	 */
	static registerAlias(alias: string, category: string): void {
		this._categoryAliases.set(alias, category);
	}

	/**
	 * Resolve a category name, applying any registered aliases
	 * @param category - The category name or alias
	 * @returns The resolved category name
	 */
	static resolveCategory(category: string): string {
		return this._categoryAliases.get(category) ?? category;
	}

	/**
	 * Register or retrieve block configurations
	 * @param config - Block configuration object to register (if setting)
	 * @returns Current blocks configuration
	 */
	static blocks(): PreloadBlocks;
	static blocks(config: PreloadBlocks): void;
	static blocks(config?: PreloadBlocks): PreloadBlocks | void {
		if (config !== undefined) {
			// Merge with existing blocks
			this._blocks = { ...this._blocks, ...config };
		} else {
			return this._blocks;
		}
	}

	static override matchString([action]: string[]): boolean {
		return action === 'preload';
	}

	// Instance properties
	private category: string = '';
	private assetName: string = '';
	private blockId: string = '';
	private isBlock: boolean = false;
	private isBlocking: boolean = false;
	private characterId: string = '';
	private preloadPromise: Promise<void> | null = null;

	constructor([_action, typeOrBlock, ...rest]: string[]) {
		super();

		// Parse the statement
		// Possible formats:
		// - preload music theme [blocking]
		// - preload scene forest [blocking]
		// - preload character y happy [blocking]
		// - preload block battle_scene [blocking]

		if (typeOrBlock === 'block') {
			this.isBlock = true;
			this.blockId = rest[0];
			this.isBlocking = rest.includes('blocking');
		} else if (typeOrBlock === 'character') {
			this.category = 'characters';
			this.characterId = rest[0];
			this.assetName = rest[1];
			this.isBlocking = rest.includes('blocking');
		} else {
			// Resolve category aliases (e.g., 'sound' -> 'sounds')
			this.category = Preload.resolveCategory(typeOrBlock);
			this.assetName = rest[0];
			this.isBlocking = rest.includes('blocking');
		}
	}

	/**
	 * Preload a single asset using the registered loader for its category
	 * @param category - The asset category (e.g., 'music', 'scenes', 'videos')
	 * @param assetName - The asset identifier
	 */
	private async preloadAsset(category: string, assetName: string): Promise<void> {
		const loaderType = Preload.getLoaderType(category);
		if (!loaderType) {
			console.warn(`Preload: No loader registered for category "${category}"`);
			return;
		}

		const loaderConfig = Preload.getLoader(loaderType);
		if (!loaderConfig) {
			console.warn(`Preload: Loader type "${loaderType}" not found`);
			return;
		}

		const assetsPath = this.engine.setting('AssetsPath') as Record<string, string>;
		const assetFile = this.engine.asset(category, assetName) as string | undefined;

		if (!assetFile) {
			console.warn(`Preload: Asset "${assetName}" not found in category "${category}"`);
			return;
		}

		const url = `${assetsPath.root}/${assetsPath[category]}/${assetFile}`;
		const cacheKey = `${category}/${assetName}`;

		// Skip if already cached
		if (loaderConfig.cache.get(this.engine, cacheKey) !== undefined) {
			return;
		}

		try {
			const asset = await loaderConfig.loader(url, this.engine);
			loaderConfig.cache.set(this.engine, cacheKey, asset);
		} catch (error) {
			console.error(`Preload: Failed to preload ${category} asset "${assetName}":`, error);
		}
	}

	/**
	 * Preload a character sprite using the registered 'image' loader
	 */
	private async preloadCharacterSprite(characterId: string, spriteName: string): Promise<void> {
		const loaderConfig = Preload.getLoader('image');
		if (!loaderConfig) {
			console.warn(`Preload: Image loader not registered`);
			return;
		}

		const character = this.engine.character(characterId);
		if (!character) {
			console.warn(`Preload: Character "${characterId}" not found`);
			return;
		}

		const assetsPath = this.engine.setting('AssetsPath') as Record<string, string>;
		let directory = character.directory ? `${character.directory}/` : '';
		directory = `${assetsPath.root}/${assetsPath.characters}/${directory}`;

		const spriteFile = character.sprites?.[spriteName];
		if (!spriteFile || typeof spriteFile !== 'string') {
			console.warn(`Preload: Sprite "${spriteName}" not found for character "${characterId}"`);
			return;
		}

		const url = `${directory}${spriteFile}`;
		const cacheKey = `characters/${characterId}/${spriteName}`;

		// Skip if already cached
		if (loaderConfig.cache.get(this.engine, cacheKey) !== undefined) {
			return;
		}

		try {
			const asset = await loaderConfig.loader(url, this.engine);
			loaderConfig.cache.set(this.engine, cacheKey, asset);
		} catch (error) {
			console.error(`Preload: Failed to preload character sprite "${characterId}/${spriteName}":`, error);
		}
	}

	/**
	 * Preload all assets in a block
	 */
	private async preloadBlock(blockId: string): Promise<void> {
		const block = Preload._blocks[blockId];
		if (!block) {
			console.warn(`Preload: Block "${blockId}" not found`);
			return;
		}

		const promises: Promise<void>[] = [];

		for (const [category, assets] of Object.entries(block)) {
			// Handle characters separately (nested structure)
			if (category === 'characters' && typeof assets === 'object' && !Array.isArray(assets)) {
				for (const [charId, sprites] of Object.entries(assets as Record<string, string[]>)) {
					for (const spriteName of sprites) {
						promises.push(this.preloadCharacterSprite(charId, spriteName));
					}
				}
				continue;
			}

			if (!Array.isArray(assets)) continue;

			// Use registered loader for this category
			if (Preload.hasLoader(category)) {
				for (const assetName of assets) {
					promises.push(this.preloadAsset(category, assetName));
				}
			} else {
				console.warn(`Preload: No loader registered for category "${category}" in block "${blockId}"`);
			}
		}

		await Promise.all(promises);
	}

	override async apply(): Promise<void> {
		// Start the preload operation
		if (this.isBlock) {
			this.preloadPromise = this.preloadBlock(this.blockId);
		} else if (this.category === 'characters') {
			this.preloadPromise = this.preloadCharacterSprite(this.characterId, this.assetName);
		} else if (Preload.hasLoader(this.category)) {
			this.preloadPromise = this.preloadAsset(this.category, this.assetName);
		} else {
			console.warn(`Preload: No loader registered for category "${this.category}"`);
		}

		// If blocking, wait for the preload to complete
		if (this.isBlocking && this.preloadPromise) {
			await this.preloadPromise;
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
		return { advance: true };
	}

	override async revert(): Promise<void> {
    // Can't really revert a preload action
    return;
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default Preload;

