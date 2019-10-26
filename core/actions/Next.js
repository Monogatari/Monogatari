import { Action } from './../lib/Action';

export class Next extends Action {

	static matchString ([ action ]) {
		return action === 'next';
	}

	apply () {
		this.engine.proceed ();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Next.id = 'Next';

export default Next;