import Action from './../lib/Action';
import Video from './Video';
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
		const videoElement = element.get(0) as HTMLVideoElement | undefined;

		if (this.classes.length > 0) {
			element.addClass('animated');
			for (const newClass of this.classes) {
				if (newClass) {
					element.addClass(newClass);
				}
			}

			element.data('visibility', 'invisible');
			element.on('animationend', (e: Event) => {
				const target = e.target as HTMLVideoElement;
				if (target.dataset?.visibility === 'invisible') {
					// Cleanup video before removal
					Video.cleanupVideoElement(target);
					target.remove();
				}
			});
		} else {
			// Cleanup video before removal
			if (videoElement) {
				Video.cleanupVideoElement(videoElement);
			}
			element.remove();
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