import Action from './../lib/Action';
import { $_ } from '@aegis-framework/artemis';
import { ActionApplyResult, ActionRevertResult, ActionInstance, CharacterLayerHistoryItem } from '../lib/types';

export class ShowCharacterLayer extends Action {

	static override id = 'Show::Character::Layer';
	static override _experimental = true;
	static override loadingOrder = 1;

	static override async setup(): Promise<void> {
		// The character history saves what characters have been displayed
		this.engine.history('characterLayer');

		// The characters state variable holds what characters are being shown
		// right now
		this.engine.state({
			characterLayers: []
		});
	}

	static override async reset(): Promise<void> {
		this.engine.state({
			characterLayers: []
		});
	}

	static override async onLoad(): Promise<void> {
		const characterLayers = this.engine.state('characterLayers') as string[];
		const promises: Promise<void>[] = [];

		for (const item of characterLayers) {
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
		return show === 'show' && type === 'character' && identifier.indexOf(':') > -1;
	}

	asset: string;
	layer: string;
	state: string | undefined;
	sprite: string;
	character: any;
	image: any;
	classes: string[];

	constructor([show, type, asset, sprite, ...classes]: string[]) {
		super();
		const [character, layer] = asset.split(':');
		this.asset = character;
		this.layer = layer;

		this.state = this.engine.state('characterLayers').find((statement: string) => {
			const [show, _character, asset, name] = statement.split(' ');
			const [_identifier, _layer] = asset.split(':');
			return _identifier === character && _layer == layer;
		});

		if (typeof this.engine.character(character) !== 'undefined') {
			// show [character] [expression] at [position] with [animation] [infinite]
			this.sprite = sprite;

			this.character = this.engine.character(character);
			this.image = this.character.layer_assets[layer][sprite];

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
		// show [character:layer] with [...animation] [infinite]
		//   0         1           2       3          4

		// show [character:layer]
		//   0         1

		let directory = this.character.directory;
		if (typeof directory == 'undefined') {
			directory = '';
		} else {
			directory += '/';
		}

		let oneSpriteOnly = true;


		const parent = this.engine.element().find(`[data-character="${this.asset}"]:not([data-visibility="invisible"])`);

		const sprite = parent.find(`[data-layer="${this.layer}"]:not([data-visibility="invisible"])`);

		const spriteEl = sprite.get(0);
		if ((sprite.isVisible() || (this.engine.global('_restoring_state') && sprite.exists())) && spriteEl) {
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

		if (oneSpriteOnly && (sprite.isVisible() || (this.engine.global('_restoring_state') && sprite.exists()))) {
			sprite.attribute('src', `${imgSrc}${this.image}`);
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
		} else {
			const image = document.createElement('img');
			$_(image).attribute('src', `${imgSrc}${this.image}`);
			$_(image).addClass('animated');
			$_(image).data('layer', this.layer);
			$_(image).data('sprite', this.sprite);
			$_(image).style({ zIndex: this.character.layers.indexOf(this.layer) });

			for (const className of this.classes) {
				if (className) {
					image.classList.add(className);
				}
			}

			const durationPosition = this.classes.indexOf('duration');
			if (durationPosition > -1) {
				$_(image).style('animation-duration', this.classes[durationPosition + 1]);
			}

			parent.find('[data-content="wrapper"]').append(image);
		}

		// Update the state of the component
		const parentAsComponent = parent.get(0) as (HTMLElement & { state?: { layers?: Record<string, unknown> }; setState?: (state: Record<string, unknown>) => void }) | undefined;
		if (parentAsComponent?.state && parentAsComponent?.setState) {
			const stateLayers = parentAsComponent.state.layers || {};
			parentAsComponent.setState({
				layers: {
					...stateLayers,
					[this.layer]: {
						asset: this.sprite,
						classes: this.classes
					}
				}
			});
		}
	}

	override async didApply({ updateHistory = true, updateState = true } = {}): Promise<ActionApplyResult> {
		if (updateHistory === true) {
			const characterLayerHistory = this.engine.history('characterLayer') as CharacterLayerHistoryItem[];
			let previousHistory: CharacterLayerHistoryItem | undefined;
			for (let j = characterLayerHistory.length - 1; j >= 0; j--) {
				const historyItem = characterLayerHistory[j];
				if (historyItem.parent) {
					const [, , _asset] = historyItem.parent.split(' ');

					if (_asset === this.asset) {
						previousHistory = historyItem;
						break;
					}
				}
			}

			const parent = this.engine.state('characters').find((s: string) => {
				const [, , asset] = s.split(' ');
				return asset === this.asset;
			}) || null;

			if (typeof previousHistory !== 'undefined') {
				characterLayerHistory.push({
					parent,
					layers: [
						...previousHistory.layers.filter(({ statement }: { statement: string | null; previous: string | null }) => {
							if (statement !== null && parent !== null) {
								const [, , _asset] = parent.split(' ');
								const [_identifier, _layer] = _asset.split(':');
								return _identifier !== this.asset && _layer !== this.layer;
							}
							return false;
						}),
						{
							statement: this._statement as string,
							previous: this.state || null
						}
					]
				});
			} else {
				characterLayerHistory.push({
					parent,
					layers: [
						{
							statement: this._statement as string,
							previous: this.state || null
						}
					]
				});
			}

		}

		if (updateState === true) {
			this.engine.state({
				characterLayers: [
					...this.engine.state('characterLayers').filter((item: any) => {
						if (typeof item === 'string') {
							const [, , asset] = item.split(' ');
							const [id, layer] = asset.split(':');
							return id !== this.asset || layer !== this.layer;
						}
						return false;
					}),
					this._statement as string
				]
			});
		}
		return { advance: true };
	}

	override async revert(): Promise<void> {
		const parent = this.engine.element().find(`[data-character="${this.asset}"]`);

		parent.find(`[data-layer="${this.layer}"]`).remove();


		// First, we remove the last instance of the character from the history since
		// that's the one being currently displayed and we want the one before that
		const characterLayerHistory = this.engine.history('characterLayer') as CharacterLayerHistoryItem[];
		for (let i = characterLayerHistory.length - 1; i >= 0; i--) {
			const { layers } = characterLayerHistory[i];

			const historyStatement = layers.find((s: { statement: string | null; previous: string | null }) => {
				const { previous, statement } = s;
				const statementStr = statement || previous;
				if (statementStr) {
					const [, , asset] = statementStr.split(' ');
					const [id, layer] = asset.split(':');

					return id === this.asset && layer === this.layer;
				}
				return false;
			});

			if (typeof historyStatement === 'object' && historyStatement !== null) {

				const { statement, previous } = historyStatement;
				const statementStr = statement || previous;
				if (statementStr) {
					const [, , asset] = statementStr.split(' ');
					const [id, layer] = asset.split(':');
					if (id === this.asset && layer === this.layer) {
						characterLayerHistory.splice(i, 1);

						if (typeof previous !== 'undefined' && previous !== null) {
							const action = this.engine.prepareAction(previous, { cycle: 'Apply' }) as ActionInstance | null;
							if (action !== null) {
								await action.apply();
								await action.didApply({ updateHistory: false, updateState: true });
							}
							return;
						}


						break;
					}
				}
			}
		}

		// If the script didn't return on the for cycle above, it means either the
		// history didn't have any items left or, the character was not found.
		// In that case, we simply remove the character from the state.
		this.engine.state({
			characterLayers: [
				...this.engine.state('characterLayers').filter((item: any) => {
					if (typeof item === 'string') {
						const [show, character, asset, sprite] = item.split(' ');
						const [id, layer] = asset.split(':');
						return id !== this.asset || layer !== this.layer;
					}
					return false;
				}),
			],
		});
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default ShowCharacterLayer;
