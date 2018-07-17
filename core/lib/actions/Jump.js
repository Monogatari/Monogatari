import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Jump extends Action {

	static setup () {
		Monogatari.history ('label');
		return Promise.resolve ();
	}

	static bind () {
		$_('[data-action="jump"]').click (function () {
			Monogatari.run (`jump ${$_(this).data('jump')}`);
		});
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'jump';
	}

	constructor ([ action, label ]) {
		super ();
		this.label = label;
	}

	willApply () {
		if (typeof Monogatari.script (this.label) !== 'undefined') {
			Monogatari.stopAmbient ();
			$_('section').hide ();
			$_('#game').show ();
			return Promise.resolve ();
		}
		return Promise.reject ();
	}

	apply () {
		Monogatari.state ({
			step: 0,
			label: this.label
		});
		Monogatari.action ('Dialog').reset ();
		Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

Jump.id = 'Jump';

Monogatari.registerAction (Jump);