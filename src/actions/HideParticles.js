import { Action } from './../lib/Action';

export class HideParticles extends Action {

	static matchString ([ hide, type ]) {
		return hide === 'hide' && type === 'particles';
	}

	constructor ([ hide, type ]) {
		super ();
	}

	apply () {
		this.engine.action ('Particles').stop ();
		return Promise.resolve ();
	}

	didApply () {
		this.engine.state ({
			particles: ''
		});
		return Promise.resolve ({ advance: true });
	}

	revert () {
		if (this.engine.history ('particle').length > 0) {
			const last = this.engine.history ('particle')[this.engine.history ('particle').length - 1];

			const action = this.engine.prepareAction (last, { cycle: 'Application' });
			return action.willApply ().then (() => {
				return action.apply ().then (() => {
					return action.didApply ({ updateHistory: false, updateState: true });
				});
			});
		} else {
			return Promise.resolve ();
		}
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

HideParticles.id = 'Hide::Particles';

export default HideParticles;