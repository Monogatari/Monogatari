import { Action } from './../lib/Action';
import { Util } from '@aegis-framework/artemis';

export class Choice extends Action {

	static setup () {
		this.engine.global ('_CurrentChoice', null);
		this.engine.history ('choice');
		return Promise.resolve ();
	}

	static willRollback () {
		this.engine.global ('_CurrentChoice', null);
		return Promise.resolve ();
	}

	static bind () {
		const engine = this.engine;
		// Bind the click event on data-do elements. This property is used for
		// every choice button.
		this.engine.on ('click', '[data-choice]:not([disabled])', function (event) {
			engine.debug.debug ('Registered Click on Choice Button');
			event.stopImmediatePropagation ();
			event.stopPropagation ();
			event.preventDefault ();

			engine.global ('block', false);

			const doAction = this.dataset.do;

			// Check that the data property was not created with
			// a null property
			if (doAction != 'null') {

				// Remove all the choices
				engine.element ().find ('choice-container').remove ();
				const choice = this.dataset.choice;

				// Remove the reference to the current choice object
				if (engine.global ('_CurrentChoice') !== null) {
					if (typeof engine.global ('_CurrentChoice')[choice] !== 'undefined') {
						if (typeof engine.global ('_CurrentChoice')[choice].onChosen === 'function') {
							Util.callAsync (engine.global ('_CurrentChoice')[choice].onChosen, engine).then (() => {
								engine.run (engine.global ('_CurrentChoice')[choice].Do, false);
								engine.global ('_CurrentChoice', null);
							});
						} else {
							engine.run (engine.global ('_CurrentChoice')[choice].Do, false);
							engine.global ('_CurrentChoice', null);
						}
						engine.history ('choice').push (choice);
					} else {
						engine.run (doAction, false);
						engine.global ('_CurrentChoice', null);
					}
				} else {
					engine.run (doAction, false);
					engine.global ('_CurrentChoice', null);
				}
			}
		});
		return Promise.resolve ();
	}

	static reset () {
		this.engine.global ('_CurrentChoice', null);
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
		this.engine.global ('_CurrentChoice', this.statement);

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
							this.engine.assertAsync (this.statement[i].Condition, this.engine).then (() => {
								resolve (this.statement[i]);
							}).catch (() => {
								resolve()
							}).finally (() => {
								//this.engine.global ('block', false);
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
					if (this.engine.element ().find ('[data-component="text-box"]').hasClass ('nvl')) {
						this.engine.element ().find ('[data-component="text-box"]').get (0).content ('text').append (element);
					} else {
						this.engine.element ().find ('[data-screen="game"]').append (element);
					}
				});
			} else {
				// If there's no dialog, we can just show the choices right away
				if (this.engine.element ().find ('[data-component="text-box"]').hasClass ('nvl')) {
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
		if (this.engine.history ('choice').length > 0) {
			const choice = this.engine.history ('choice')[this.engine.history ('choice').length - 1];
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
		const choice = this.engine.history ('choice')[this.engine.history ('choice').length - 1];
		return this.engine.revert (this.statement[choice].Do, false).then (() => {
			if (typeof this.statement[choice].onRevert === 'function') {
				return Util.callAsync (this.statement[choice].onRevert, this.engine).then (() => {
					return this.apply ();
				});
			}
			return this.apply ();
		});
	}

	didRevert () {
		this.engine.history ('choice').pop ();
		return Promise.resolve ({ advance: false, step: false });
	}
}

Choice.id = 'Choice';

export default Choice;