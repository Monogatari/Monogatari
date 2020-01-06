import { Action } from './../lib/Action';

export class Clear extends Action {

	static matchString ([ action ]) {
		return action === 'clear';
	}

	apply () {
		this.engine.action ('Dialog').reset ({ keepNVL: true });
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		return Promise.reject ('Clear is not reversible.');
	}
}

Clear.id = 'Clear';

export default Clear;