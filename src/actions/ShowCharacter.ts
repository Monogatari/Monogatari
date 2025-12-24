import Action from './../lib/Action';
import { $_ } from '@aegis-framework/artemis';
import { ActionApplyResult, ActionRevertResult, ActionInstance, CharacterHistoryItem } from '../lib/types';

export class ShowCharacter extends Action {

	static override id = 'Show::Character';

	static override async setup(): Promise<void> {
		// The character history saves what characters have been displayed
		this.engine.history('character');

		// The characters state variable holds what characters are being shown
		// right now
		this.engine.state({
			characters: []
		});
	}

	static override async reset(): Promise<void> {
		this.engine.element().find('[data-screen="game"] [data-character]').remove();

		this.engine.state({
			characters: []
		});
	}

	static override async onLoad(): Promise<void> {
		const characters = this.engine.state('characters') as string[];
		const promises: Promise<void>[] = [];

		for (const item of characters) {
			const action = this.engine.prepareAction(item, { cycle: 'Application' }) as ActionInstance | null;
			if (action !== null) {
				const promise = (async () => {
					await action.willApply();
					await action.apply();
					await action.didApply({ updateHistory: false, updateState: false });
				})();

				promises.push(promise);
			}
		}

		if (promises.length > 0) {
			await Promise.all(promises);
		}
	}

	static override matchString([show, type, identifier]: string[]): boolean {
		return show === 'show' && type === 'character' && identifier.indexOf(':') === -1;
	}

	asset: string;
	state: string | undefined;
	sprite: string;
	character: any;
	image: any;
	classes: string[];

	constructor([show, type, asset, sprite, ...classes]: string[]) {
		super();
		this.asset = asset;

		this.state = this.engine.state('characters').find((statement: string) => {
			const [show, character, asset, name] = statement.split(' ');
			return asset === this.asset;
		});

		if (typeof this.engine.character(asset) !== 'undefined') {
			// show [character] [expression] at [position] with [animation] [infinite]
			this.sprite = sprite;

			this.character = this.engine.character(asset);
			this.image = this.character.sprites[this.sprite];

			if (typeof classes !== 'undefined') {
				this.classes = ['animated', ...classes.filter((item) => item !== 'at' && item !== 'with')];
			} else {
				this.classes = [];
			}

		} else {
			// TODO: Add Fancy Error when the specified character does not exist
			this.sprite = '';
			this.classes = [];
		}
	}

