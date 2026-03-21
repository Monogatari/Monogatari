import Action from './../lib/Action';
import { Util } from '@aegis-framework/artemis';
import { FancyError } from './../lib/FancyError';
import { ActionApplyResult, ActionRevertResult, ActionInstance } from '../lib/types';

export class HideCanvas extends Action {

	static override id = 'Hide::Canvas';

	static override matchString([hide, type]: string[]): boolean {
		return hide === 'hide' && type === 'canvas';
	}

	name: string;
	object: any;
	element: any;
	classes: string[];

	constructor([hide, canvas, name, separator, ...classes]: string[]) {
		super();

		this.name = name;
		const canvasAction = this.engine.action('Canvas') as { objects?: (name: string) => Record<string, unknown> } | undefined;
		this.object = canvasAction?.objects?.(name) ?? null;

		this.element = document.querySelector(`[data-component="canvas-container"][canvas="${this.name}"]`);

		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
	}

	override async willApply(): Promise<void> {
		if (this.element === null) {
			FancyError.show('action:hide_canvas:not_shown', {
				name: this.name,
				statement: `<code class='language=javascript'>"${this._statement}"</code>`,
				label: this.engine.state('label'),
				step: this.engine.state('step')
			});
			throw new Error('Attempted to hide a canvas that was not being shown.');
		}
	}

	override async apply(): Promise<void> {
		const { object } = this.element.props;

		await Util.callAsync(object.stop, this.engine, this.element.layers, object.props, object.state, this.element);

		if (this.classes.length > 0) {
			const el = this.element.element();
			el.addClass('animated');
			for (const newClass of this.classes) {
				if (newClass) {
					el.addClass(newClass);
				}
			}

			el.data('visibility', 'invisible');

			// Remove item after a while to prevent it from showing randomly
			// when coming from a menu to the game because of its animation
			el.on('animationend', (e: Event) => {
				if ((e.target as HTMLElement).dataset.visibility === 'invisible') {
					// Remove only if the animation ends while the element is not visible
					(e.target as HTMLElement).remove();
				}
			});
		} else {
			this.engine.element().find(`[data-component="canvas-container"][canvas="${this.name}"]`).remove();
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
		let found = false;
		this.engine.state({
			canvas: this.engine.state('canvas').filter((item: string) => {
				if (!found) {
					const [, , name] = item.split(' ');
					if (name === this.name) {
						found = true;
						return false;
					}
				}
				return true;
			})
		});
		return { advance: true };
	}

	override async revert(): Promise<void> {
		const canvasHistory = this.engine.history('canvas') as string[];
		for (let i = canvasHistory.length - 1; i >= 0; i--) {
			const last = canvasHistory[i];
			const [, , name] = last.split(' ');
			if (name === this.name) {
				const action = this.engine.prepareAction(last, { cycle: 'Application' }) as ActionInstance | null;
				if (action !== null) {
					await action.willApply();
					await action.apply();
					await action.didApply({ updateHistory: false, updateState: true });
				}
				return;
			}
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default HideCanvas;