import { Action } from './../lib/Action';

export class Clear extends Action {

	static setup () {
		this.engine.history ('clear');
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'clear';
	}

	apply () {
		this.engine.action ('Dialog').reset ({ keepNVL: true, saveNVL: true });
		return Promise.resolve ();
	}

	didApply () {
		const textBox = this.engine.element ().find ('[data-component="text-box"]').get (0);
		this.engine.history ('clear').push (textBox.props.mode);
		return Promise.resolve ({ advance: true });
	}

	willRevert () {
		if (this.engine.history ('clear').length > 0) {
			return Promise.resolve ();
		}
		return Promise.reject ('No items left on the clear history to revert it.');
	}

	revert () {
		const last = this.engine.history ('clear').pop ();

		if (last === 'nvl') {
			this.engine.global ('_should_restore_nvl', true);
		}

		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve ({ advance: true, step: true });
	}
}

Clear.id = 'Clear';

export default Clear;