	override async apply(): Promise<void> {
		// show [character] [expression] at [position] with [animation] [infinite]
		//   0      1             2       3     4        5       6         7

		// show [character] [expression] with [animation] [infinite]
		//   0      1             2       3       4         5

		// show [character] [expression]
		//   0      1             2

		let directory = this.character.directory;
		if (typeof directory == 'undefined') {
			directory = '';
		} else {
			directory += '/';
		}

		let oneSpriteOnly = true;

		const sprite = this.engine.element().find(`[data-character="${this.asset}"]:not([data-visibility="invisible"])`);

		const spriteEl = sprite.get(0);
		if (sprite.exists() && spriteEl) {
			const oldClasses = [...spriteEl.classList];

			// Check if there is any end-animation, here's what this matches:
			// 'end-fadeIn'.match (/end-([A-Za-z]+)/) => [ "end-fadeIn", "fadeIn" ]
			const endAnimation = oldClasses.find((c: string) => c.match(/end-([A-Za-z]+)/) !== null);

			if (typeof endAnimation !== 'undefined') {
				// If there was, get the animation-only part
				const [end, animation] = endAnimation.split('-');
				const watchAnimation = oldClasses[oldClasses.indexOf(endAnimation) - 1];
				sprite.removeClass(watchAnimation);
				sprite.addClass(animation);
				sprite.data('visibility', 'invisible');
				sprite.on('animationend', (e: any) => {
					e.target.remove();
				});

				oneSpriteOnly = false;
			}

			for (const oldClass of oldClasses) {
				if (this.classes.indexOf(oldClass) === -1) {
					sprite.removeClass(oldClass);
				}
			}
		}

		const imgSrc = `${this.engine.setting('AssetsPath').root}/${this.engine.setting('AssetsPath').characters}/${directory}`;
		const position = (this._statement as string).match(/at\s(\S*)/);

		if (oneSpriteOnly && sprite.exists()) {

			if (this.engine.setting('ExperimentalFeatures') === true) {
				// If its another layered sprite
				if (sprite.matches('character-sprite') && typeof this.image === 'object') {
					const image = sprite.get(0) as (HTMLElement & { setState?: (state: { layers: Record<string, unknown> }) => void }) | undefined;
					const layers: Record<string, any> = {};

					for (const [layer, asset] of Object.entries(this.image)) {
						layers[layer] = {
							asset,
							classes: [],
						};
					}

					if (image?.setState) {
						image.setState({ layers });
					}
				} else if (sprite.matches('character-sprite')) {
					// If it's an image on a previously layered sprite
					const el = sprite.get(0) as (HTMLElement & { setProps?: (props: { src: string }) => void }) | undefined;
					if (el?.setProps) {
						el.setProps({ 'src': `${imgSrc}${this.image}` });
					}
				} else {
					// If it was just an image
					sprite.attribute('src', `${imgSrc}${this.image}`);
				}
			} else {
				sprite.attribute('src', `${imgSrc}${this.image}`);
			}

			sprite.data('sprite', this.sprite);

			for (const className of this.classes) {
				if (className) {
					sprite.addClass(className);
				}
			}

			const durationPosition = this.classes.indexOf('duration');
			if (durationPosition > -1) {
				sprite.style('animation-duration', this.classes[durationPosition + 1]);
			} else {
				sprite.style('animation-duration', '');
			}

			const transitionPosition = this.classes.indexOf('transition');

			if (transitionPosition > -1) {
				sprite.style('transition-duration', this.classes[transitionPosition + 1]);
			} else {
				sprite.style('transition-duration', '');
			}

			// Check if a position was provided. (show character y at left)
			if (position instanceof Array) {
				// If it was, we'll set that position to the character
				const [at, positionClass] = position;
				sprite.data('position', positionClass);
			} else {
				// If it wasn't, we'll check if the sprite already had one position set
				// const currentPosition = sprite.data ('position');
				// if (typeof currentPosition === 'string') {
				// 	// If it did, we'll add that position
				// 	if (currentPosition.trim () !== '') {
				// 		console.log (currentPosition);
				// 		sprite.addClass (currentPosition.trim ());
				// 	}
				// } else {
				// 	// If it didn't, we'll set the center position by default
				// 	sprite.addClass ('center');
				// 	sprite.data ('position', 'center');
				// }

				sprite.addClass('center');
				sprite.data('position', 'center');
			}

			sprite.data('sprite', this.sprite);
		} else {
			let image: HTMLElement | null = null;
			let imageReady = Promise.resolve();
			if (typeof this.image === 'string') {
				// Check if character sprite is cached
				const cacheKey = `characters/${this.asset}/${this.sprite}`;
				const cachedImage = this.engine.imageCache(cacheKey);
				
				if (cachedImage) {
					// Clone the cached image element
					image = cachedImage.cloneNode(true) as HTMLImageElement;
				} else {
					// Create new image element
					image = document.createElement('img');
					$_(image).attribute('src', `${imgSrc}${this.image}`);
				}
				$_(image).addClass('animated');
				$_(image).data('character', this.asset);
				$_(image).data('sprite', this.sprite);
			} else if (this.engine.setting('ExperimentalFeatures') === true) {
				image = document.createElement('character-sprite') as any;

				(image as any).setProps({
					character: this.character,
					directory: imgSrc,
				});


				const layers: Record<string, any> = {};

				const extras = this._extras || {};
				if (typeof extras.layerHistory !== 'undefined') {
					for (const { statement, previous } of (extras.layerHistory as any).layers) {
						if (previous !== null) {
							const [show, _character, asset, name, ...classes] = previous.split(' ');
							const [_identifier, _layer] = asset.split(':');
							layers[_layer] = {
								asset: name,
								classes: ['animated', ...classes.filter((item: string) => item !== 'at' && item !== 'with')],
							};
						}
					}
				} else {
					for (const [layer, asset] of Object.entries(this.image as Record<string, any>)) {
						layers[layer] = {
							asset,
							classes: [],
						};
					}
				}

				(image as any).setState({ layers });

				$_(image).addClass('animated');
				$_(image).data('character', this.asset);
				$_(image).data('sprite', this.sprite);

				imageReady = new Promise((resolve, reject) => {
					(image as any).ready(() => resolve());
				});
			}

			if (image) {
				for (const className of this.classes) {
					if (className) {
						image.classList.add(className);
					}
				}

				// Check if a position was provided. (show character y at left)
				if (position instanceof Array) {
					// If it was, we'll set that position to the character
					const [at, positionClass] = position;
					$_(image).data('position', positionClass);
				} else {
					// If it wasn't, we'll set the center position by default
					image.classList.add('center');
					$_(image).data('position', 'center');
				}

				const durationPosition = this.classes.indexOf('duration');
				if (durationPosition > -1) {
					$_(image).style('animation-duration', this.classes[durationPosition + 1]);
				}

				this.engine.element().find('[data-screen="game"] [data-content="visuals"]').append(image);
			}

			await imageReady;
		}
	}

