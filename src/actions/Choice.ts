import Action from '../lib/Action';
import { Util } from '@aegis-framework/artemis';
import { ActionApplyResult, ActionRevertResult, ActionInstance } from '../lib/types';

export class Choice extends Action {
	static override id = 'Choice';

	static override async setup(): Promise<void> {
		this.engine.global('_CurrentChoice', []);
		this.engine.global('_ChoiceTimer', []);

		this.engine.global('_choice_pending_rollback', []);
		this.engine.global('_choice_just_rolled_back', []);

		this.engine.history('choice');
	}


	static override async afterRevert(): Promise<void> {
		// When a choice gets reverted, it pushes a `true` value to this global variable.
		// As soon as it gets reverted, this function is run and it pops the `true` out of
		// the array, meaning it was just reverted and the choice should be showing on screeen again.
		if (this.engine.global('_choice_just_rolled_back').pop()) {
			return Promise.resolve();
		}

		// If the player reverts once more while the choice is being shown, then we'll reach this part
		// and we can clean up any variables we need to.
		if (this.engine.global('_choice_pending_rollback').pop()) {
			this.engine.global('_ChoiceTimer').pop();
		}
	}

	static override async bind(): Promise<void> {
		const engine = this.engine;
		// Bind the click event on data-do elements. This property is used for
		// every choice button.
		this.engine.on('click', '[data-choice]:not([disabled])', function (this: HTMLElement, event: Event) {
			engine.debug.debug('Registered Click on Choice Button');
			event.stopImmediatePropagation();
			event.stopPropagation();
			event.preventDefault();

			engine.global('block', false);

			let doAction = (this as HTMLElement).dataset.do;

			// Check that the data property was not created with
			// a null property
			if (doAction != 'null') {

				// Remove all the choices
				engine.element().find('choice-container').remove();

				const choice = (this as HTMLElement).dataset.choice;

				const currentChoice = (engine.global('_CurrentChoice') as unknown[]).pop() as { Choice: Record<string, { Do: string; Timer?: unknown; onChosen?: () => void }> } | undefined;
				const current = currentChoice?.Choice;

				if (current && typeof current.Timer !== 'undefined') {
					const timer = (engine.global('_ChoiceTimer') as unknown[]).pop() as HTMLElement & { props?: { timer: ReturnType<typeof setTimeout> }; element?: () => { remove: () => void } } | undefined;
					(engine.global('_choice_pending_rollback') as boolean[]).pop();
					if (typeof timer !== 'undefined' && timer.props) {
						clearTimeout(timer.props.timer);
						if (timer.parentNode !== null && timer.element) {
							timer.element().remove();
						}
					}
				}

				if (current && typeof choice !== 'undefined' && typeof current[choice] !== 'undefined') {
					doAction = current[choice].Do;
				}

				const run = () => {
					engine.global('_executing_sub_action', true);
					if (typeof doAction === 'string' && typeof choice === 'string') {
						engine.run(doAction).then((result: { advance: boolean }) => {
							engine.global('_executing_sub_action', false);
							engine.history('choice').push(choice);

							return Promise.resolve(result);
						});
					}
				};

				// Remove the reference to the current choice object
				if (current && typeof choice !== 'undefined') {
					if (typeof current[choice] !== 'undefined') {
						if (typeof current[choice].onChosen === 'function') {
							Util.callAsync(current[choice].onChosen, engine).then(() => {
								run();
							});
							return;
						}
					}
				}
				run();
			}
		});
	}

	static override async reset(): Promise<void> {
		this.engine.global('_CurrentChoice', []);
		this.engine.global('_ChoiceTimer', []);

		this.engine.global('_choice_pending_rollback', []);
		this.engine.global('_choice_just_rolled_back', []);
	}

	static override matchObject(statement: any): boolean {
		return typeof statement.Choice !== 'undefined';
	}

	statement: any;
	result: ActionApplyResult; // Not strictly used as property but was in original

	constructor(statement: any) {
		super();

		this.statement = statement.Choice;

		this.result = { advance: false };
	}

