import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Gallery extends Action {

	static matchString ([ action ]) {
		return action === 'gallery';
	}

	constructor ([ action, mode, asset ]) {
		super ();
		this.mode = mode;
		this.asset = asset;
	}

	apply () {
		if (this.mode === 'unlock') {
			const unlocked = [...Monogatari.component ('Gallery').state ('unlocked'), this.asset];
			Gallery.state ({
				unlocked
			});
		} else if (this.mode === 'lock') {
			const unlocked = Monogatari.component ('Gallery').state ('unlocked').filter ((item) => item !== this.asset);
			Gallery.state ({
				unlocked
			});
		}
		return Promise.resolve ();
	}

	revert () {
		if (this.mode === 'lock') {
			const unlocked = [...Monogatari.component ('Gallery').state ('unlocked'), this.asset];
			Gallery.state ({
				unlocked
			});
		} else if (this.mode === 'unlock') {
			const unlocked = Monogatari.component ('Gallery').state ('unlocked').filter ((item) => item !== this.asset);
			Gallery.state ({
				unlocked
			});
		}
		return Promise.resolve ();
	}
}

Gallery.id = 'Gallery';

Monogatari.registerAction (Gallery);