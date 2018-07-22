import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class InputModal extends Action {

	static matchObject ({ Input }) {
		return typeof Input !== 'undefined';
	}

	static setup (selector) {
		$_(`${selector} #game #components`).append (`
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

	static reset () {
		$_(`${Monogatari.selector} [data-ui="input"] [data-ui="warning"]`).text ('');
		$_(`${Monogatari.selector} [data-ui="input"]`).removeClass('active');
		return Promise.resolve ();
	}

	static canProceed () {
		if ($_(`${Monogatari.selector} [data-ui="input"]`).isVisible ()) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	static canRevert () {
		if ($_(`${Monogatari.selector} [data-ui="input"]`).isVisible ()) {
			$_(`${Monogatari.selector} [data-ui="input"]`).removeClass ('active');
			$_(`${Monogatari.selector} [data-ui="input"] [data-ui="warning"]`).text ('');
			$_(`${Monogatari.selector} [data-ui="input"] input`).value ('');
			$_(`${Monogatari.selector} [data-ui="input"]`).get (0).removeEventListener ('submit', Monogatari.global ('_inputListener'));
			Monogatari.global ('block', false);
		}
		return Promise.resolve ();
	}

	constructor ({ Input }) {
		super ();
		this.statement = Input;
	}

	willApply () {
		$_(`${Monogatari.selector} [data-ui="input"] [data-ui="input-message"]`).text (this.statement.Text);
		return Promise.resolve ();
	}

	apply () {
		Monogatari.global ('block', true);

		Monogatari.global ('_inputListener', (event) => {

			event.stopPropagation ();
			event.preventDefault ();

			const inputValue = $_(`${Monogatari.selector} [data-ui="input"] input`).value ();

			Monogatari.assertAsync (this.statement.Validation, Monogatari, [inputValue]).then (() => {
				Monogatari.assertAsync (this.statement.Save, Monogatari, [inputValue]).then (() => {
					$_(`${Monogatari.selector} [data-ui="input"]`).removeClass ('active');
					Monogatari.next ();
				}).catch (() => {
					$_(`${Monogatari.selector} [data-ui="input"]`).removeClass('active');
				}).finally (() => {
					$_(`${Monogatari.selector} [data-ui="input"] [data-ui="warning"]`).text ('');
					$_(`${Monogatari.selector} [data-ui="input"] input`).value ('');
					$_(`${Monogatari.selector} [data-ui="input"]`).get (0).removeEventListener ('submit', Monogatari.global ('_inputListener'));
					Monogatari.global ('block', false);
				});
			}).catch (() => {
				$_(`${Monogatari.selector} [data-ui="input"] [data-ui="warning"]`).text (this.statement.Warning);
				Monogatari.global ('block', false);
			});
		});

		$_(`${Monogatari.selector} [data-ui="input"]`).submit (Monogatari.global ('_inputListener'));
		$_(`${Monogatari.selector} [data-ui="input"]`).addClass ('active');
		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

InputModal.id = 'Input';

Monogatari.registerAction (InputModal);