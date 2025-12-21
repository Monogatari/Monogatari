import Action from './../lib/Action';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class HideVideo extends Action {

	static override id = 'Hide::Video';

	static override matchString([hide, type]: string[]): boolean {
		return hide === 'hide' && type === 'video';
	}

	name: string;
	classes: string[];

	constructor([hide, type, name, separator, ...classes]: string[]) {
		super();
		this.name = name;
		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
	}

	override async apply(): Promise<void> {
		const element = this.engine.element().find(`[data-video="${this.name}"]`);
		if (this.classes.length > 0) {
			element.addClass('animated');
			for (const newClass of this.classes) {
				if (newClass) {
					element.addClass(newClass);
				}
			}

			element.data('visibility', 'invisible');
			element.on('animationend', (e: any) => {
				if (e.target.dataset.visibility === 'invisible') {
					// Remove only if the animation ends while the element is not visible
					e.target.remove();
				}
			});
		} else {
			this.engine.element().find(`[data-video="${this.name}"]`).remove();
		}
	}

	override async didApply(): Promise<ActionApplyResult> {
		for (let i = this.engine.state('videos').length - 1; i >= 0; i--) {
			const last = this.engine.state('videos')[i];
			const [show, video, name, mode] = last.split(' ');
			if (name === this.name) {
				this.engine.state('videos').splice(i, 1);
				break;
			}
		}
		return { advance: true };
	}

	override async revert(): Promise<void> {
		for (let i = this.engine.history('video').length - 1; i >= 0; i--) {
			const last = this.engine.history('video')[i];
			const [show, video, name, mode] = last.split(' ');
			if (name === this.name) {
				this.engine.history('video').splice(i, 1);
				await this.engine.run(last, false);
				return;
			}
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		return { advance: true, step: true };
	}
}

export default HideVideo;