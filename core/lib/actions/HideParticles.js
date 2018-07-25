import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

/* global pJSDom */

export class HideParticles extends Action {

	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'particles';
	}

	constructor ([ hide, type ]) {
		super ();
	}

	apply () {
		try {
			if (typeof pJSDom === 'object') {
				if (pJSDom.length > 0) {
					for (let i = 0; i < pJSDom.length; i++) {
						if (typeof pJSDom[i].pJS !== 'undefined') {
							cancelAnimationFrame (pJSDom[i].pJS.fn.drawAnimFrame);
							pJSDom.shift ();
						}
					}
				}
			}
		} catch (e) {
			console.error ('An error ocurred while trying to stop particle system.');
		}

		Monogatari.state ({
			particles: ''
		});
		$_(`${Monogatari.selector} #particles-js`).html ('');
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	revert () {
		if (Monogatari.history ('particle').length > 0) {
			const last = Monogatari.history ('particle').pop ();
			return Monogatari.run (last, false);
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

HideParticles.id = 'Hide::Particles';

Monogatari.registerAction (HideParticles);