	override async didApply({ updateHistory = true, updateState = true } = {}): Promise<ActionApplyResult> {
		const experimentalFeatures = this.engine.setting('ExperimentalFeatures') === true;
		if (updateHistory === true) {
			const characterHistory = this.engine.history('character') as CharacterHistoryItem[];
			characterHistory.push({
				statement: this._statement as string,
				previous: this.state || null
			});

			if (experimentalFeatures) {
				const characterLayerHistory = this.engine.history('characterLayer') as import('../lib/types').CharacterLayerHistoryItem[];
				if (typeof this.image === 'object') {
					const statements: { statement: string; previous: string | null }[] = [];
					for (const layer in this.image) {
						const previous = this.engine.state('characterLayers').find((statement: string) => {
							const [, , asset] = statement.split(' ');
							const [_identifier, _layer] = asset.split(':');
							return _identifier === this.asset && _layer == layer;
						}) as string | undefined;

						statements.push({
							statement: `show character ${this.asset}:${layer} ${(this.image as Record<string, string>)[layer]}`,
							previous: previous || null
						});
					}

					characterLayerHistory.push({
						parent: this._statement as string,
						layers: statements
					});
				} else {
					characterLayerHistory.push({
						parent: this._statement as string,
						layers: this.engine.state('characterLayers').map((s: any) => {
							return {
								statement: null,
								previous: s
							};
						})
					});
				}
			}
		}

		if (updateState === true) {
			this.engine.state({
				characters: [
					...this.engine.state('characters').filter((item: any) => {
						if (typeof item === 'string') {
							const [, , asset] = item.split(' ');
							return asset !== this.asset;
						}
						return false;
					}),
					this._statement as string
				]
			});

			if (experimentalFeatures) {

				if (typeof this.image === 'object') {
					const newState = [];
					const extras = this._extras || {};
					if (typeof extras.layerHistory !== 'undefined') {
						for (const { statement, previous } of (extras.layerHistory as any).layers) {
							if (previous !== null) {
								newState.push(previous);
							}
						}
					} else {
						for (const layer in this.image) {
							newState.push(`show character ${this.asset}:${layer} ${this.image[layer]}`);
						}
					}

					this.engine.state({
						characterLayers: [
							...this.engine.state('characterLayers').filter((item: any) => {
								if (typeof item === 'string') {
									const [show, character, asset, sprite] = item.split(' ');
									const [id] = asset.split(':');
									return id !== this.asset;
								}
								return false;
							}),
							...newState
						]
					});
				} else {
					this.engine.state({
						characterLayers: [
							...this.engine.state('characterLayers').filter((item: any) => {
								if (typeof item === 'string') {
									const [show, character, asset, sprite] = item.split(' ');
									const [id] = asset.split(':');
									return id !== this.asset;
								}
								return false;
							}),
						]
					});
				}
			}
		}
		return { advance: true };
	}

