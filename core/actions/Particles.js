import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';

/* global particlesJS, pJSDom */

export class Particles extends Action {

	static stop () {
		try {
			if (typeof pJSDom === 'object') {
				if (pJSDom.length > 0) {
					for (let i = 0; i < pJSDom.length; i++) {
						if (typeof pJSDom[i].pJS !== 'undefined') {
							// Cancel all the animation frame requests to prevent
							// memory from being used even then the element
							// has been destroyed.
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
		Monogatari.element ().find ('#particles-js').html ('');
	}


	static setup () {
		Monogatari.history ('particle');
		Monogatari.state ({
			particles: ''
		});
		return Promise.resolve ();
	}

	static reset () {
		Monogatari.state ({
			particles: ''
		});
		return Promise.resolve ();
	}

	static onLoad () {
		const { particles } = Monogatari.state ();
		if (particles !== '') {
			Monogatari.run (particles, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			Monogatari.history ('particle').pop ();
		}
		return Promise.resolve ();
	}

	static matchString ([ show, type ]) {
		return show === 'show' && type === 'particles';
	}

	static particles (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Particles._configuration.particles[object];
			} else {
				Particles._configuration.particles = Object.assign ({}, Particles._configuration.particles, object);
			}
		} else {
			return Particles._configuration.particles;
		}
	}

	constructor ([ show, type, name ]) {
		super ();
		if (typeof Particles.particles (name) !== 'undefined') {
			this.particles = Particles.particles (name);
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

	apply () {
		particlesJS (this.particles);
		return Promise.resolve ();
	}

	didApply () {
		Monogatari.history ('particle').push (this._statement);
		Monogatari.state ({
			particles: this._statement
		});
		return Promise.resolve ({ advance: true });
	}

	revert () {
		Particles.stop ();
		return Promise.resolve ();
	}

	didRevert () {
		Monogatari.history ('particle').pop ();
		return Promise.resolve ({ advance: true, step: true });
	}
}

Particles.id = 'Particles';
Particles._configuration = {
	particles: {}
};

Monogatari.registerAction (Particles);