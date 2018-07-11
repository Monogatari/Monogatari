import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class InputModal extends Action {

	static matchObject ({ Input }) {
		return typeof Input !== 'undefined';
	}

	static setup () {
		$_('#game #components').append (`
			<form data-component="modal" data-ui="input" class="middle">
				<p data-ui="input-message" class="block"></p>
				<input type="text">
				<small data-ui="warning" class="block"></small>
				<div>
					<button data-action="submit" type='submit'>Ok</button>
				</div>
			<form>
		`);
		return Promise.resolve ();
	}

	constructor ({ Input }) {
		super ();
		this.statement = Input;
	}

	willApply () {
		$_('[data-ui="input"] [data-ui="input-message"]').text (this.statement.Text);
		return Promise.resolve ();
	}

	apply () {
		Monogatari.global ('block', true);

		Monogatari.global ('_inputListener', (event) => {

			event.stopPropagation ();
			event.preventDefault ();

			const inputValue = $_('[data-ui="input"] input').value ();

			Monogatari.assertAsync (this.statement.Validation, Monogatari, [inputValue]).then (() => {
				Monogatari.assertAsync (this.statement.Save, Monogatari, [inputValue]).then (() => {
					$_('[data-ui="input"]').removeClass ('active');
					Monogatari.next ();
				}).catch (() => {
					$_('[data-ui="input"]').removeClass('active');
				}).finally (() => {
					$_('[data-ui="input"] [data-ui="warning"]').text ('');
					$_('[data-ui="input"] input').value ('');
					$_('[data-ui="input"] [data-action="submit"]').get (0).removeEventListener ('submit', Monogatari.global ('_inputListener'));
					Monogatari.global ('block', false);
				});
			}).catch (() => {
				$_('[data-ui="input"] [data-ui="warning"]').text (this.statement.Warning);
				Monogatari.global ('block', false);
			});
		});

		$_('[data-ui="input"]').submit (Monogatari.global ('_inputListener'));
		$_('[data-ui="input"]').addClass ('active');
		return Promise.resolve ();
	}
}

InputModal.id = 'Input';
InputModal.settings = {};

Monogatari.registerAction (InputModal);