import { Action } from './../lib/Action';
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

			this.engine.component ('gallery-screen').instances ((instance) => {
				const unlocked = [...instance.state.unlocked, this.asset];
				instance.setState ({
					unlocked
				});
			});


		} else if (this.mode === 'lock') {
			this.engine.component ('gallery-screen').instances ((instance) => {
				const unlocked = instance.state.unlocked.filter ((item) => item !== this.asset);
				instance.setState ({
					unlocked
				});
			});
		}
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve ({ advance: true });
	}

	revert () {
		if (this.mode === 'lock') {
			this.mode = 'unlock';
			return this.apply ();
		} else if (this.mode === 'unlock') {
			this.mode = 'lock';
			return this.apply ();
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Gallery.id = 'Gallery';

Monogatari.registerAction (Gallery, true);