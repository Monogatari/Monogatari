import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';
import { Preload, PreloadBlocks } from './Preload';


export class Unload extends Action {

	static override id = 'Unload';

	static override matchString([action]: string[]): boolean {
		return action === 'unload';
	}

	// Instance properties
	private category: string = '';
	private assetName: string = '';
	private blockId: string = '';
	private isBlock: boolean = false;
	private isAll: boolean = false;
	private isCategoryOnly: boolean = false;
	private characterId: string = '';
	private isPermanent: boolean = false;

	constructor([_action, typeOrBlock, ...rest]: string[]) {
		super();

		// Check for 'permanent' flag at the end
		this.isPermanent = rest.includes('permanent');
		// Remove 'permanent' from rest for easier parsing
		const filteredRest = rest.filter(arg => arg !== 'permanent');

		if (typeOrBlock === 'all') {
			this.isAll = true;
		} else if (typeOrBlock === 'block') {
			this.isBlock = true;
			this.blockId = filteredRest[0];
		} else if (typeOrBlock === 'character') {
			this.category = 'characters';
			this.characterId = filteredRest[0];
			this.assetName = filteredRest[1] || ''; // Empty means all sprites for character
		} else {
			// Resolve category aliases (e.g., 'sound' -> 'sounds')
			this.category = Preload.resolveCategory(typeOrBlock);

			if (filteredRest.length > 0) {
				this.assetName = filteredRest[0];
			} else {
				// No asset name means unload entire category
				this.isCategoryOnly = true;
			}
		}
	}

	/**
	 * Unload a single asset using the registered loader for its category
	 * @param category - The asset category (e.g., 'music', 'scenes', 'videos')
	 * @param assetName - The asset identifier
	 */
	private unloadAsset(category: string, assetName: string): void {
		const loaderType = Preload.getLoaderType(category);
		if (!loaderType) {
			console.warn(`Unload: No loader registered for category "${category}"`);
			return;
		}

		const loaderConfig = Preload.getLoader(loaderType);
		if (!loaderConfig) {
			console.warn(`Unload: Loader type "${loaderType}" not found`);
			return;
		}

		if (!loaderConfig.cache.delete) {
			console.warn(`Unload: Loader type "${loaderType}" does not support delete operation`);
			return;
		}

		const cacheKey = `${category}/${assetName}`;
		loaderConfig.cache.delete(this.engine, cacheKey);
	}

	/**
	 * Unload a character sprite or all sprites for a character
	 * Uses the registered 'image' loader
	 */
	private unloadCharacter(characterId: string, spriteName?: string): void {
		const loaderConfig = Preload.getLoader('image');
		if (!loaderConfig) {
			console.warn(`Unload: Image loader not registered`);
			return;
		}

		if (spriteName) {
			// Unload single sprite
			if (!loaderConfig.cache.delete) {
				console.warn(`Unload: Image loader does not support delete operation`);
				return;
			}
			const cacheKey = `characters/${characterId}/${spriteName}`;
			loaderConfig.cache.delete(this.engine, cacheKey);
		} else {
			// Unload all sprites for this character
			if (!loaderConfig.cache.clear) {
				console.warn(`Unload: Image loader does not support clear operation`);
				return;
			}
			loaderConfig.cache.clear(this.engine, `characters/${characterId}/`);
		}
	}

	/**
	 * Unload all assets in a block
	 */
	private unloadBlock(blockId: string): void {
		const blocks = Preload.blocks() as PreloadBlocks;
		const block = blocks[blockId];
		if (!block) {
			console.warn(`Unload: Block "${blockId}" not found`);
			return;
		}

		for (const [category, assets] of Object.entries(block)) {
			// Handle characters separately (nested structure)
			if (category === 'characters' && typeof assets === 'object' && !Array.isArray(assets)) {
				for (const [charId, sprites] of Object.entries(assets as Record<string, string[]>)) {
					for (const spriteName of sprites) {
						this.unloadCharacter(charId, spriteName);
					}
				}
				continue;
			}

			if (!Array.isArray(assets)) continue;

			// Use registered loader for this category
			if (Preload.hasLoader(category)) {
				for (const assetName of assets) {
					this.unloadAsset(category, assetName);
				}
			} else {
				console.warn(`Unload: No loader registered for category "${category}" in block "${blockId}"`);
			}
		}
	}

