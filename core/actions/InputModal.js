import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { $_, Util } from '@aegis-framework/artemis';

export class InputModal extends Action {

	static matchObject ({ Input }) {
		return typeof Input !== 'undefined';
	}

	static reset () {
		Monogatari.element ().find (`[data-ui="input"]`).remove ();
		return Promise.resolve ();
	}

	static canProceed () {
		if (Monogatari.element ().find (`[data-ui="input"]`).isVisible ()) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	static canRevert () {
		// If the player is trying to go back when the input form is being shown
		// we simply remove it, reset it and remove the listener it had.
		if (Monogatari.element ().find (`[data-ui="input"]`).isVisible ()) {

			// Remove the listener
			Monogatari.element ().find (`[data-ui="input"]`).get (0).removeEventListener ('submit', Monogatari.global ('_inputListener'));

			// Remove it
			Monogatari.element ().find (`[data-ui="input"]`).remove ();

			// Unblock the game
			Monogatari.global ('block', false);
		}
		return Promise.resolve ();
	}

	constructor ({ Input }) {
		super ();
		this.statement = Input;
	}


	apply () {

		Monogatari.element ().find (`[data-screen="game"]`).append (Monogatari.component ('text-input').render (this.statement.Text));

		// When the input modal is being shown, the game should be blocked so
		// the player won't continue until an input is correctly received.
		Monogatari.global ('block', true);

		// Define a global listener so that we can later remove it
		Monogatari.global ('_inputListener', (event) => {

			event.stopPropagation ();
			event.preventDefault ();

			// Retrieve the value submited
			const inputValue = Monogatari.element ().find (`[data-ui="input"] input`).value ();

			// Run the validation function asynchronously. If it returns false,
			// it means the input is invalid and we have to show the warning message.
			Monogatari.assertAsync (this.statement.Validation, Monogatari, [inputValue]).then (() => {

				// Once validation was done, we run the Save function where usually,
				// the input received will be saved on the storage or used for other
				// actions.
				Monogatari.assertAsync (this.statement.Save, Monogatari, [inputValue]).then (() => {
					Monogatari.element ().find (`[data-ui="input"]`).get (0).removeEventListener ('submit', Monogatari.global ('_inputListener'));
					Monogatari.element ().find (`[data-ui="input"]`).remove ();
					Monogatari.next ();
				}).catch (() => {
					Monogatari.element ().find (`[data-ui="input"]`).get (0).removeEventListener ('submit', Monogatari.global ('_inputListener'));
					Monogatari.element ().find (`[data-ui="input"]`).remove ();
				}).finally (() => {
					// Unblock the game so the player can continue
					Monogatari.global ('block', false);
				});
			}).catch (() => {
				// Show the warning message since the input was invalid
				Monogatari.element ().find (`[data-ui="input"] [data-ui="warning"]`).text (this.statement.Warning);
				Monogatari.global ('block', false);
			});
		});

		// Add the listener to the input form
		Monogatari.element ().find (`[data-ui="input"]`).submit (Monogatari.global ('_inputListener'));

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