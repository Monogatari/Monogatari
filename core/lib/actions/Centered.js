import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';
import Typed from 'typed.js';

export class Centered extends Action {

	static matchString ([ action ]) {
		return action === 'centered';
	}

	static hide () {
		$_('[data-ui="centered"]').remove ();
		$_('[data-ui="text"]').show ();
	}

	constructor ([ action, ...dialog ]) {
		super ();
		this.dialog = dialog.join (' ');
		this.animate = Monogatari.setting ('TypeAnimation') && Monogatari.setting ('CenteredTypeAnimation');
	}

	apply () {
		$_('[data-ui="text"]').hide ();
		$_('#game').append ('<div class="middle align-center" data-ui="centered"></div>');
		if (this.animate) {
			Monogatari.global ('typedConfiguration').strings = [this.dialog];
			Monogatari.global ('textObject', new Typed ('[data-ui="centered"]', Monogatari.global ('typedConfiguration')));
		} else {
			$_('[data-ui="centered"]').html (this.dialog);
		}
		return Promise.resolve ();
	}
}

Centered.id = 'Centered';

Monogatari.registerAction (Centered);