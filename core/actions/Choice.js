import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { $_, Util } from '@aegis-framework/artemis';

export class Choice extends Action {

	static setup () {
		Monogatari.global ('_CurrentChoice', null);
		Monogatari.history ('choice');
		return Promise.resolve ();
	}

	static canProceed () {
		// If a choice is currently being displayed, the player should not be able
		// to advance until one is chosen.
		if (Monogatari.element ().find (`[data-ui="choices"]`).isVisible ()) {
			return Promise.reject ();
		}
		return Promise.resolve ();
	}

	static canRevert () {
		// If a choice is visible right now, we can simply remove it and let the
		// game revert to the previous statement.
		if (Monogatari.element ().find (`[data-ui="choices"]`).isVisible ()) {
			Monogatari.element ().find (`[data-ui="choices"]`).remove ();
			Monogatari.global ('_CurrentChoice', null);
		}
		return Promise.resolve ();
	}

	static bind (selector) {
		// Bind the click event on data-do elements. This property is used for
		// every choice button.
		$_(`${selector}`).on('click', '[data-choice]', function (event) {
			Monogatari.debug ().debug ('Registered Click on Choice Button');
			event.stopImmediatePropagation ();
			event.stopPropagation ();
			event.preventDefault ();

			// Check that the data property was not created with
			// a null property
			if ($_(this).data('do') != 'null') {

				// Remove all the choices
				Monogatari.element ().find (`[data-ui="choices"]`).remove ();

				// Remove the reference to the current choice object
				if (Monogatari.global ('_CurrentChoice') !== null) {
					if (typeof Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')] !== 'undefined') {
						if (typeof Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')].onChosen === 'function') {
							Util.callAsync (Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')].onChosen, Monogatari).then (() => {
								Monogatari.run (Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')].Do, false);
								Monogatari.global ('_CurrentChoice', null);
							});
						} else {
							Monogatari.run (Monogatari.global ('_CurrentChoice')[$_(this).data ('choice')].Do, false);
							Monogatari.global ('_CurrentChoice', null);
						}
						Monogatari.history ('choice').push ($_(this).data ('choice'));
					} else {
						Monogatari.run ($_(this).data ('do'), false);
						Monogatari.global ('_CurrentChoice', null);
					}
				} else {
					Monogatari.run ($_(this).data ('do'), false);
					Monogatari.global ('_CurrentChoice', null);
				}
			}
		});
		return Promise.resolve ();
	}

	static reset () {
		Monogatari.element ().find (`[data-ui="choices"]`).remove ();
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
		Monogatari.element ().find (`[data-ui="choices"]`).html ('');
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
			Monogatari.element ().find (`[data-ui="choices"]`).show ('flex');
		}

		return Promise.all (promises).then (() => {
			if (Monogatari.element ().find (`[data-screen="game"] [data-ui="text"]`).hasClass ('nvl')) {
				element.addClass ('horizontal');
				Monogatari.element ().find (` [data-screen="game"] [data-ui="text"]`).append (element.get (0));
			} else {
				element.addClass ('vertical');
				element.addClass ('middle');
				Monogatari.element ().find (` [data-screen="game"]`).append (element.get (0));
			}
		});
	}

	// Revert is disabled for choices since we still don't have a way to know what
	// a choice did
	willRevert () {
		if (Monogatari.history ('choice').length > 0) {
			const choice = Monogatari.history ('choice')[Monogatari.history ('choice').length - 1];
			if (this.statement[choice] !== 'undefined') {

				// Check if the choice had an onChosen function with it's matching
				// onRevert functionality, or if no onChosen function was provided
				// which are the only cases where it can be reverted.
				const functionReversible = (typeof this.statement[choice].onRevert === 'function' && typeof this.statement[choice].onChosen === 'function') || typeof this.statement[choice].onChosen !== 'function';

				if (functionReversible) {
					return Promise.resolve ();
				}
			}
		}
		return Promise.reject ();
	}

	revert () {
		const choice = Monogatari.history ('choice')[Monogatari.history ('choice').length - 1];
		return Monogatari.revert (this.statement[choice].Do, false).then (() => {
			if (typeof this.statement[choice].onRevert === 'function') {
				return Util.callAsync (this.statement[choice].onRevert, Monogatari).then (() => {
					return this.apply ();
				});
			}
			return this.apply ();
		});
	}

	didRevert () {
		Monogatari.history ('choice').pop ();
		return Promise.resolve ({ advance: false, step: false });
	}
}

Choice.id = 'Choice';

Monogatari.registerAction (Choice);