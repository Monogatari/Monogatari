import Action from './../lib/Action';
import { Util } from '@aegis-framework/artemis';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

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
		for (let i = this.engine.state('canvas').length - 1; i >= 0; i--) {
			const last = this.engine.state('canvas')[i];
			const [show, canvas, name, mode] = last.split(' ');
			if (name === this.name) {
				this.engine.state('canvas').splice(i, 1);
				break;
			}
		}
		return { advance: true };
	}

	override async revert(): Promise<void> {
		const canvasHistory = this.engine.history('canvas') as string[];
		for (let i = canvasHistory.length - 1; i >= 0; i--) {
			const last = canvasHistory[i];
			const [, , name] = last.split(' ');
			if (name === this.name) {
				canvasHistory.splice(i, 1);
				await this.engine.run(last, false);
				return;

			}
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default HideCanvas;