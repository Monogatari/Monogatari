import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Choice extends Action {

	static canProceed () {
		if ($_(`${Monogatari.selector} [data-ui="choices"]`).isVisible ()) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	static bind (selector) {
		$_(`${selector}`).on('click', '[data-do]', function () {
			Monogatari.action ('Centered').hide ();
			Monogatari.shutUp ();
			if ($_(this).data('do') != 'null' && $_(this).data('do') != '') {
				$_(`${selector} [data-ui="choices"]`).hide ();
				$_(`${selector} [data-ui="choices"]`).html ('');
				Monogatari.run ($_(this).data ('do'), false);
			}
		});
		return Promise.resolve ();
	}

	static reset () {
		$_(`${Monogatari.selector} [data-ui="choices"]`).hide ();
		$_(`${Monogatari.selector} [data-ui="choices"]`).html ('');
		return Promise.resolve ();
	}

	static matchObject (statement) {
		return typeof statement.Choice !== 'undefined';
	}

	constructor (statement) {
		super ();
		this.statement = statement.Choice;
	}

	willApply () {
		$_(`${Monogatari.selector} [data-ui="choices"]`).html ('');
		return Promise.resolve ();
	}

	apply () {

		for (const i in this.statement) {
			const choice = this.statement[i];

			if (typeof choice.Condition !== 'undefined' && choice.Condition !== '') {

				Monogatari.assertAsync (this.statement[i].Condition, Monogatari).then (() => {
					if (typeof choice.Class !== 'undefined') {
						$_(`${Monogatari.selector} [data-ui="choices"]`).append (`<button data-do="${choice.Do}" class="${choice.Class}">${choice.Text}</button>`);
					} else {
						$_(`${Monogatari.selector} [data-ui="choices"]`).append (`<button data-do="${choice.Do}">${choice.Text}</button>`);
					}
				}).catch (() => {
					// The condition wasn't met
				}).finally (() => {
					Monogatari.global ('block', false);
				});
			} else {
				if (typeof choice == 'object') {
					if (typeof choice.Class != 'undefined') {
						$_(`${Monogatari.selector} [data-ui="choices"]`).append (`<button data-do="${choice.Do}" class="${choice.Class}">${choice.Text}</button>`);
					} else {
						$_(`${Monogatari.selector} [data-ui="choices"]`).append (`<button data-do="${choice.Do}">${choice.Text}</button>`);
					}
				} else if (typeof choice == 'string') {
					Monogatari.run (choice, false);
				}
			}
			$_(`${Monogatari.selector} [data-ui="choices"]`).show ('flex');
		}
		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

Choice.id = 'Choice';

Monogatari.registerAction (Choice);