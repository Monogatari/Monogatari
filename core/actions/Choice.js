import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import { Util } from '@aegis-framework/artemis';

export class Choice extends Action {

	static setup () {
		Monogatari.global ('_CurrentChoice', null);
		Monogatari.history ('choice');
		return Promise.resolve ();
	}

	static willRollback () {
		Monogatari.global ('_CurrentChoice', null);
		return Promise.resolve ();
	}

	static bind () {
		// Bind the click event on data-do elements. This property is used for
		// every choice button.
		this.engine.on ('click', '[data-choice]:not([disabled])', function (event) {
			Monogatari.debug.debug ('Registered Click on Choice Button');
			event.stopImmediatePropagation ();
			event.stopPropagation ();
			event.preventDefault ();

			Monogatari.global ('block', false);

			const doAction = this.dataset.do;

			// Check that the data property was not created with
			// a null property
			if (doAction != 'null') {

				// Remove all the choices
				Monogatari.element ().find ('choice-container').remove ();
				const choice = this.dataset.choice;

				// Remove the reference to the current choice object
				if (Monogatari.global ('_CurrentChoice') !== null) {
					if (typeof Monogatari.global ('_CurrentChoice')[choice] !== 'undefined') {
						if (typeof Monogatari.global ('_CurrentChoice')[choice].onChosen === 'function') {
							Util.callAsync (Monogatari.global ('_CurrentChoice')[choice].onChosen, Monogatari).then (() => {
								Monogatari.run (Monogatari.global ('_CurrentChoice')[choice].Do, false);
								Monogatari.global ('_CurrentChoice', null);
							});
						} else {
							Monogatari.run (Monogatari.global ('_CurrentChoice')[choice].Do, false);
							Monogatari.global ('_CurrentChoice', null);
						}
						Monogatari.history ('choice').push (choice);
					} else {
						Monogatari.run (doAction, false);
						Monogatari.global ('_CurrentChoice', null);
					}
				} else {
					Monogatari.run (doAction, false);
					Monogatari.global ('_CurrentChoice', null);
				}
			}
		});
		return Promise.resolve ();
	}

	static reset () {
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

	apply () {
		this.engine.global ('block', true);
		// Save a reference to the choice object globally. Since the choice buttons
		// are set a data-do property to know what the choice should do, it is
		// limited to a string and thus object or function actions would not be
		// able to be used in choices.
		Monogatari.global ('_CurrentChoice', this.statement);

		const promises = [];

		// Go over all the objects defined in the choice object which should be
		// call the options to chose from or the string to show as dialog
		for (const i in this.statement) {
			const choice = this.statement[i];

			// Check if the option is an object (a option to choose from) or
			// if it's text (dialog to be shown)
			if (typeof choice == 'object') {
				this.statement[i]._key = i;

				// Check if the current option has a condition to be shown
				if (typeof choice.Condition !== 'undefined' && choice.Condition !== '') {
					promises.push (
						new Promise ((resolve) => {
							// First check if the condition is met before we add the button
							Monogatari.assertAsync (this.statement[i].Condition, Monogatari).then (() => {
								resolve (this.statement[i]);
							}).catch (() => {
								resolve()
							}).finally (() => {
								//Monogatari.global ('block', false);
							});
						})
					);
				} else {
					promises.push (Promise.resolve (this.statement[i]));
				}
			}
		}

		return Promise.all (promises).then ((choices) => {
			const element = document.createElement ('choice-container');

			// Check if the choice object defined a list of class names
			const classes = typeof this.statement.Class === 'string' ?  this.statement.Class.trim () : '';

			element.setProps ({
				choices: choices.filter(c => typeof c !== 'undefined'),
				classes
			});

			const dialog = this.statement.Dialog;

			if (typeof dialog === 'string') {
				// If there's a dialog, we'll wait until showing that up to show
				// the choices, in order to avoid showing the choices in an incorrect
				// format if the dialog was NVL or not
				this.engine.run (dialog, false).then (() => {
					if (Monogatari.element ().find ('[data-component="text-box"]').hasClass ('nvl')) {
						this.engine.element ().find ('[data-component="text-box"]').get (0).content ('text').append (element);
					} else {
						this.engine.element ().find ('[data-screen="game"]').append (element);
					}
				});
			} else {
				// If there's no dialog, we can just show the choices right away
				if (Monogatari.element ().find ('[data-component="text-box"]').hasClass ('nvl')) {
					this.engine.element ().find ('[data-component="text-box"]').get (0).content ('text').append (element);
				} else {
					this.engine.element ().find ('[data-screen="game"]').append (element);
				}
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