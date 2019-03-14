import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';
import Typed from 'typed.js';

export class Centered extends Action {

	static canProceed () {
		if (!Monogatari.global ('finishedTyping') && Monogatari.global ('textObject') !== null) {
			const str = Monogatari.global ('textObject').strings [0];
			const element = $_(Monogatari.global ('textObject').el).data ('ui');

			if (element == 'centered') {
				Monogatari.global ('textObject').destroy ();
				$_(`${Monogatari.selector} [data-ui="centered"]`).html (str);
				Monogatari.global ('finishedTyping', true);
			}

			return Promise.reject ();
		} else if (Monogatari.global ('finishedTyping') && $_(`${Monogatari.selector} [data-ui="centered"]`).isVisible ()) {
			$_(`${Monogatari.selector} [data-ui="centered"]`).remove ();
			$_(`${Monogatari.selector} [data-ui="text"]`).show ();
		}
		return Promise.resolve (Monogatari.global ('finishedTyping'));
	}

	static canRevert () {
		if ($_(`${Monogatari.selector} [data-ui="centered"]`).isVisible ()) {
			$_(`${Monogatari.selector} [data-ui="centered"]`).remove ();
			Monogatari.global ('finishedTyping', true);
			Monogatari.global ('textObject').destroy ();
			Monogatari.global ('_CurrentChoice', null);
			$_(`${Monogatari.selector} [data-ui="text"]`).show ();
		}
		return Promise.resolve ();
	}

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
		$_(`${Monogatari.selector} [data-screen="game"]`).append ('<div class="middle align-center" data-ui="centered"></div>');
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

	didRevert () {
		return Promise.resolve ({ advance: false, step: true });
	}
}

Centered.id = 'Centered';

Monogatari.registerAction (Centered);