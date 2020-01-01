import { Action } from './../lib/Action';
import { Util } from '@aegis-framework/artemis';

export class Placeholder extends Action {

	static matchString ([ action ]) {
		return action === '$';
	}

	constructor ([action, name]) {
		super ();

		this.name = name;
		this.action = this.engine.$ (name);
	}

	willApply () {
		if (this.name.indexOf ('_') === 0) {
			return Util.callAsync (this.action, this.engine).then ((action) => {
				this.action = action;
				return Promise.resolve ();
			});
		}

		return Promise.resolve ();
	}

	apply () {
		return this.engine.run (this.action);
	}

	revert () {
		return this.engine.revert (this.action);
	}
}

Placeholder.id = 'Placeholder';

export default Placeholder;
