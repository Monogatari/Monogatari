import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { Util } from '@aegis-framework/artemis';

export class InputModal extends Action {

	static matchObject ({ Input }) {
		return typeof Input !== 'undefined';
	}

	static shouldRollback () {
		// If the player is trying to go back when the input form is being shown
		// we simply remove it, reset it and remove the listener it had.
		if (this.instances ().isVisible ()) {

			this.instances ().remove ();

			// Unblock the game
			Monogatari.global ('block', false);
		}
		return Promise.resolve ();
	}

	////////////////////////////////////////////////////////////////////////////


	constructor ({ Input }) {
		super ();
		this.statement = Input;

		if (typeof this.statement.Validation !== 'function') {
			this.statement.Validation = () => true;
		}

		if (typeof this.statement.Save !== 'function') {
			this.statement.Save = () => true;
		}

		if (typeof this.statement.Warning !== 'string') {
			this.statement.Warning = '';
		}
	}

	apply () {

		const input = document.createElement ('text-input');

		const { Text, Warning, Save, Validation } = this.statement;

		input.setProps ({
			text: Text,
			warning: Warning,
			onSubmit: Save,
			validate: Validation,
			callback: () => {
				this.engine.global ('block', false);
				this.engine.next ();
			}
		});
		console.log (input);

		this.engine.global ('block', true);

		this.engine.element ().find ('[data-screen="game"]').append (input);
		return Promise.resolve ();
	}

	willRevert () {
		if (typeof this.statement.Revert === 'function') {
			return Promise.resolve ();
		}
		return Promise.reject ();
	}

	revert () {
		return Util.callAsync (this.statement.Revert, Monogatari).then (() => {
			return this.apply ();
		});
	}

	didRevert () {
		return Promise.resolve ({ advance: false, step: true });
	}
}

InputModal.id = 'Input';

Monogatari.registerAction (InputModal);