	override async revert(): Promise<void> {
		const experimentalFeatures = this.engine.setting('ExperimentalFeatures');
		this.engine.element().find(`[data-character="${this.asset}"]`).remove();

		// First, we get the last instance of the character from the history as
		// that's the one being currently displayed.
		for (let i = this.engine.history('character').length - 1; i >= 0; i--) {
			const { statement, previous } = this.engine.history('character')[i];
			const [show, character, asset, name] = statement.split(' ');
			if (asset === this.asset) {
				this.engine.history('character').splice(i, 1);

				if (experimentalFeatures) {
					const characterLayerHistory = this.engine.history('characterLayer') as import('../lib/types').CharacterLayerHistoryItem[];
					if (typeof previous !== 'undefined' && previous !== null) {
						let previousLayers;
						for (let j = characterLayerHistory.length - 1; j >= 0; j--) {
							const { parent } = characterLayerHistory[j];
							if (typeof parent === 'string') {
								const [, , _asset] = parent.split(' ');

								if (_asset === this.asset) {
									previousLayers = characterLayerHistory[j];
									break;
								}
							}
						}


						const action = this.engine.prepareAction(previous, { cycle: 'Application', extras: { layerHistory: previousLayers } }) as ActionInstance | null;
						if (action !== null) {
							await action.apply();
							await action.didApply({ updateHistory: false, updateState: true });
						}

						for (let j = characterLayerHistory.length - 1; j >= 0; j--) {
							const { parent } = characterLayerHistory[j];
							if (typeof parent === 'string') {
								const [, , _asset] = parent.split(' ');

								if (_asset === this.asset) {
									characterLayerHistory.splice(j, 1);
									break;
								}
							}
						}
						return;
					} else {
						if (typeof this.image === 'object') {
							for (let j = characterLayerHistory.length - 1; j >= 0; j--) {
								const { parent } = characterLayerHistory[j];
								if (typeof parent === 'string') {
									const [, , _asset] = parent.split(' ');

									if (_asset === this.asset) {
										characterLayerHistory.splice(j, 1);
										break;
									}
								}
							}
						}
					}
				} else {
					if (typeof previous !== 'undefined' && previous !== null) {
						const action = this.engine.prepareAction(previous, { cycle: 'Application' }) as ActionInstance | null;
						if (action !== null) {
							await action.apply();
							await action.didApply({ updateHistory: false, updateState: true });
						}
						return;
					}
				}
				break;
			}
		}

		// If the script didn't return on the for cycle above, it means either the
		// history didn't have any items left or, the character was not found.
		// In that case, we simply remove the character from the state.
		this.engine.state({
			characters: [
				...this.engine.state('characters').filter((item: any) => {
					if (typeof item === 'string') {
						const [show, character, asset, sprite] = item.split(' ');
						return asset !== this.asset;
					}
					return false;
				}),
			],
			characterLayers: [
				...this.engine.state('characterLayers').filter((item: any) => {
					if (typeof item === 'string') {
						const [show, character, asset, sprite] = item.split(' ');
						const [id, layer] = asset.split(':');
						return id !== this.asset;
					}
					return false;
				}),
			]
		});
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default ShowCharacter;
