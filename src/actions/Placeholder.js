import { Action } from './../lib/Action';
import { Util } from '@aegis-framework/artemis';

export class Placeholder extends Action {

	static matchString ([ action ]) {
		return action === '$';
	}

	constructor ([action, name, ...args]) {
		super ();

		this.name = name;
		this.action = this.engine.$ (name);
		this.arguments = args;
	}

	willApply () {
		if (this.name.indexOf ('_') === 0) {
			return Util.callAsync (this.action, this.engine, ...this.arguments).then ((action) => {
				this.action = this.engine.prepareAction (action, { cycle: 'Application' });
				return this.action.willApply ();
			});
		}

		return Promise.resolve ();
	}

	apply () {
		if (this.name.indexOf ('_') === 0) {
			return this.action.apply ();
		} else {
			return this.engine.run (this.action);
		}
	}

	didApply () {
		if (this.name.indexOf ('_') === 0) {
			return this.action.didApply ();
		} else {
			return Promise.resolve ();
		}
	}

	willRevert () {
		if (this.name.indexOf ('_') === 0) {
			return Util.callAsync (this.action, this.engine, ...this.arguments).then ((action) => {
				this.action = this.engine.prepareAction (action, { cycle: 'Revert' });
				return this.action.willRevert ();
			});
		}

		return Promise.resolve ();
	}

	revert () {
		if (this.name.indexOf ('_') === 0) {
			return this.action.revert ();
		} else {
			return this.engine.revert (this.action);
		}
	}

	didRevert () {
		if (this.name.indexOf ('_') === 0) {
			return this.action.didRevert ();
		} else {
			return Promise.resolve ();
		}
	}
}

Placeholder.id = 'Placeholder';

export default Placeholder;
