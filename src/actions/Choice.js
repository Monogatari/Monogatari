import { Action } from '../lib/Action';
import { Util } from '@aegis-framework/artemis';

export class Choice extends Action {

	static setup () {
		this.engine.global ('_CurrentChoice', []);
		this.engine.global ('_ChoiceTimer', []);

		this.engine.history ('choice');

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

			let doAction = this.dataset.do;

			// Check that the data property was not created with
			// a null property
			if (doAction != 'null') {

				// Remove all the choices
				engine.element ().find ('choice-container').remove ();

				const choice = this.dataset.choice;

				const current = engine.global ('_CurrentChoice').pop().Choice;

				if (typeof current.Timer !== 'undefined') {
					const timer = engine.global ('_ChoiceTimer').pop ();
					if (typeof timer !== 'undefined') {
						clearTimeout (timer.props.timer);
						if (timer.parentNode !== null) {
							timer.element ().remove ();
						}
					}
				}

				if (current) {
					doAction = current[choice].Do;
				}

				const run = () => {
					engine.global ('_executing_sub_action', true);
					engine.run (doAction).then ((result) => {
						engine.global ('_executing_sub_action', false);
						engine.history ('choice').push (choice);

						return Promise.resolve (result);
					});
				};

				// Remove the reference to the current choice object
				if (current) {
					if (current[choice] !== 'undefined') {
						if (typeof current[choice].onChosen === 'function') {
							return Util.callAsync (current[choice].onChosen, engine).then (() => {
								run ();
							});
						}
					}
				}
				run ();
			}
		});
		return Promise.resolve ();
	}

	static reset () {
		this.engine.global ('_CurrentChoice', []);
		return Promise.resolve ();
	}

	static matchObject (statement) {
		return typeof statement.Choice !== 'undefined';
	}

	constructor (statement) {
		super ();

		this.statement = statement.Choice;

		this.result = { advance: false, step: false };
	}

	apply () {
		this.engine.global ('block', true);

		// Save a reference to the choice object globally. Since the choice buttons
		// are set a data-do property to know what the choice should do, it is
		// limited to a string and thus object or function actions would not be
		// able to be used in choices.
		this.engine.global ('_CurrentChoice').push (this._statement);

		const promises = [];

		// Go over all the objects defined in the choice object which should be
		// call the options to chose from or the string to show as dialog
		for (const i in this.statement) {
			const choice = this.statement[i];

			// Check if the option is an object (a option to choose from) or
			// if it's text (dialog to be shown)
			if (typeof choice == 'object') {
				if (i === 'Timer') {
					continue;
				}

				this.statement[i]._key = i;

				// Check if the current option has a condition to be shown
				if (typeof choice.Condition !== 'undefined' && choice.Condition !== '') {
					promises.push (
						new Promise ((resolve) => {
							// First check if the condition is met before we add the button
							this.engine.assertAsync (this.statement[i].Condition, this.engine).then (() => {
								resolve (this.statement[i]);
							}).catch (() => {
								resolve ();
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
			const timer = this.statement.Timer;

			if (typeof dialog === 'string') {
				// If there's a dialog, we'll wait until showing that up to show
				// the choices, in order to avoid showing the choices in an incorrect
				// format if the dialog was NVL or not
				return this.engine.run (dialog, false).then (() => {
					if (this.engine.element ().find ('[data-component="text-box"]').hasClass ('nvl')) {
						this.engine.element ().find ('[data-component="text-box"]').get (0).content ('text').append (element);
					} else {
						this.engine.element ().find ('[data-screen="game"]').append (element);
					}

					if (typeof timer === 'object') {
						const timer_display = document.createElement ('timer-display');
						timer_display.setProps (timer);
						this.engine.global ('_ChoiceTimer').push(timer_display);
						this.engine.element ().find ('[data-screen="game"]').prepend (timer_display);
					}
				});
			} else {
				// If there's no dialog, we can just show the choices right away
				if (this.engine.element ().find ('[data-component="text-box"]').hasClass ('nvl')) {
					this.engine.element ().find ('[data-component="text-box"]').get (0).content ('text').append (element);
				} else {
					this.engine.element ().find ('[data-screen="game"]').append (element);
				}

				if (typeof timer === 'object') {
					const timer_display = document.createElement ('timer-display');
					timer_display.setProps (timer);
					this.engine.global ('_ChoiceTimer').push(timer_display);
					this.engine.element ().find ('[data-screen="game"]').prepend (timer_display);
				}
			}
		});
	}

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
				} else {
					return Promise.reject ('The choice taken is not reversible because it did not defined a `onRevert` function.');
				}
			}
		}
		return Promise.reject ('Choice history was empty');
	}

	revert () {
		const choice = this.engine.history ('choice')[this.engine.history ('choice').length - 1];

		return this.engine.revert (this.statement[choice].Do, false).then (() => {
			if (typeof this.statement[choice].onRevert === 'function') {
				return Util.callAsync (this.statement[choice].onRevert, this.engine);
			}
			return Promise.resolve ();
		}).then (() => {
			return this.engine.run (this._statement, false);
		});
	}

	didRevert () {
		this.engine.history ('choice').pop ();
		return Promise.resolve ({ advance: false, step: false });
	}
}

Choice.id = 'Choice';

export default Choice;