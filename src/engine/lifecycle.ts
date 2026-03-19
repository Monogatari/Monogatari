import type { VisualNovelEngine } from '../lib/types/Monogatari';
import type { StaticAction, ActionInstance, FancyErrorProps } from '../lib/types';
import type Action from '../lib/Action';

// TODO: We need to decouple these.
import type TypeWriterComponent from '../components/type-writer';
import { $_, Util } from '@aegis-framework/artemis';
import { FancyError } from '../lib/FancyError';

// ============================================================================
// Async Assertion
// ============================================================================

/**
 * @static assertAsync - This function will run any function asynchronously
 * regardless of if the function to be run is async or not.
 *
 * @param {function} callable - The function to run
 * @param {Object} [self=null] - The reference to `this` in the function
 * @param {any[]} [args=null] - The arguments with which to call the function
 *
 * @returns {Promise} - Resolves if the function returned true and rejects if
 * the function returned false.
 */
export function assertAsync (engine: VisualNovelEngine, callable: (...args: unknown[]) => unknown, self: unknown = null, args: unknown[] | null = null): Promise<void> {
	const originalBlockValue = engine.global ('block');

	engine.global ('block', true);

	return new Promise<void> ((resolve, reject) => {
		const result = callable.apply(self, args || []);
		// Check if the function returned a simple boolean
		// if the return value is true, the game will continue
		if (typeof result === 'boolean') {
			if (result) {
				resolve ();
			} else {
				reject ();
			}
		} else if (result !== null && typeof result === 'object') {
			// Check if the result was a promise
			if ('then' in result && typeof result.then === 'function') {
				(result as Promise<unknown>).then((value: unknown) => {
					if (typeof value === 'boolean') {
						if (value) {
							resolve ();
						} else {
							reject ();
						}
					} else {
						resolve ();
					}
				}).catch(reject);
			} else {
				resolve ();
			}
		} else {
			reject ();
		}
	}).finally (() => {
		engine.global ('block', originalBlockValue);
	});
}

// ============================================================================
// Step Navigation
// ============================================================================

/**
 * @static next - Advance to the next statement on the script
 *
 * @returns {void}
 */
export function next (engine: VisualNovelEngine): Promise<void> {
	// Advance 1 step
	const currentStep = engine.state ('step');

	engine.state ({ step: currentStep + 1 });

	const label = engine.label ();
	const step = engine.state ('step');

	return new Promise<void> ((resolve) => {
		// Clear the Stack using a Time Out instead of calling the function
		// directly, preventing an Overflow
		setTimeout (() => {
			engine.run (label[step]).then (() => {
				engine.global ('_engine_block', false);
				resolve ();
			}).catch (() => {
				resolve ();
			});
		}, 0);
	});
}

/**
 * @static revert - Revert to the previous statement on the script
 *
 * @returns {void}
 */
export function previous (engine: VisualNovelEngine): Promise<void> {
	return new Promise<void> ((resolve) => {
		setTimeout (() => {
			engine.revert ().then (() => {
				engine.global ('_engine_block', false);
				resolve ();
			}).catch ((e) => {
				engine.debug.log ('Revert was prevented.\n', e);
				engine.global ('_engine_block', false);

				// The game could not be reverted, either because an
				// action prevented it or because there are no statements
				// left to revert to.
				const currentStep = engine.state ('step') as number;

				if (currentStep > 0) {
					engine.state ({
						step: currentStep - 1
					});
				}

				engine.proceed ({ userInitiated: false, skip: false, autoPlay: false }).then (() => {
					resolve ();
				});
			});
		}, 0);
	});
}

// ============================================================================
// Action Preparation
// ============================================================================

