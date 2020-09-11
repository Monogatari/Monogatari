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
		let promise = Promise.resolve (this.action);

		if (this.name.indexOf ('_') === 0) {
			promise = Util.callAsync (this.action, this.engine, ...this.arguments);
		}

		return promise.then ((action) => {
			this.action = this.engine.prepareAction (action, { cycle: this._cycle });
			return this.action.willApply ();
		});
	}

	apply () {
		return this.action.apply ();
	}

	didApply () {
		return this.action.didApply ();
	}

	willRevert () {
		let promise = Promise.resolve (this.action);

		if (this.name.indexOf ('_') === 0) {
			promise = Util.callAsync (this.action, this.engine, ...this.arguments);
		}

		return promise.then ((action) => {
			this.action = this.engine.prepareAction (action, { cycle: this._cycle });
			return this.action.willRevert ();
		});
	}

	revert () {
		return this.action.revert ();
	}

	didRevert () {
		return this.action.didRevert ();
	}
}

Placeholder.id = 'Placeholder';

export default Placeholder;