	override async apply({ updateLog = true } = {}): Promise<void> {
		this.engine.global('block', true);

		// Save a reference to the choice object globally. Since the choice buttons
		// are set a data-do property to know what the choice should do, it is
		// limited to a string and thus object or function actions would not be
		// able to be used in choices.
		this.engine.global('_CurrentChoice').push(this._statement);

		const promises: Promise<any>[] = [];

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
					promises.push(
						new Promise((resolve) => {
							// First check if the condition is met before we add the button
							this.engine.assertAsync(this.statement[i].Condition, this.engine).then(() => {
								resolve(this.statement[i]);
							}).catch(() => {
								resolve(undefined);
							}).finally(() => {
								//this.engine.global ('block', false);
							});
						})
					);
				} else {
					promises.push(Promise.resolve(this.statement[i]));
				}
			}
		}

		const choices = await Promise.all(promises);
		const element = document.createElement('choice-container');

		// Check if the choice object defined a list of class names
		const classes = typeof this.statement.Class === 'string' ? this.statement.Class.trim() : '';

		(element as any).setProps({
			choices: choices.filter(c => typeof c !== 'undefined'),
			classes
		});

		const dialog = this.statement.Dialog;
		const timer = this.statement.Timer;
		const textBox = this.engine.element().find('[data-component="text-box"]').get(0);

			if (typeof dialog === 'string') {
			// If there's a dialog, we'll wait until showing that up to show
			// the choices, in order to avoid showing the choices in an incorrect
			// format if the dialog was NVL or not
			const action = this.engine.prepareAction(dialog, { cycle: 'Application' }) as ActionInstance | null;
			if (action !== null) {
				await action.willApply();
				await action.apply({ updateLog });
				await action.didApply();
			}
		}

		const textBoxEl = textBox as HTMLElement & { props?: { mode: string }; content?: (name: string) => { append: (el: HTMLElement) => void } };
		if (textBoxEl?.props?.mode === 'nvl' && textBoxEl.content) {
			textBoxEl.content('text').append(element);
		} else {
			this.engine.element().find('[data-screen="game"]').append(element);
		}

		if (typeof timer === 'object') {
			const timer_display = document.createElement('timer-display');
			(timer_display as any).setProps(timer);
			this.engine.global('_ChoiceTimer').push(timer_display);
			this.engine.global('_choice_pending_rollback').push(true);
			this.engine.element().find('[data-screen="game"]').prepend(timer_display);
		}
	}

	override async willRevert(): Promise<void> {
		if (this.engine.history('choice').length > 0) {
			const choice = this.engine.history('choice')[this.engine.history('choice').length - 1];
			if (this.statement[choice] !== 'undefined') {

				// Check if the choice had an onChosen function with it's matching
				// onRevert functionality, or if no onChosen function was provided
				// which are the only cases where it can be reverted.
				const functionReversible = (typeof this.statement[choice].onRevert === 'function' && typeof this.statement[choice].onChosen === 'function') || typeof this.statement[choice].onChosen !== 'function';

				if (functionReversible) {
					return Promise.resolve();
				} else {
					return Promise.reject('The choice taken is not reversible because it did not defined a `onRevert` function.');
				}
			}
		}
		return Promise.reject('Choice history was empty');
	}

	override async revert(): Promise<void> {
		const choice = this.engine.history('choice')[this.engine.history('choice').length - 1];

		// First, revert the action that was chosen
		if (this.statement[choice] && typeof this.statement[choice].Do === 'string') {
			await this.engine.revert(this.statement[choice].Do, false);
		}
		if (typeof this.statement[choice].onRevert === 'function') {
			await Util.callAsync(this.statement[choice].onRevert, this.engine);
		}

		// Clean up timer if it exists
		if (typeof this.statement.Timer === 'object' && this.statement.Timer !== null) {
			this.engine.global('_ChoiceTimer').pop();
		}

		// If there was a dialog, revert it first
		if (typeof this.statement.Dialog === 'string') {
			const dialogLog = this.engine.component('dialog-log') as { instances?: (callback: (instance: { pop: () => void }) => void) => void } | undefined;
			if (typeof dialogLog !== 'undefined' && dialogLog.instances) {
				dialogLog.instances((instance) => instance.pop());
			}

			// // Revert the dialog that was shown with the choice
			// const dialogAction = this.engine.prepareAction (this.statement.Dialog, { cycle: 'Revert' });
			// return dialogAction.willRevert ().then (() => {
			// 	return dialogAction.revert ().then (() => {
			// 		return dialogAction.didRevert ();
			// 	});
			// });
		}

		// Remove any existing choice container before re-applying
		this.engine.element().find('choice-container').remove();

		// Now re-apply the choice to show it again
		const action = this.engine.prepareAction(this._statement as string, { cycle: 'Application' }) as ActionInstance | null;
		if (action !== null) {
			await action.willApply();
			await action.apply();
			await action.didApply({ updateHistory: false, updateState: false });
		}
	}

	override async didRevert(): Promise<ActionRevertResult> {
		this.engine.global('_choice_just_rolled_back').push(true);
		this.engine.history('choice').pop();
		return { advance: false, step: false };
	}
}

export default Choice;