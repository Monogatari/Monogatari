import { Action } from '../lib/Action';
import { tsParticles } from 'tsparticles';

export class Particles extends Action {

	static stop () {
		try {
			const particles = tsParticles.domItem(0);
			particles.stop ();
			this.engine.element ().find ('#tsparticles').html ('');
		} catch (e) {
			console.error ('An error ocurred while trying to stop particle system.');
		}
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
		this.stop ();
		return Promise.resolve ();
	}

	static onLoad () {
		const { particles } = this.engine.state ();
		if (particles !== '') {
			const action = this.engine.prepareAction (particles, { cycle: 'Application' });
			const promise = action.willApply ().then (() => {
				return action.apply ().then (() => {
					return action.didApply ({ updateHistory: false, updateState: false });
				});
			});
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
			return Promise.reject ('Particle system object does not exist.');
		}
	}

	apply () {
		return tsParticles.load ('tsparticles', this.particles);
	}

	didApply (args = { updateHistory: true, updateState: true }) {
		const { updateHistory, updateState } = args;

		if (updateHistory === true) {
			this.engine.history ('particle').push (this._statement);
		}

		if (updateState === true) {
			this.engine.state ({
				particles: this._statement
			});
		}
		return Promise.resolve ({ advance: true });
	}

	revert () {
		Particles.stop ();
		return Promise.resolve ();
	}

	didRevert () {
		this.engine.history ('particle').pop ();
		this.engine.state ({
			particles: ''
		});
		return Promise.resolve ({ advance: true, step: true });
	}
}

Particles.id = 'Particles';
Particles._configuration = {
	particles: {}
};

export default Particles;