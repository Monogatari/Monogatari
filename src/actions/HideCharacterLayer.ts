import Action from './../lib/Action';
import { FancyError } from './../lib/FancyError';
import { ActionApplyResult, ActionRevertResult, ActionInstance } from '../lib/types';


export class HideCharacterLayer extends Action {

	static override id = 'Hide::Character::Layer';
	static override _experimental = true;

	static override matchString([hide, type, identifier]: string[]): boolean {
		return hide === 'hide' && type === 'character' && identifier.indexOf(':') > -1;
	}

	asset: string;
	layer: string;
	parent: any;
	element: any;
	classes: string[];

	constructor([hide, type, asset, ...classes]: string[]) {
		super();
		const [character, layer] = asset.split(':');
		this.asset = character;
		this.layer = layer;

		if (typeof this.engine.character(this.asset) !== 'undefined') {
			this.parent = this.engine.element().find(`[data-character="${this.asset}"]`).last();
			this.element = this.parent.find(`[data-layer="${this.layer}"]`).last();
		} else {
			FancyError.show('action:hide_character_layer:character_not_found', {
				asset: this.asset,
				availableCharacters: Object.keys(this.engine.characters()),
				statement: `<code class='language=javascript'>"${this._statement}"</code>`,
				label: this.engine.state('label'),
				step: this.engine.state('step')
			});
		}

		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
		this.classes = this.classes.filter((c) => (c !== 'at' && c !== 'with'));
	}

	override async willApply(): Promise<void> {

		if (!this.element.exists()) {
			FancyError.show('action:hide_character_layer:layer_not_shown', {
				layer: this.layer,
				asset: this.asset,
				availableCharacters: Object.keys(this.engine.characters()),
				statement: `<code class='language=javascript'>"${this._statement}"</code>`,
				label: this.engine.state('label'),
				step: this.engine.state('step')
			});
			throw new Error('Attempted to hide a character that was not being shown.');
		}
	}


	override async apply(): Promise<void> {
		const oldClasses = [...this.element.get(0).classList];

		for (const oldClass of oldClasses) {
			this.element.removeClass(oldClass);
		}

		this.element.addClass('animated');

		// Check if there is any end-animation, here's what this matches:
		// 'end-fadeIn'.match (/end-([A-Za-z]+)/) => [ "end-fadeIn", "fadeIn" ]
		const endAnimation = oldClasses.find((c: string) => c.match(/end-([A-Za-z]+)/) !== null);

		if (typeof endAnimation !== 'undefined') {
			const [end, animation] = endAnimation.split('-');
			this.element.addClass(animation);
		}

		const durationPosition = this.classes.indexOf('duration');

		if (durationPosition > -1) {
			this.element.style('animation-duration', this.classes[durationPosition + 1]);
		} else {
			this.element.style('animation-duration', '');
		}

		if (this.classes.length > 0 || typeof endAnimation !== 'undefined') {
			for (const className of this.classes) {
				if (className) {
					this.element.addClass(className);
				}
			}
			this.element.data('visibility', 'invisible');

			this.element.on('animationend', (e: any) => {
				if (e.target.dataset.visibility === 'invisible') {
					// Remove only if the animation ends while the element is not visible
					e.target.remove();
				}
			});
		} else {
			this.element.remove();
		}

		const parentAsComponent = this.parent.get(0) as (HTMLElement & { state?: { layers?: Record<string, unknown> }; setState?: (state: Record<string, unknown>) => void }) | undefined;
		if (parentAsComponent?.state && parentAsComponent?.setState) {
			const stateLayers = parentAsComponent.state.layers || {};
			const { [this.layer]: _, ...remainingLayers } = stateLayers;
			parentAsComponent.setState({
				layers: remainingLayers
			});
		}
	}

	override async didApply({ updateHistory = true, updateState = true } = {}): Promise<ActionApplyResult> {
		const show = this.engine.state('characterLayers').filter((item: string) => {
			const [show, character, asset,] = item.split(' ');
			const [id, layer] = asset.split(':');
			return id !== this.asset || layer !== this.layer;
		});

		this.engine.state({ characterLayers: show });
		return { advance: true };
	}

	override async willRevert(): Promise<void> {
		if (this.engine.history('characterLayer').length <= 0) {
			return Promise.reject();
		}
	}

	override async revert(): Promise<void> {
		for (let i = this.engine.history('characterLayer').length - 1; i >= 0; i--) {
			const { parent, layers } = this.engine.history('characterLayer')[i];
			const historyStatement = layers.find((s: any) => {
				const { previous, statement } = s;
				const [show, character, asset, name] = (statement || previous).split(' ');
				const [id, layer] = asset.split(':');

				return id === this.asset && layer === this.layer;
			});

			if (typeof historyStatement === 'object' && historyStatement !== null) {
				const { statement, previous } = historyStatement as { statement: string | null; previous: string | null };
				const [, , asset] = ((statement || previous) ?? '').split(' ');
				const [id, layer] = asset?.split(':') ?? [];

				if (id === this.asset && layer === this.layer) {
						if (statement === null) {
						return;
					}
					const revertAction = this.engine.prepareAction(statement, { cycle: 'Application' }) as ActionInstance | null;
					if (revertAction !== null) {
						await revertAction.apply();
						await revertAction.didApply({ updateHistory: false, updateState: true });
					}
					return;
				}
			}
		}
		throw new Error('Failed to revert HideCharacterLayer');
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default HideCharacterLayer;