export function prepareAction(engine: VisualNovelEngine, statement: string, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
export function prepareAction(engine: VisualNovelEngine, statement: Record<string, unknown>, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
export function prepareAction(engine: VisualNovelEngine, statement: string | Record<string, unknown>, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null;
export function prepareAction (engine: VisualNovelEngine, statement: unknown, { cycle, extras }: { cycle: 'Application' | 'Revert'; extras?: Record<string, unknown> }): ActionInstance | null {
	let action;
	let interpolatedStatement: string[] | undefined;

	// Use the correct matching function (matchString or matchObject)
	// depending on the type of the current statement. If the statement
	// is a pure js function, it won't be reverted since we don't
	// know what to do to revert it.
	if (typeof statement === 'string') {
		interpolatedStatement = engine.replaceVariables (statement).split (' ');

		// Check if it matches using the matchString method
		action = engine.actions ().find (a => a.matchString (interpolatedStatement!));
	} else if (typeof statement === 'object' && statement !== null) {

		// Check if it matches using the matchObject method
		action = engine.actions ().find (a => a.matchObject (statement as Record<string, unknown>));
	}

	if (typeof action !== 'undefined') {
		const act = new action (typeof statement === 'string' ? interpolatedStatement : statement);

		// The original statement is set just in case the action needs
		// access to it. By this point, statement is known to be string | Record<string, unknown>
		// (functions are handled earlier and returned directly).
		act._setStatement (statement as string | Record<string, unknown>);

		// The current cycle is also set just in case the action needs to
		// know what cycle it's currently being performed.
		act._setCycle (cycle);

		// Monogatari is set as the context of the action so that it can
		// access all its functionalities
		act.setContext (engine);

		act.setExtras(extras || {});

		return act;
	}

	return null;
}

// ============================================================================
// Statement Execution
// ============================================================================

/**
 * @static revert - This is the function that allows to go back in the game
 * by reverting the statements played.
 *
 * @returns {Promise} - Whether the game was able to go back or not
 */
export async function revert (engine: VisualNovelEngine, statement: unknown = null, shouldAdvance = true, shouldStepBack = true): Promise<{ advance: boolean; step: boolean } | void> {
	const actions = engine.actions ();
	const before: Promise<void>[] = actions.map (action => action.beforeRevert ({ advance: shouldAdvance, step: shouldStepBack }));

	await Promise.all (before);

	// Check if we have steps behind us to revert to. If there aren't, then
	// we can't revert since we are already at the first statement.
	let actionToRevert: unknown = null;
	const currentStep = engine.state ('step') as number;
	const currentLabel = engine.state ('label') as string;
	const label = engine.label () as unknown[];

	if (statement !== null) {
		actionToRevert = statement;
	} else if (currentStep >= 1) {
		actionToRevert = label[currentStep - 1];
	} else {
		const jumpHistory = engine.history ('jump') as Array<{ destination: { label: string; step: number }; source: { label: string; step: number } }>;
		const jump = [...jumpHistory].reverse ().find (o => {
			return o.destination.label === currentLabel && o.destination.step === 0;
		});

		if (typeof jump !== 'undefined') {
			engine.state ({
				label: jump.source.label,
				step: jump.source.step
			});
			const newLabel = engine.label () as unknown[];
			const newStep = engine.state ('step') as number;
			actionToRevert = newLabel[newStep];
			engine.debug.debug ('Will revert to previous label.');
		} else {
			engine.debug.debug ('Will not revert since this is the beginning of the game.');
		}
	}

	// Don't allow null as a valid statement
	if (actionToRevert === null || typeof actionToRevert === 'undefined') {
		// Clear the Stack using a Time Out instead of calling
		// the function directly, preventing an Overflow
		const labelArray = engine.label () as unknown[];
		const step = engine.state ('step') as number;

		setTimeout (() => {
			engine.run (labelArray[step]);
		}, 0);

		engine.debug.groupEnd ();

		return Promise.resolve ();
	}

	// If the statement is a pure js function, it won't be reverted since we don't
	// know what to do to revert it.
	if (typeof actionToRevert === 'function') {
		return Promise.reject ();
	}

	const action = prepareAction (engine, actionToRevert as string | Record<string, unknown>, { cycle: 'Revert' });

	if (action === null) {
		return Promise.reject ('The action did not match any of the ones registered.');
	}

	engine.debug.debug ('Reverting Action', actionToRevert);

	engine.debug.groupCollapsed (`Revert Cycle [${(action.constructor as StaticAction).id}]`);

	engine.trigger ('willRevertAction', { action });

	// Run the willRevert method of the action first. This method
	// is usually used to tell whether an action can be reverted
	// or not.
	return (action as Action).willRevert ().then (() => {
		engine.debug.debug ('Action Will Revert');
		// If it can be reverted, then run the revert method
		return action.revert ().then (() => {
			engine.debug.debug ('Action Reverting');
			// If the reversion was successful, run the didRevert
			// function. The action will return a boolean (shouldContinue)
			// specifying if the game should go ahead and revert
			// the previous statement as well or if it should
			// wait instead
			return action.didRevert ().then (({ advance, step }: { advance: boolean; step: boolean }) => {
				engine.debug.debug ('Action Did Revert');

				engine.trigger ('didRevertAction', { action });

				const promises: Promise<void>[] = [];

				for (const act of engine.actions ()) {
					promises.push (act.afterRevert ({ advance, step }));
				}

				return Promise.all (promises).then (() => {
					// Since we reverted correctly, the step should
					// go back.
					const currentStep = engine.state ('step') as number;
					if (step === true && shouldStepBack === true) {
						engine.state ({
							step: currentStep - 1
						});
					}
					// Revert the previous statement if the action
					// told us to.
					if (advance === true && shouldAdvance === true) {
						// Clear the Stack using a Time Out instead
						// of calling the function directly, preventing
						// an Overflow
						setTimeout (() => {
							engine.revert ();
						}, 0);
					}

					engine.debug.groupEnd ();
					return Promise.resolve ({ advance, step });
				});
			});
		});
	}).catch ((e: unknown) => {
		if (typeof e === 'object' || typeof e === 'string') {
			console.error (e);
		}
		// Clear the Stack using a Time Out instead of calling
		// the function directly, preventing an Overflow
		const labelArray = engine.label () as unknown[];
		const step = engine.state ('step') as number;

		setTimeout (() => {
			engine.run (labelArray[step]);
		}, 0);

		engine.debug.groupEnd ();

		return Promise.resolve ();
	});
}

/**
 * @static run - Run a specified statement.
 *
 * @param {string|Object|function} statement - The Monogatari statement to run
 * @param {boolean} advance - Whether the game should advance or wait for user
 * interaction. This parameter is mainly used to prevent the game from advancing
 * when loading the game or performing some actions and we don't want them to
 * affect the game flow.
 *
 * @returns {Promise} - Resolves if the statement was run correctly or rejects
 * if it couldn't be run correctly.
 */
export async function run (engine: VisualNovelEngine, statement: unknown, shouldAdvance = true): Promise<{ advance: boolean }> {
	// Capture current position at the start to detect if another advance happened
	// during async operations (e.g., user click during Notification's willApply)
	const initialStep = engine.state ('step') as number;
	const initialLabel = engine.state ('label') as string;

	const actions = engine.actions ();
	const before: Promise<void>[] = actions.map (action => action.beforeRun ({ advance: shouldAdvance }));

	await Promise.all (before);

	// Don't allow null as a valid statement
	if (statement === null) {
		engine.debug.trace ();
		engine.debug.groupEnd ();
		throw new Error ('Statement was null.');
	}

	engine.debug.debug ('Preparing Action', statement);

	if (typeof statement === 'function') {
		engine.debug.groupCollapsed (`Run Cycle [JS Function]`);

		// Block the game while the function is being run
		engine.global ('block', true);

		// Run the function asynchronously and after it has run, unblock
		// the game so it can continue.
		try {
			const returnValue = await  Util.callAsync (statement as (...args: unknown[]) => unknown, engine);

			engine.global ('block', false);

			engine.debug.groupEnd ();

			if (shouldAdvance && returnValue !== false) {
				// Only advance if we're still on the same step - another action might have
				// already advanced the game (e.g., user clicked during async function)
				const currentStep = engine.state ('step') as number;
				const currentLabel = engine.state ('label') as string;
				if (currentStep === initialStep && currentLabel === initialLabel) {
					// TODO: Do we need to return here? We don't do it in the other run methods.
					return engine.next ().then (() => ({ advance: true }));
				} else {
					engine.debug.debug ('Skipping auto-advance: game already advanced by another action');
				}
			}

			return Promise.resolve ({ advance: false });
		} catch (e: unknown) {
			const error: FancyErrorProps = {
				'Label': String(engine.state ('label')),
				'Step': Number(engine.state ('step')),
				'Help': {
					'_': 'Check the code for your function, there may be additional information in the console.',
				}
			};

			if (e && typeof e === 'object' && 'message' in e) {
				const err = e as Error & { fileName?: string; lineNumber?: number };
				error['Error Message'] = err.message;
				if (err.fileName) error['File Name'] = err.fileName;
				if (err.lineNumber) error['Line Number'] = err.lineNumber;
			} else if (typeof e === 'string') {
				error['Error Message'] = e;
			}

			FancyError.show ('engine:run:function_error', {
				label: String(engine.state ('label')),
				step: Number(engine.state ('step')),
				...error
			});

			engine.debug.trace ();
			engine.debug.groupEnd ();

			return { advance: false };
		};
	}

	const action: Action | null = prepareAction (engine, statement as string | Record<string, unknown>, { cycle: 'Application' });

	if (action === null) {
		throw new Error ('The action did not match any of the ones registered.');
	}

	engine.debug.groupCollapsed (`Run Cycle [${(action.constructor as  StaticAction).id}]`);

	engine.trigger ('willRunAction', { action });

	try {
		engine.debug.debug ('Action Will Apply');
		await action.willApply ();
	} catch (e) {
		engine.debug.debug (`Will Apply Failed.\nReason: ${e}`);
		engine.debug.trace ();
		engine.debug.groupEnd ();
		throw e;
	}

	try {
		engine.debug.debug ('Action Applying');
		await action.apply ();
	} catch (e) {
		engine.debug.debug (`Apply Failed.\nReason: ${e}`);
		engine.debug.trace ();
		engine.debug.groupEnd ();
		throw e;
	}

	// If everything has been run correctly, then run the didApply method.
	// The action will return a boolean (advance) specifying if the game should
	// run the next statement right away or if it should wait instead.
	try {
		const { advance } = await action.didApply ();

		engine.debug.debug ('Action Did Apply');
		engine.trigger ('didRunAction', { action });

		const promises: Promise<void>[] = actions.map (action => action.afterRun ({ advance: advance === true }));

		await Promise.all (promises);

		if (advance === true && shouldAdvance === true) {
			// Only advance if we're still on the same step - another action might have
			// already advanced the game (e.g., user clicked during async willApply)
			const currentStep = engine.state ('step') as number;
			const currentLabel = engine.state ('label') as string;

			if (currentStep === initialStep && currentLabel === initialLabel) {
				engine.debug.debug ('Next action will be run right away');
				await engine.next ();
			} else {
				engine.debug.debug ('Skipping auto-advance: game already advanced by another action');
			}
		}

		engine.debug.groupEnd ();

		return { advance: advance === true };
	} catch (e) {
		engine.debug.debug (`Did Apply Failed.\nReason: ${e}`);
		engine.debug.trace ();
		engine.debug.groupEnd ();
		throw e;
	}
}

// ============================================================================
// High-Level Flow Control
// ============================================================================

export async function proceed (engine: VisualNovelEngine, { userInitiated = false, skip = false, autoPlay = false } = {}): Promise<void> {
	await shouldProceed (engine, { userInitiated, skip, autoPlay });

	engine.global ('_engine_block', true);

	await willProceed (engine);
	await engine.next ();
}

export async function rollback (engine: VisualNovelEngine): Promise<void> {
	const allowRollback = engine.setting ('AllowRollback') === true;

	if (!allowRollback) {
		return;
	}

	const stateObj = engine.state() as { step: number; label: string };

	if (stateObj.step === 0) {
		const jumpHistory = engine.history ('jump') as { destination: { label: string; step: number } }[];
		const jump = [...jumpHistory].reverse ().find (o => {
			return o.destination.label === stateObj.label && o.destination.step === 0;
		});

		if (typeof jump === 'undefined') {
			engine.debug.debug ('Will not attempt rollback since this is the beginning of the game.');
			return;
		}
	}

	await shouldRollback (engine);

	engine.global ('_engine_block', true);

	await willRollback (engine);
	await engine.previous ();
}

// ============================================================================
// Proceed/Rollback Checks
// ============================================================================

/**
 * @static shouldProceed - Check if the game can proceed
 *
 * @returns {Promise} - Resolves if the game can proceed or reject if it
 * can't proceed right now.
 */
export function shouldProceed (engine: VisualNovelEngine, { userInitiated = false, skip = false, autoPlay = false }): Promise<unknown[]> {
	// TODO: This should be removed
	const deprecatedBlocks = engine.global ('block') || engine.global ('_executing_sub_action');

	// Check if the game is visible, if it's not, then it probably is not
	// playing or is looking at some menu and thus the game should not
	// proceed. The game will not proceed if it's blocked or if the distraction
	// free mode is enabled.
	if (!$_('.modal').isVisible ()
		&& !engine.global ('distraction_free')
		&& !deprecatedBlocks
		&& !engine.global ('_engine_block')) {
		const promises = [];

		engine.debug.groupCollapsed ('shouldProceed Check');
		try {

			engine.debug.debug ('Checking Actions');

			// Check action by action if they will allow the game to proceed
			for (const action of engine.actions ()) {
				promises.push (action.shouldProceed ({ userInitiated, skip, autoPlay }).then (() => {
					engine.debug.debug (`OK ${action.id}`);
				}).catch ((e) => {
					engine.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
					return Promise.reject (e);
				}));
			}

			engine.debug.debug ('Checking Components');

			// Check component by component if they will allow the game to proceed
			for (const component of engine.components ()) {
				promises.push (component.shouldProceed ({ userInitiated, skip, autoPlay }).then (() => {
					engine.debug.debug (`OK ${component.tag}`);
				}).catch ((e) => {
					engine.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
					return Promise.reject (e);
				}));
			}
		} catch (e) {
			console.error (e);
			const errorMessage = e instanceof Error ? e.message : String(e);
			FancyError.show ('engine:lifecycle:should_proceed_error', {
				errorMessage: errorMessage
			});
		}

		engine.debug.debug ('Checking Extra Conditions');

		return Promise.all (promises).then ((...args) => {
			engine.debug.groupEnd ();
			return Promise.resolve (...args);
		}).catch ((e) => {
			engine.debug.groupEnd ();
			return Promise.reject (e);
		});
	} else {
		engine.debug.debug({
			'Block': engine.global ('block'),
			'Distraction Free': engine.global ('distraction_free'),
			'Engine Block': engine.global ('_engine_block'),
			'Executing Sub Action': engine.global ('_executing_sub_action'),
			'Modal Visible': $_('.modal').isVisible (),
		});

		return Promise.reject ('Extra condition check failed.');
	}
}

export function willProceed (engine: VisualNovelEngine): Promise<unknown[]> {
	engine.debug.groupCollapsed ('Can proceed check passed, game will proceed.');

	const actions = engine.actions ();
	const components = engine.components ();

	const promises = [];

	try {
		// Check action by action if they will allow the game to proceed
		for (const action of actions) {
			promises.push (action.willProceed ().then (() => {
				engine.debug.debug (`OK ${action.id}`);
			}).catch ((e) => {
				engine.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
				return Promise.reject (e);
			}));
		}

		// Check component by component if they will allow the game to proceed
		for (const component of components) {
			promises.push (component.willProceed ().then (() => {
				engine.debug.debug (`OK ${component.tag}`);
			}).catch ((e) => {
				engine.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
				return Promise.reject (e);
			}));
		}
	} catch (e) {
		console.error (e);

		const errorMessage = e instanceof Error ? e.message : String(e);

		FancyError.show ('engine:lifecycle:will_proceed_error', {
			errorMessage: errorMessage
		});
	}

	return Promise.all (promises).then ((...args) => {
		engine.debug.groupEnd ();
		return Promise.resolve (...args);
	}).catch ((e) => {
		engine.debug.groupEnd ();
		return Promise.reject (e);
	});
}

// ============================================================================
// Typing Control
// ============================================================================

/**
 * @static stopTyping - Stop the typing effect.
 *
 * @param component - A TypeWriter component instance
 * @returns {void}
 */
export function stopTyping (engine: VisualNovelEngine, component: TypeWriterComponent): void {
	// Main differences between instant text & speed text:
	//    Instant Text:
	//      -- Appear instantly & removes all non-node formatting.
	//    Speed Text:
	//      -- Appear gradually at the fastest speed while keeping all non-node formatting.
	//      -- Setting min-speed to -1 or lower results in the benefits of speed text and instant text.
	const instant = engine.setting('InstantText') as boolean;

	// TypeWriter.finish() handles setting finished_typing and triggering events
	component.finish(instant);
}

// ============================================================================
// Rollback Checks
// ============================================================================

/**
 * @static shouldRollback - Check if the game can revert
 *
 * @returns {Promise} - Resolves if the game can be reverted or reject if it
 * can't be reverted right now.
 */
export function shouldRollback (engine: VisualNovelEngine): Promise<unknown[]> {
	// Check if the game is visible, if it's not, then it probably is not
	// playing or is looking at some menu and thus the game should not
	// revert. The game will not revert if it's blocked or if the distraction
	// free mode is enabled.
	if (!engine.global ('distraction_free')
		&& !engine.global ('block')
		&& (!engine.global ('_engine_block') || engine.global ('_executing_sub_action'))) {
		const promises = [];

		engine.debug.groupCollapsed ('shouldRollback Check');

		try {
			// Check action by action if they will allow the game to revert
			for (const action of engine.actions ()) {
				promises.push (action.shouldRollback ().then (() => {
					engine.debug.debug (`OK ${action.id}`);
				}).catch ((e) => {
					engine.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
					return Promise.reject (e);
				}));
			}

			// Check component by component if they will allow the game to revert
			for (const component of engine.components ()) {
				promises.push (component.shouldRollback ().then (() => {
					engine.debug.debug (`OK ${component.tag}`);
				}).catch ((e) => {
					engine.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
					return Promise.reject (e);
				}));
			}
		}  catch (e) {
			console.error (e);

			const errorMessage = e instanceof Error ? e.message : String(e);

			FancyError.show ('engine:lifecycle:should_rollback_error', {
				errorMessage: errorMessage
			});
		}

		return Promise.all (promises).then ((...args) => {
			engine.debug.groupEnd ();
			return Promise.resolve (...args);
		}).catch ((e) => {
			engine.debug.groupEnd ();
			return Promise.reject (e);
		});
	} else {
		return Promise.reject ('Extra condition check failed.');
	}
}

export function willRollback (engine: VisualNovelEngine): Promise<unknown[]> {
	const promises = [];

	engine.debug.groupCollapsed ('Should Rollback Check passed, game will roll back.');

	try {
		// Check action by action if they will allow the game to revert
		for (const action of engine.actions ()) {
			promises.push (action.willRollback ().then (() => {
				engine.debug.debug (`OK ${action.id}`);
			}).catch ((e) => {
				engine.debug.debug (`FAIL ${action.id}\nReason: ${e}`);
				return Promise.reject (e);
			}));
		}

		// Check component by component if they will allow the game to revert
		for (const component of engine.components ()) {
			promises.push (component.willRollback ().then (() => {
				engine.debug.debug (`OK ${component.tag}`);
			}).catch ((e) => {
				engine.debug.debug (`FAIL ${component.tag}\nReason: ${e}`);
				return Promise.reject (e);
			}));
		}
	} catch (e) {
		console.error (e);
		const errorMessage = e instanceof Error ? e.message : String(e);
		FancyError.show ('engine:lifecycle:will_rollback_error', {
			errorMessage: errorMessage
		});
	}

	return Promise.all (promises).then ((...args) => {
		engine.debug.groupEnd ();
		return Promise.resolve (...args);
	}).catch ((e) => {
		engine.debug.groupEnd ();
		return Promise.reject (e);
	});
}