	/**
	 * Unload all assets in a category using the registered loader
	 */
	private unloadCategoryAssets(category: string): void {
		// Special case for characters - use 'image' loader
		const loaderType = category === 'characters' ? 'image' : Preload.getLoaderType(category);
		if (!loaderType) {
			console.warn(`Unload: No loader registered for category "${category}"`);
			return;
		}

		const loaderConfig = Preload.getLoader(loaderType);
		if (!loaderConfig) {
			console.warn(`Unload: Loader type "${loaderType}" not found`);
			return;
		}

		if (!loaderConfig.cache.clear) {
			console.warn(`Unload: Loader type "${loaderType}" does not support clear operation`);
			return;
		}

		const prefix = category === 'characters' ? 'characters/' : `${category}/`;
		loaderConfig.cache.clear(this.engine, prefix);
	}

	/**
	 * Determine if a category uses audio (for persistent storage)
	 */
	private isAudioCategory(category: string): boolean {
		const loaderType = Preload.getLoaderType(category);
		return loaderType === 'audio';
	}

	/**
	 * Unload from persistent storage (IndexedDB) if applicable
	 */
	private async unloadPersistent(category: string, assetName?: string): Promise<void> {
		if (!this.isAudioCategory(category)) {
			return; // Only audio is persisted in IndexedDB
		}

		if (assetName) {
			// Build the URL key used for persistent storage
			const assetsPath = this.engine.setting('AssetsPath') as Record<string, string>;
			const assetFile = this.engine.asset(category, assetName) as string | undefined;
			if (assetFile) {
				const url = `${assetsPath.root}/${assetsPath[category]}/${assetFile}`;
				await this.engine.removeAudioBufferPersistent(url);
			}
		} else {
			// Clear all persistent audio - we can't easily filter by prefix
			// so for category-wide unload, we'll clear all
			await this.engine.clearAudioBufferPersistent();
		}
	}

	override async apply(): Promise<void> {
		if (this.isAll) {
			// Clear all memory caches
			this.engine.clearAllCaches();

			// If permanent, also clear IndexedDB
			if (this.isPermanent) {
				await this.engine.clearAudioBufferPersistent();
			}
		} else if (this.isBlock) {
			// Unload block from memory
			this.unloadBlock(this.blockId);

			// If permanent, also clear audio assets from IndexedDB
			if (this.isPermanent) {
				const blocks = Preload.blocks() as PreloadBlocks;
				const block = blocks[this.blockId];
				if (block) {
					for (const [category, assets] of Object.entries(block)) {
						if (this.isAudioCategory(category) && Array.isArray(assets)) {
							for (const assetName of assets) {
								await this.unloadPersistent(category, assetName);
							}
						}
					}
				}
			}
		} else if (this.isCategoryOnly) {
			// Unload entire category from memory
			this.unloadCategoryAssets(this.category);

			if (this.isPermanent) {
				await this.unloadPersistent(this.category);
			}
		} else if (this.category === 'characters') {
			this.unloadCharacter(this.characterId, this.assetName || undefined);
		} else if (Preload.hasLoader(this.category)) {
			// Unload single asset from memory
			this.unloadAsset(this.category, this.assetName);

			if (this.isPermanent) {
				await this.unloadPersistent(this.category, this.assetName);
			}
		} else {
			console.warn(`Unload: No loader registered for category "${this.category}"`);
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
		return { advance: true };
	}

	override async revert(): Promise<void> {
    // TODO: Should we re-load the asset automatically?
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default Unload;


