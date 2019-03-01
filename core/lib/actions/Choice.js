import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_, Util } from '@aegis-framework/artemis';

export class Choice extends Action {

	static setup () {
		Monogatari.global ('_CurrentChoice', null);
		return Promise.resolve ();
	}

	static canProceed () {
		// If a choice is currently being displayed, the player should not be able
		// to advance until one is chosen.
		if ($_(`${Monogatari.selector} [data-ui="choices"]`).isVisible ()) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	static canRevert () {
		// If a choice is visible right now, we can simply remove it and let the
		// game revert to the previous statement.
		if ($_(`${Monogatari.selector} [data-ui="choices"]`).isVisible ()) {
			$_(`${Monogatari.selector} [data-ui="choices"]`).remove ();
			Monogatari.global ('_CurrentChoice', null);
		}
		return Promise.resolve ();
	}

	static bind (selector) {
		// Bind the click event on data-do elements. This property is used for
		// every choice button.
		$_(`${selector}`).on('click', '[data-choice]', function () {

			// Check that the data property was not created with
			// a null property
			if ($_(this).data('do') != 'null') {

				// Remove all the choices
				$_(`${Monogatari.selector} [data-ui="choices"]`).remove ();

				// Remove the reference to the current choice object
				if (Monogatari.global ('_CurrentChoice') !== null) {
					if (typeof Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')] !== 'undefined') {
						if (typeof Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')].onChosen === 'function') {
							Util.callAsync (Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')].onChosen, Monogatari).then (() => {
								Monogatari.run (Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')].Do, false);
							});
						} else {
							Monogatari.run (Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')].Do, false);
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

		// Save a reference to the choice object globally. Since the choice buttons
		// are set a data-do property to know what the choice should do, it is
		// limited to a string and thus object or function actions would not be
		// able to be used in choices.
		Monogatari.global ('_CurrentChoice', this.statement);

		const element = $_(document.createElement ('div'));
		element.addClass ('text--center');
		element.data ('ui', 'choices');

		const promises = [];

		// Go over all the objects defined in the choice object which should be
		// call the options to chose from or the string to show as dialog
		for (const i in this.statement) {
			const choice = this.statement[i];

			// Check if the current option has a condition to be shown
			if (typeof choice.Condition !== 'undefined' && choice.Condition !== '') {

				promises.push (
					new Promise ((resolve) => {
						// First check if the condition is met before we add the button
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
				// Check if the option is an object (a option to choose from) or
				// if it's text (dialog to be shown)
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
			if ($_(`${Monogatari.selector} [data-screen="game"] [data-ui="text"]`).hasClass ('nvl')) {
				element.addClass ('horizontal');
				$_(`${Monogatari.selector}  [data-screen="game"] [data-ui="text"]`).append (element.get (0));
			} else {
				element.addClass ('vertical');
				element.addClass ('middle');
				$_(`${Monogatari.selector}  [data-screen="game"]`).append (element.get (0));
			}
		});
	}

	// Revert is disabled for choices since we still don't have a way to know what
	// a choice did
	willRevert () {
		return Promise.reject ();
	}
}

Choice.id = 'Choice';

Monogatari.registerAction (Choice);