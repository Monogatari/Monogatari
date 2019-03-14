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
		Monogatari.action ('Particles').stop ();
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve ({ advance: true });
	}

	revert () {
		if (Monogatari.history ('particle').length > 0) {
			const last = Monogatari.history ('particle').pop ();
			return Monogatari.run (last, false);
		}
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

HideParticles.id = 'Hide::Particles';

Monogatari.registerAction (HideParticles);