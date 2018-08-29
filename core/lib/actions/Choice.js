import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_, Util } from '@aegis-framework/artemis';

export class Choice extends Action {

	static setup () {
		Monogatari.global ('_CurrentChoice', null);
		return Promise.resolve ();
	}

	static canProceed () {
		if ($_(`${Monogatari.selector} [data-ui="choices"]`).isVisible ()) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	static canRevert () {
		if ($_(`${Monogatari.selector} [data-ui="choices"]`).isVisible ()) {
			$_(`${Monogatari.selector} [data-ui="choices"]`).remove ();
			Monogatari.global ('_CurrentChoice', null);
		}
		return Promise.resolve ();
	}

	static bind (selector) {
		$_(`${selector}`).on('click', '[data-do]', function () {
			if ($_(this).data('do') != 'null' && $_(this).data('do') != '') {
				$_(`${Monogatari.selector} [data-ui="choices"]`).remove ();
				if (Monogatari.global ('_CurrentChoice') !== null) {
					if (typeof Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')] !== 'undefined') {
						if (typeof Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')].onChosen === 'function') {
							Util.callAsync (Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')].onChosen, Monogatari).then (() => {
								Monogatari.run ($_(this).data ('do'), false);
							});
						} else {
							Monogatari.run ($_(this).data ('do'), false);
						}
					} else {
						Monogatari.run ($_(this).data ('do'), false);
					}
				} else {
					Monogatari.run ($_(this).data ('do'), false);
				}
			}
			Monogatari.global ('_CurrentChoice', null);
		});
		return Promise.resolve ();
	}

	static reset () {
		$_(`${Monogatari.selector} [data-ui="choices"]`).remove ();
		Monogatari.global ('_CurrentChoice', null);
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
		Monogatari.global ('_CurrentChoice', this.statement);

		const element = $_(document.createElement ('div'));
		element.addClass ('text--center');
		element.data ('ui', 'choices');

		const promises = [];

		for (const i in this.statement) {
			const choice = this.statement[i];

			if (typeof choice.Condition !== 'undefined' && choice.Condition !== '') {

				promises.push (
					new Promise ((resolve) => {
						Monogatari.assertAsync (this.statement[i].Condition, Monogatari).then (() => {
							if (typeof choice.Class !== 'undefined') {
								element.append (`<button data-do="${choice.Do}" class="${choice.Class}" data-choice="${i}">${choice.Text}</button>`);
							} else {
								element.append (`<button data-do="${choice.Do}" data-choice="${i}">${choice.Text}</button>`);
							}
						}).catch (() => {
							// The condition wasn't met
						}).finally (() => {
							Monogatari.global ('block', false);
							resolve ();
						});
					})
				);
			} else {
				if (typeof choice == 'object') {
					if (typeof choice.Class != 'undefined') {
						element.append (`<button data-do="${choice.Do}" class="${choice.Class}" data-choice="${i}">${choice.Text}</button>`);
					} else {
						element.append (`<button data-do="${choice.Do}" data-choice="${i}">${choice.Text}</button>`);
					}
				} else if (typeof choice == 'string') {
					promises.push (Monogatari.run (choice, false));
				}
			}
			$_(`${Monogatari.selector} [data-ui="choices"]`).show ('flex');
		}

		return Promise.all (promises).then (() => {
			if ($_(`${Monogatari.selector} #game [data-ui="text"]`).hasClass ('nvl')) {
				element.addClass ('horizontal');
				$_(`${Monogatari.selector}  #game [data-ui="text"]`).append (element.get (0));
			} else {
				element.addClass ('vertical');
				element.addClass ('middle');
				$_(`${Monogatari.selector}  #game`).append (element.get (0));
			}
		});



		//return Promise.resolve ();
	}

	willRevert () {
		return Promise.reject ();
	}
}

Choice.id = 'Choice';

Monogatari.registerAction (Choice);