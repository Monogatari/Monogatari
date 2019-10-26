import { Action } from './../lib/Action';

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

		this.engine.state ({
			particles: ''
		});
		this.engine.element ().find ('#particles-js').html ('');
	}


	static setup () {
		this.engine.history ('particle');
		this.engine.state ({
			particles: ''
		});
		return Promise.resolve ();
	}

	static reset () {
		this.engine.state ({
			particles: ''
		});
		return Promise.resolve ();
	}

	static onLoad () {
		const { particles } = this.engine.state ();
		if (particles !== '') {
			 const promise = this.engine.run (particles, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			this.engine.history ('particle').pop ();

			return promise;
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
		this.engine.history ('particle').push (this._statement);
		this.engine.state ({
			particles: this._statement
		});
		return Promise.resolve ({ advance: true });
	}

	revert () {
		Particles.stop ();
		return Promise.resolve ();
	}

	didRevert () {
		this.engine.history ('particle').pop ();
		return Promise.resolve ({ advance: true, step: true });
	}
}

Particles.id = 'Particles';
Particles._configuration = {
	particles: {}
};

export default Particles;