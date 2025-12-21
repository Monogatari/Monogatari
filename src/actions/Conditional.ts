import Action from '../lib/Action';
import { Util } from '@aegis-framework/artemis';
import { FancyError } from '../lib/FancyError';
import { ActionApplyResult, ActionRevertResult } from '../lib/types';

export class Conditional extends Action {

	static override id = 'Conditional';

	static override async setup(): Promise<void> {
		// In here we'll save up what branch was taken every time we execute a
		// conditional.
		this.engine.history('conditional');

		// Whether a conditional that was run is pending rollback on the next time
		// a revert is issued.
		this.engine.global('_conditional_pending_rollback', []);

		// Whether a conditional was just reverted
		this.engine.global('_conditional_just_rolled_back', []);
	}

	static override async reset(): Promise<void> {
		// Whether a conditional that was run is pending rollback on the next time
		// a revert is issued.
		this.engine.global('_conditional_pending_rollback', []);

		// Whether a conditional was just reverted
		this.engine.global('_conditional_just_rolled_back', []);
	}

	static override matchObject(statement: any): boolean {
		return typeof statement.Conditional !== 'undefined';
	}

	static override async afterRevert(): Promise<void> {
		// Prevent modifying the history if the action that was just reverted was
		// this conditional
		const justRolledBack = this.engine.global('_conditional_just_rolled_back') as boolean[];
		if (justRolledBack.pop()) {
			return Promise.resolve();
		}

		const pendingRollback = this.engine.global('_conditional_pending_rollback') as boolean[];
		while (pendingRollback.pop()) {
			const currentStatement = this.engine.label()[this.engine.state('step') as number] as { Conditional?: object } | undefined;
			if (typeof currentStatement !== 'undefined' && currentStatement !== null) {
				if (typeof currentStatement.Conditional === 'object') {
					this.engine.history('conditional').pop();
				}
			}
		}
	}

	static override async beforeRun(): Promise<void> {
		// const restoringState = this.engine.global ('_restoring_state');

		// if (!restoringState) {
		const pendingRollback = this.engine.global('_conditional_pending_rollback') as boolean[];
		pendingRollback.pop();
		// }
	}

	statement: any;
	branch: string;
	result: { advance: boolean; step: boolean };

	constructor(statement: any) {
		super();
		this.statement = statement.Conditional;
		this.branch = '';
		this.result = { advance: true, step: false };
	}

	override async apply(): Promise<void> {
		// Call the condition function. Since the function might use a
		// Promise.reject () to return as false, we also define a catch
		// block to run the False branch of the condition.
		try {
			let returnValue = await Util.callAsync(this.statement.Condition, this.engine);
			this.engine.global('_executing_sub_action', true);

			if (typeof returnValue === 'number') {
				if (returnValue < 0) {
					FancyError.show('action:conditional:negative_value', {
						value: returnValue,
						availableBranches: Object.keys(this.statement).filter(b => b !== 'Condition')
					});
					throw new Error('Invalid negative value');
				}

				if (!Number.isInteger(returnValue)) {
					FancyError.show('action:conditional:non_integer_value', {
						value: returnValue,
						availableBranches: Object.keys(this.statement).filter(b => b !== 'Condition')
					});
					throw new Error('Invalid non-integer value');
				}

				returnValue = `${returnValue}`;
			}

				// Check if the function returned true so we run the True branch
			// of the conditional. If false is returned, we run the False
			// branch of the conditional and if a string is returned, we use
			// it as a key so we run the branch that has that key
			if (returnValue === true) {
				this.branch = 'True';
				const runResult = await this.engine.run(this.statement.True);
				this.result = { ...runResult, step: false };
				this.engine.global('_executing_sub_action', false);
			} else if (typeof returnValue === 'string') {
				const branch = this.statement[returnValue];

				if (typeof branch === 'undefined') {
					FancyError.show('action:conditional:branch_not_found', {
						branch: returnValue,
						availableBranches: Object.keys(this.statement).filter(b => b !== 'Condition')
					});
					throw new Error('Non existent branch');
				}

				this.branch = returnValue;
				const runResult = await this.engine.run(branch);
				this.result = { ...runResult, step: false };
				this.engine.global('_executing_sub_action', false);
			} else {
				this.branch = 'False';
				const runResult = await this.engine.run(this.statement.False);
				this.result = { ...runResult, step: false };
				this.engine.global('_executing_sub_action', false);
			}
		} catch (e) {
			this.branch = 'False';
			const runResult = await this.engine.run(this.statement.False);
			this.result = { ...runResult, step: false };
			this.engine.global('_executing_sub_action', false);
		}
	}

	override async didApply({ updateHistory = true } = {}): Promise<ActionApplyResult> {
		// const restoringState = this.engine.global ('_restoring_state');

		// if (!restoringState) {
		if (!this.result.advance) {
			const pendingRollback = this.engine.global('_conditional_pending_rollback') as boolean[];
			pendingRollback.push(true);
		}

		if (updateHistory) {
			(this.engine.history('conditional') as string[]).push(this.branch);
		}
		// }

		this.engine.global('_executing_sub_action', false);

		return { advance: false };
	}

	override async willRevert(): Promise<void> {
		const conditionalHistory = this.engine.history('conditional') as string[];
		if (conditionalHistory.length > 0) {
			const conditional = conditionalHistory[conditionalHistory.length - 1];
			if (typeof this.statement[conditional] !== 'undefined') {
				return Promise.resolve();
			}
		}
		throw new Error('Conditional history was empty.');
	}

	override async revert(): Promise<void> {
		const conditionalHistory = this.engine.history('conditional') as string[];
		const conditional = conditionalHistory[conditionalHistory.length - 1];
		this.engine.global('_executing_sub_action', true);
		const revertResult = await this.engine.revert(this.statement[conditional]);
		if (revertResult) {
			this.result = revertResult;
		}
		this.engine.global('_executing_sub_action', false);
	}

	override async didRevert(): Promise<ActionRevertResult> {
		const pendingRollback = this.engine.global('_conditional_pending_rollback') as boolean[];
		const justRolledBack = this.engine.global('_conditional_just_rolled_back') as boolean[];
		pendingRollback.push(true);
		justRolledBack.push(true);
		return { advance: false, step: false };
	}
}

export default Conditional;