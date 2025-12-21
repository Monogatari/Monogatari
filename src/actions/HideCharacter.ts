import Action from './../lib/Action';
import { FancyError } from './../lib/FancyError';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class HideCharacter extends Action {

	static override id = 'Hide::Character';

	static override matchString([hide, type, identifier]: string[]): boolean {
		return hide === 'hide' && type === 'character' && identifier.indexOf(':') === -1;
	}

	asset: string;
	element: any;
	classes: string[];

	constructor([hide, type, asset, ...classes]: string[]) {
		super();
		this.asset = asset;

		if (typeof this.engine.character(this.asset) !== 'undefined') {
			this.element = this.engine.element().find(`[data-character="${this.asset}"]`).last();
		} else {
			FancyError.show('action:hide_character:character_not_found', {
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
			FancyError.show('action:hide_character:not_shown', {
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
		const currentPosition = this.element.data('position');
		const position = (this._statement as string).match(/at\s(\S*)/);

		const oldClasses = [...this.element.get(0).classList];

		for (const oldClass of oldClasses) {
			if (oldClass !== currentPosition || position instanceof Array) {
				this.element.removeClass(oldClass);
			}
		}

		if (position instanceof Array) {
			// If it was, we'll set that position to the character
			const [at, positionClass] = position;
			this.element.data('position', positionClass);
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
	}

	override async didApply(): Promise<ActionApplyResult> {
		const characters = this.engine.state('characters').filter((item: string) => {
			const [show, character, asset,] = item.split(' ');
			return asset !== this.asset;
		});

		const experimentalFeatures = this.engine.setting('ExperimentalFeatures');

		if (experimentalFeatures) {
			const characterLayers = this.engine.state('characterLayers').filter((item: string) => {
				const [show, character, asset,] = item.split(' ');
				const [id, layer] = asset.split(':');
				return id !== this.asset;
			});

			this.engine.state({ characters, characterLayers });
		} else {
			this.engine.state({ characters });
		}

		return { advance: true };
	}

	override async willRevert(): Promise<void> {
		if (this.engine.history('character').length <= 0) {
			return Promise.reject();
		}
	}

	override async revert(): Promise<void> {
		const history = this.engine.history('character') as { statement: string; previous: string | null }[];
		for (let i = history.length - 1; i >= 0; i--) {
			const { statement } = history[i];
			const [, , asset] = statement.split(' ');

			if (asset === this.asset) {
				const action = this.engine.prepareAction(statement, { cycle: 'Application' }) as import('../lib/types').ActionInstance | null;
				if (action !== null) {
					await action.apply();
					await action.didApply({ updateHistory: false, updateState: true });
				}
				return;
			}
		}
		throw new Error('Failed to revert HideCharacter');
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default HideCharacter;
