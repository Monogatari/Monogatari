import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class HideVideo extends Action {


	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'video';
	}

	constructor ([ hide, type, name, separator, ...classes ]) {
		super ();
		this.name = name;
		this.classes = classes;
	}

	apply () {
		$_(`${Monogatari.selector} [data-video="${this.name}"]`).remove ();

		for (let i = Monogatari.state ('videos').length - 1; i >= 0; i--) {
			const last = Monogatari.state ('videos')[i];
			const [show, video, mode, name] = last.split (' ');
			if (name === this.name) {
				Monogatari.state ('videos').splice (i, 1);
				break;
			}
		}

		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	revert () {
		for (let i = Monogatari.history ('video').length - 1; i >= 0; i--) {
			const last = Monogatari.history ('video')[i];
			const [show, video, mode, name] = last.split (' ');
			if (name === this.name) {
				Monogatari.history ('video').splice (i, 1);
				return Monogatari.run (last, false);

			}
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

HideVideo.id = 'Hide::Video';

Monogatari.registerAction (HideVideo);