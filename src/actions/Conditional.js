import { Action } from '../lib/Action';
import { Util } from '@aegis-framework/artemis';
import { FancyError } from '../lib/FancyError';

export class Conditional extends Action {

	static setup () {
		// In here we'll save up what branch was taken every time we execute a
		// conditional.
		this.engine.history ('conditional');

		// Whether a conditional that was run is pending rollback on the next time
		// a revert is issued.
		this.engine.global ('_conditional_pending_rollback', []);

		// Whether a conditional was just reverted
		this.engine.global ('_conditional_just_rolled_back', []);

		return Promise.resolve();
	}

	static reset () {
		// Whether a conditional that was run is pending rollback on the next time
		// a revert is issued.
		this.engine.global ('_conditional_pending_rollback', []);

		// Whether a conditional was just reverted
		this.engine.global ('_conditional_just_rolled_back', []);

		return Promise.resolve();
	}

	static matchObject (statement) {
		return typeof statement.Conditional !== 'undefined';
	}

	static afterRevert ({ advance, step }) {
		// Prevent modifying the history if the action that was just reverted was
		// this conditional
		if (this.engine.global ('_conditional_just_rolled_back').pop ()) {
			return Promise.resolve ();
		}

		while (this.engine.global ('_conditional_pending_rollback').pop ()) {
			const currentStatement = this.engine.label () [this.engine.state ('step')];
			if (typeof currentStatement !== 'undefined') {
				if (typeof currentStatement.Conditional === 'object') {
					this.engine.history ('conditional').pop ();
				}
			}
		}

		return Promise.resolve ();
	}

	static beforeRun () {
		// const restoringState = this.engine.global ('_restoring_state');

		// if (!restoringState) {
		this.engine.global ('_conditional_pending_rollback').pop ();
		// }

		return Promise.resolve ();
	}

	constructor (statement) {
		super ();
		this.statement = statement.Conditional;
		this.branch = '';
		this.result = { advance: true, step: false };
	}

	apply () {
		return new Promise ((resolve, reject) => {

			// Call the condition function. Since the function might use a
			// Promise.reject () to return as false, we also define a catch
			// block to run the False branch of the condition.
			Util.callAsync (this.statement.Condition, this.engine).then ((returnValue) => {
				this.engine.global ('_executing_sub_action', true);

				if (typeof returnValue === 'number') {
					if (returnValue < 0) {
						FancyError.show (
							`Conditional condition returned a negative numer "${returnValue}".`,
							`The \`Condition\` function returned "${returnValue}" and only positive numbers are allowed for numeric values.`,
							{
								'Problematic Value': returnValue,
								'You may have meant one of these': Object.keys(this.statement).filter (b => b !== 'Condition')
							}
						);
						reject ('Invalid negative value');
					}

					if (!Number.isInteger(returnValue)) {
						FancyError.show (
							`Conditional condition returned a non-integer value "${returnValue}".`,
							`The \`Condition\` function returned "${returnValue}" and only integer numbers are allowed for numeric values.`,
							{
								'Problematic Value': returnValue,
								'You may have meant one of these': Object.keys(this.statement).filter (b => b !== 'Condition')
							}
						);
						reject ('Invalid non-integer value');
					}

					returnValue = `${returnValue}`;
				}

				// Check if the function returned true so we run the True branch
				// of the conditional. If false is returned, we run the False
				// branch of the conditional and if a string is returned, we use
				// it as a key so we run the branch that has that key
				if (returnValue === true) {
					this.branch = 'True';
					resolve (this.engine.run (this.statement.True).then ((result) => {
						this.engine.global ('_executing_sub_action', false);
						this.result = result;
						return Promise.resolve (result);
					}));
				} else if (typeof returnValue === 'string') {
					const branch = this.statement[returnValue];

					if (typeof branch === 'undefined') {
						FancyError.show (
							`Conditional attempted to execute a non existent branch "${returnValue}"`,
							`The \`Condition\` function returned "${returnValue}" as the branch to execute but it does not exist.`,
							{
								'Problematic Branch': returnValue,
								'You may have meant one of these': Object.keys(this.statement).filter (b => b !== 'Condition')
							}
						);
						reject ('Non existent branch');
					}

					this.branch = returnValue;
					resolve (this.engine.run (branch).then ((result) => {
						this.engine.global ('_executing_sub_action', false);
						this.result = result;
						return Promise.resolve (result);
					}));
				} else {
					this.branch = 'False';
					resolve (this.engine.run (this.statement.False).then ((result) => {
						this.engine.global ('_executing_sub_action', false);
						this.result = result;
						return Promise.resolve (result);
					}));
				}
			}).catch (() => {
				this.branch = 'False';
				resolve (this.engine.run (this.statement.False).then ((result) => {
					this.engine.global ('_executing_sub_action', false);
					this.result = result;
					return Promise.resolve (result);
				}));
			});
		});
	}

	didApply () {
		// const restoringState = this.engine.global ('_restoring_state');

		// if (!restoringState) {
		if (!this.result.advance) {
			this.engine.global ('_conditional_pending_rollback').push (true);
		}

		this.engine.history ('conditional').push (this.branch);
		// }

		this.engine.global ('_executing_sub_action', false);

		return Promise.resolve ({ advance: false });
	}

	willRevert () {
		if (this.engine.history ('conditional').length > 0) {
			const conditional = this.engine.history ('conditional')[this.engine.history ('conditional').length - 1];
			if (this.statement[conditional] !== 'undefined') {
				return Promise.resolve ();
			}
		}
		return Promise.reject ('Conditional history was empty.');
	}

	revert () {
		const conditional = this.engine.history ('conditional')[this.engine.history ('conditional').length - 1];
		this.engine.global ('_executing_sub_action', true);
		return this.engine.revert (this.statement[conditional]).then ((result) => {
			this.engine.global ('_executing_sub_action', false);
			this.result = result;
			return Promise.resolve (result);
		});
	}

	didRevert () {
		this.engine.global ('_conditional_pending_rollback').push (true);
		this.engine.global ('_conditional_just_rolled_back').push (true);
		return Promise.resolve ({ advance: false, step: false });
	}
}

Conditional.id = 'Conditional';

export default Conditional;