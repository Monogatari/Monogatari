import { Action } from './../lib/Action';

export class HideVideo extends Action {


	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'video';
	}

	constructor ([ hide, type, name, separator, ...classes ]) {
		super ();
		this.name = name;
		if (typeof classes !== 'undefined') {
			this.classes = classes;
		} else {
			this.classes = [];
		}
	}

	apply () {
		const element = this.engine.element ().find (`[data-video="${this.name}"]`);
		if (this.classes.length > 0) {
			element.addClass ('animated');
			for (const newClass of this.classes) {
				if (newClass) {
					element.addClass (newClass);
				}
			}

			element.data ('visibility', 'invisible');
			element.on ('animationend', (e) => {
				if (e.target.dataset.visibility === 'invisible') {
					// Remove only if the animation ends while the element is not visible
					e.target.remove ();
				}
			});
		} else {
			this.engine.element ().find (`[data-video="${this.name}"]`).remove ();
		}
		return Promise.resolve ();
	}

	didApply () {
		for (let i = this.engine.state ('videos').length - 1; i >= 0; i--) {
			const last = this.engine.state ('videos')[i];
			const [show, video, name, mode] = last.split (' ');
			if (name === this.name) {
				this.engine.state ('videos').splice (i, 1);
				break;
			}
		}
		return Promise.resolve ({ advance: true });
	}

	revert () {
		for (let i = this.engine.history ('video').length - 1; i >= 0; i--) {
			const last = this.engine.history ('video')[i];
			const [show, video, name, mode] = last.split (' ');
			if (name === this.name) {
				this.engine.history ('video').splice (i, 1);
				return this.engine.run (last, false);

			}
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

HideVideo.id = 'Hide::Video';

export default HideVideo;