import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Jump extends Action {

	static bind () {
		$_('[data-action="jump"]').click (function () {
			Monogatari.run (`jump ${$_(this).data('jump')}`);
		});
	}

	static matchString ([ action ]) {
		return action === 'jump';
	}

	constructor ([ action, label ]) {
		super ();
		this.label = label;
	}

	willApply () {
		if (typeof Monogatari.global ('game')[this.label] !== 'undefined') {
			Monogatari.stopAmbient ();
			$_('section').hide ();
			$_('#game').show ();
			return Promise.resolve ();
		}
		return Promise.reject ();
	}

	apply () {
		Monogatari.setting ('Step', 0);
		Monogatari.global ('label', Monogatari.global ('game')[this.label]);
		Monogatari.setting ('Label', this.label);
		Monogatari.whipeText ();
		Monogatari.run (Monogatari.global ('label')[Monogatari.setting ('Step')]);

		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

Jump.id = 'Jump';

Monogatari.registerAction (Jump);