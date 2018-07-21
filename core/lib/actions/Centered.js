import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';
import Typed from 'typed.js';

export class Centered extends Action {

	static matchString ([ action ]) {
		return action === 'centered';
	}

	static reset () {
		$_(`${Monogatari.selector} [data-ui="centered"]`).remove ();
		return Promise.resolve ();
	}

	static hide () {
		$_(`${Monogatari.selector} [data-ui="centered"]`).remove ();
		$_(`${Monogatari.selector} [data-ui="text"]`).show ();
	}

	constructor ([ action, ...dialog ]) {
		super ();
		this.dialog = dialog.join (' ');
		this.animate = Monogatari.setting ('TypeAnimation') && Monogatari.setting ('CenteredTypeAnimation');
	}

	apply () {
		$_(`${Monogatari.selector} [data-ui="text"]`).hide ();
		$_(`${Monogatari.selector} #game`).append ('<div class="middle align-center" data-ui="centered"></div>');
		if (this.animate) {
			Monogatari.global ('typedConfiguration').strings = [this.dialog];
			Monogatari.global ('textObject', new Typed (`${Monogatari.selector} [data-ui="centered"]`, Monogatari.global ('typedConfiguration')));
		} else {
			$_(`${Monogatari.selector} [data-ui="centered"]`).html (this.dialog);
		}
		return Promise.resolve ();
	}

	revert () {
		this.apply ();
		return Promise.resolve ();
	}
}

Centered.id = 'Centered';

Monogatari.registerAction (Centered);