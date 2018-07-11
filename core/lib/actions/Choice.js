import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class Choice extends Action {

	static matchObject (statement) {
		return typeof statement.Choice !== 'undefined';
	}

	constructor (statement) {
		super ();
		this.statement = statement.Choice;
	}

	willApply () {
		$_('[data-ui="choices"]').html ('');
		return Promise.resolve ();
	}

	apply () {

		for (const i in this.statement) {
			const choice = this.statement[i];

			if (typeof choice.Condition !== 'undefined' && choice.Condition !== '') {

				Monogatari.assertAsync (this.statement[i].Condition, Monogatari).then (() => {
					if (typeof choice.Class !== 'undefined') {
						$_('[data-ui="choices"]').append (`<button data-do="${choice.Do}" class="${choice.Class}">${choice.Text}</button>`);
					} else {
						$_('[data-ui="choices"]').append (`<button data-do="${choice.Do}">${choice.Text}</button>`);
					}
				}).finally (() => {
					Monogatari.global ('block', false);
				});
			} else {
				if (typeof choice == 'object') {
					if (typeof choice.Class != 'undefined') {
						$_('[data-ui="choices"]').append (`<button data-do="${choice.Do}" class="${choice.Class}">${choice.Text}</button>`);
					} else {
						$_('[data-ui="choices"]').append (`<button data-do="${choice.Do}">${choice.Text}</button>`);
					}
				} else if (typeof choice == 'string') {
					Monogatari.run (choice, false);
				}
			}
			$_('[data-ui="choices"]').show ('flex');
		}
		return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

Choice.id = 'Choice';

Monogatari.registerAction (Choice);