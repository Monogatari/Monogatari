import Action from './../lib/Action';
import { Text } from '@aegis-framework/artemis';
import { ActionApplyResult, ActionRevertResult, ActionInstance } from '../lib/types';

export class ShowBackground extends Action {

	static override id = 'Show::Background';

	static override async setup(): Promise<void> {
		this.engine.history('background');

		this.engine.state({
			background: ''
		});

		this.engine.global('_scene_history_cleared_by_background', false);
	}

	static override async onLoad(): Promise<void> {
		const background = this.engine.state('background');
		if (typeof background === 'string' && background !== '') {
			const action = this.engine.prepareAction(background, { cycle: 'Application' }) as ActionInstance | null;
			if (action !== null) {
				await action.willApply();
				await action.apply();
				await action.didApply({ updateHistory: false, updateState: false });
			}
		}
	}

	static override async reset(): Promise<void> {
		const background = this.engine.element().find('[data-ui="background"]');

		background.style('background-image', 'initial');
		background.style('background-color', 'initial');

		this.engine.state({
			background: ''
		});
	}

	static override matchString([show, type]: string[]): boolean {
		return show === 'show' && type === 'background';
	}

	background: string;
	property: string;
	value: string;
	classes: string[];

	constructor([show, type, background, ...classes]: string[]) {
		super();
		this.background = background;
		this.property = 'background-image';
		if (typeof this.engine.asset('scenes', background) !== 'undefined') {
			this.value = `url(${this.engine.setting('AssetsPath').root}/${this.engine.setting('AssetsPath').scenes}/${this.engine.asset('scenes', background)})`;
		} else {
			const rest = [background, ...classes].join(' ');
			if (classes.indexOf('with') > -1) {
				this.value = Text.prefix('with', rest);
			} else {
				this.value = rest;
			}

			const isColorProperty = ['#', 'rgb', 'hsl'].findIndex((color) => {
				return this.value.indexOf(color) === 0;
			}) > -1;

			const isNamed = this.value.indexOf(' ') > -1 ? false : new RegExp(/\w+/).test(this.value) && !(new RegExp(/(url|gradient)\(/).test(this.value));

			if (isColorProperty === true || isNamed === true) {
				this.property = 'background-color';
			}
		}

		this.classes = ['animated', ...classes];
	}

	override async willApply(): Promise<void> {
		const background = this.engine.element().find('[data-ui="background"]');

		background.removeClass();
		// Force reflow to restart CSS animations
		const el = background.get(0);
		if (el) {
			void (el as any).offsetWidth;
		}
	}

	override async apply(): Promise<void> {
		const background = this.engine.element().find('[data-ui="background"]');

		this.engine.element().find('[data-ui="background"]').style('background-image', 'initial');
		this.engine.element().find('[data-ui="background"]').style('background-color', 'initial');
		this.engine.element().find('[data-ui="background"]').style('animation-duration', '');

		this.engine.element().find('[data-ui="background"]').style(this.property, this.value);

		const durationPosition = this.classes.indexOf('duration');

		if (durationPosition > -1) {
			background.style('animation-duration', this.classes[durationPosition + 1]);
		}

		for (const newClass of this.classes) {
			background.addClass(newClass);
		}
	}

	override async didApply({ updateHistory = true, updateState = true } = {}): Promise<ActionApplyResult> {
		if (updateState === true) {
			this.engine.state({
				background: this._statement as string
			});
		}

		if (updateHistory === true) {
			(this.engine.history('background') as string[]).push(this._statement as string);
		}

		return { advance: true };
	}

	override async willRevert(): Promise<void> {
		this.engine.element().find('[data-ui="background"]').removeClass();
	}

	override async revert(): Promise<void> {
		let history = this.engine.history('background') as string[];

		history.pop();

		if (history.length === 0) {
			history = this.engine.history('scene') as string[];
			history.pop();
			this.engine.global('_scene_history_cleared_by_background', true);
		}

		if (history.length > 0) {
			const background = this.engine.element().find('[data-ui="background"]');
			const last = history[history.length - 1].replace('show scene', 'show background');
			const action = this.engine.prepareAction(last, { cycle: 'Application' }) as (ActionInstance & { property?: string; value?: string; classes?: string[] }) | null;

			background.style('background-image', 'initial');
			background.style('background-color', 'initial');
			if (action !== null && action.property && action.value) {
				background.style(action.property, action.value);
			}

			// Use the previous background's classes, not the current one being reverted
			const classesToApply = action?.classes ?? [];
			for (const newClass of classesToApply) {
				background.addClass(newClass);
			}

			this.engine.state({
				background: last
			});
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default ShowBackground;