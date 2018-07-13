import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

/* global particlesJS, pJSDom */

export class Particles extends Action {

	static matchString ([ action ]) {
		return action === 'particles';
	}

	static stop () {
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

		Monogatari.setting ('Particles', '');
		$_('#particles-js').html ('');
	}

	constructor ([ action, name ]) {
		super ();
		if (typeof Particles.settings.particles[name] !== 'undefined') {
			this.particles = Particles.settings.particles[name];
			this.name = name;
		} else {
			console.error (`The Particles ${name} could not be shown because it doesn't exist in the particles object.`);
		}
	}

	willApply () {
		if (typeof this.particles !== 'undefined') {
			return Promise.resolve ();
		} else {
			return Promise.reject ();
		}
	}

	apply (advance) {
		particlesJS (this.particles);

		Monogatari.setting ('ParticlesHistory').push (this.name);
		Monogatari.setting ('Particles', this.name);

		if (advance) {
			Monogatari.next ();
		}

		return Promise.resolve ();
	}

	revert () {
		Particles.stop ();
		return Promise.resolve ();
	}
}

Particles.id = 'Particles';
Particles.settings = {
	particles: {}
};

Monogatari.registerAction (Particles);