import { Action } from '../Action';
import { Monogatari } from '../monogatari';

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
			const unlocked = [...Monogatari.component ('GALLERY').state ('unlocked'), this.asset];
			Gallery.state ({
				unlocked
			});
		} else if (this.mode === 'lock') {
			const unlocked = Monogatari.component ('GALLERY').state ('unlocked').filter ((item) => item !== this.asset);
			Gallery.state ({
				unlocked
			});
		}
		return Promise.resolve ();
	}

	revert () {
		if (this.mode === 'lock') {
			const unlocked = [...Monogatari.component ('GALLERY').state ('unlocked'), this.asset];
			Gallery.state ({
				unlocked
			});
		} else if (this.mode === 'unlock') {
			const unlocked = Monogatari.component ('GALLERY').state ('unlocked').filter ((item) => item !== this.asset);
			Gallery.state ({
				unlocked
			});
		}
		return Promise.resolve ();
	}
}

Gallery.id = 'Gallery';

Monogatari.registerAction (Gallery);