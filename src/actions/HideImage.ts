import Action from './../lib/Action';
import { FancyError } from './../lib/FancyError';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class HideImage extends Action {

	static override id = 'Hide::Image';

	static override matchString([hide, type]: string[]): boolean {
		return hide === 'hide' && type === 'image';
	}

	asset: string;
	element: any;
	classes: string[];

	constructor([hide, type, asset, ...classes]: string[]) {
		super();
		this.asset = asset;

		this.element = this.engine.element().find(`[data-image="${this.asset}"]`);

		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
		this.classes = this.classes.filter((c) => (c !== 'at' && c !== 'with'));
	}

	override async willApply(): Promise<void> {
		if (!this.element.exists()) {
			FancyError.show('action:hide_image:not_shown', {
				asset: this.asset,
				statement: `<code class='language=javascript'>"${this._statement}"</code>`,
				label: this.engine.state('label'),
				step: this.engine.state('step')
			});
			throw new Error('Attempted to hide an image that was not being shown.');
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

		const durationPosition = this.classes.indexOf('duration');

		if (durationPosition > -1) {
			this.element.style('animation-duration', this.classes[durationPosition + 1]);
		} else {
			this.element.style('animation-duration', '');
		}

		if (this.classes.length > 0) {
			for (const newClass of this.classes) {
				this.element.addClass(newClass);
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
		const show = this.engine.state('images').filter((item: string) => {
			const [show, type, asset,] = item.split(' ');
			return asset !== this.asset;
		});

		this.engine.state({ images: show });
		return { advance: true };
	}

	override async willRevert(): Promise<void> {
		if (this.engine.history('image').length === 0) {
			return Promise.reject('Image history was empty.');
		}
	}

	override async revert(): Promise<void> {
		// return this.engine.run (this.engine.history ('image').pop (), false);
		const history = this.engine.history('image') as string[];
		for (let i = history.length - 1; i >= 0; i--) {
			const last = history[i];
			const [, , asset] = last.split(' ');
			if (asset === this.asset) {
				const action = this.engine.prepareAction(last, { cycle: 'Application' }) as import('../lib/types').ActionInstance | null;
				if (action !== null) {
					await action.willApply();
					await action.apply();
					await action.didApply({ updateHistory: false, updateState: true });
				}
				return;
			}
		}

		throw new Error('Could not find a previous state to revert to');
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default HideImage;